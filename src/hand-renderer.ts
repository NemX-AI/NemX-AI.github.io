import {
  Mesh,
  NoColorSpace,
  NoToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  VideoTexture,
  WebGLRenderer,
} from 'three';
import { HANDS_OPENING_PROGRESS } from './hero-choreography';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uHands;
  varying vec2 vUv;

  void main() {
    // Both halves share one decoder, so the silhouette never drifts from the hands.
    vec2 colorUv = vec2(vUv.x, 0.5 + vUv.y * 0.5);
    vec2 matteUv = vec2(vUv.x, vUv.y * 0.5);
    vec3 color = texture2D(uHands, colorUv).rgb;
    float alpha = texture2D(uHands, matteUv).r;
    alpha = smoothstep(0.02, 0.98, alpha);
    gl_FragColor = vec4(color, alpha);
  }
`;

type Painter = {
  render: () => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

function createWebGLPainter(canvas: HTMLCanvasElement, video: HTMLVideoElement): Painter {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
    premultipliedAlpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NoToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // The upper half is decontaminated RGB; the lower half is a linear alpha matte.
  // Keep both as data to preserve the source colors and the white robot highlights.
  const texture = new VideoTexture(video);
  texture.colorSpace = NoColorSpace;
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    uniforms: { uHands: { value: texture } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new Mesh(geometry, material));

  return {
    render: () => {
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    },
    resize: (width, height) => renderer.setSize(width, height, false),
    dispose: () => {
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

// Used when WebGL is unavailable (blocklisted GPU, hardware acceleration off).
// Composites the same colour/matte halves on the CPU.

function create2DPainter(canvas: HTMLCanvasElement, video: HTMLVideoElement): Painter {
  const ctx = canvas.getContext('2d');
  const work = document.createElement('canvas');
  const workCtx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx || !workCtx) throw new Error('Canvas 2D unavailable');

  return {
    render: () => {
      const halfHeight = video.videoHeight / 2;
      if (!video.videoWidth || !halfHeight) return;
      const w = Math.min(video.videoWidth, canvas.width);
      const h = Math.max(1, Math.round((w * halfHeight) / video.videoWidth));
      if (work.width !== w || work.height !== h * 2) {
        work.width = w;
        work.height = h * 2;
      }
      // Draw each half on its own so scaling never blends colour into matte at the seam.
      workCtx.drawImage(video, 0, 0, video.videoWidth, halfHeight, 0, 0, w, h);
      workCtx.drawImage(video, 0, halfHeight, video.videoWidth, halfHeight, 0, h, w, h);
      const frame = workCtx.getImageData(0, 0, w, h * 2);
      const px = frame.data;
      const matteOffset = w * h * 4;
      for (let i = 0; i < matteOffset; i += 4) {
        // smoothstep(0.02, 0.98, matte), matching the WebGL shader.
        const t = Math.min(1, Math.max(0, (px[matteOffset + i] / 255 - 0.02) / 0.96));
        px[i + 3] = t * t * (3 - 2 * t) * 255;
      }
      workCtx.putImageData(frame, 0, 0, 0, 0, w, h);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(work, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    },
    resize: (width, height) => {
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    },
    dispose: () => {
      work.width = 0;
      work.height = 0;
    },
  };
}

export function createHandRenderer(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  onReady: (ready: boolean) => void,
  onFrame?: (progress: number) => void,
) {
  let painter: Painter;
  try {
    painter = createWebGLPainter(canvas, video);
  } catch {
    painter = create2DPainter(canvas, video);
  }

  let stopped = false;
  let contextLost = false;
  let inView = false;
  let frameHandle: number | undefined;
  let frameIsVideoCallback = false;
  let lastTime = -1;
  let hasFrame = false;
  let openingPending = true;
  let playbackBlocked = false;

  const prepareOpening = () => {
    if (!openingPending || !Number.isFinite(video.duration) || video.duration <= 0) return;
    openingPending = false;
    video.currentTime = video.duration * HANDS_OPENING_PROGRESS;
  };

  const draw = () => {
    if (stopped || contextLost || openingPending || playbackBlocked || video.seeking
      || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    painter.render();
    if (Number.isFinite(video.duration) && video.duration > 0) {
      onFrame?.(video.currentTime / video.duration);
    }
    if (!hasFrame) {
      hasFrame = true;
      onReady(true);
    }
  };

  const cancelFrame = () => {
    if (frameHandle === undefined) return;
    if (frameIsVideoCallback) video.cancelVideoFrameCallback(frameHandle);
    else cancelAnimationFrame(frameHandle);
    frameHandle = undefined;
  };

  const scheduleFrame = () => {
    if (stopped || contextLost || !inView || document.hidden || video.paused) return;
    if (typeof video.requestVideoFrameCallback === 'function') {
      frameIsVideoCallback = true;
      frameHandle = video.requestVideoFrameCallback(() => {
        frameHandle = undefined;
        draw();
        scheduleFrame();
      });
    } else {
      frameIsVideoCallback = false;
      frameHandle = requestAnimationFrame(() => {
        frameHandle = undefined;
        if (video.currentTime !== lastTime) {
          draw();
          lastTime = video.currentTime;
        }
        scheduleFrame();
      });
    }
  };

  const play = () => {
    if (!stopped && !contextLost && inView && !document.hidden) {
      prepareOpening();
      if (openingPending) return;
      void video.play().catch(() => {
        if (stopped || contextLost || !inView || document.hidden) return;
        playbackBlocked = true;
        hasFrame = false;
        onReady(false);
      });
    }
  };
  const onPlaying = () => { playbackBlocked = false; cancelFrame(); draw(); scheduleFrame(); };
  const syncPlayback = () => {
    cancelFrame();
    if (document.hidden || contextLost || !inView) {
      video.pause();
      draw();
    } else play();
  };
  const onLoaded = () => { prepareOpening(); draw(); syncPlayback(); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    painter.resize(Math.max(1, width), Math.max(1, height));
    draw();
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    hasFrame = false;
    cancelFrame();
    video.pause();
    onReady(false);
  };
  const onContextRestored = () => { contextLost = false; resize(); syncPlayback(); };
  const onError = () => { cancelFrame(); hasFrame = false; onReady(false); };

  const observer = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  });
  observer.observe(canvas);
  visibilityObserver.observe(canvas);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  video.addEventListener('loadedmetadata', prepareOpening);
  video.addEventListener('loadeddata', onLoaded);
  video.addEventListener('playing', onPlaying);
  video.addEventListener('seeked', draw);
  video.addEventListener('error', onError);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pointerdown', play, { passive: true });
  video.muted = true;
  prepareOpening();
  resize();
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoaded();
  else play();

  return () => {
    stopped = true;
    cancelFrame();
    observer.disconnect();
    visibilityObserver.disconnect();
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    video.removeEventListener('loadedmetadata', prepareOpening);
    video.removeEventListener('loadeddata', onLoaded);
    video.removeEventListener('playing', onPlaying);
    video.removeEventListener('seeked', draw);
    video.removeEventListener('error', onError);
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('pointerdown', play);
    video.pause();
    painter.dispose();
  };
}
