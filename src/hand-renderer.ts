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

export function createHandRenderer(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  onReady: (ready: boolean) => void,
) {
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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stopped = false;
  let contextLost = false;
  let frameHandle: number | undefined;
  let frameIsVideoCallback = false;
  let lastTime = -1;
  let hasFrame = false;

  const draw = () => {
    if (stopped || contextLost || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    texture.needsUpdate = true;
    renderer.render(scene, camera);
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
    if (stopped || contextLost || document.hidden || video.paused) return;
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
    if (!stopped && !contextLost && !document.hidden && !reducedMotion.matches) {
      void video.play().catch(() => draw());
    }
  };
  const onPlaying = () => { cancelFrame(); scheduleFrame(); };
  const syncPlayback = () => {
    cancelFrame();
    if (document.hidden || reducedMotion.matches || contextLost) {
      video.pause();
      if (reducedMotion.matches && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(4.8, video.duration);
      }
      draw();
    } else play();
  };
  const onLoaded = () => { draw(); syncPlayback(); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
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
  const onError = () => { cancelFrame(); onReady(false); };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  video.addEventListener('loadeddata', onLoaded);
  video.addEventListener('playing', onPlaying);
  video.addEventListener('seeked', draw);
  video.addEventListener('error', onError);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pointerdown', play, { passive: true });
  reducedMotion.addEventListener('change', syncPlayback);
  video.muted = true;
  resize();
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoaded();
  else play();

  return () => {
    stopped = true;
    cancelFrame();
    observer.disconnect();
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    video.removeEventListener('loadeddata', onLoaded);
    video.removeEventListener('playing', onPlaying);
    video.removeEventListener('seeked', draw);
    video.removeEventListener('error', onError);
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('pointerdown', play);
    reducedMotion.removeEventListener('change', syncPlayback);
    video.pause();
    texture.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
