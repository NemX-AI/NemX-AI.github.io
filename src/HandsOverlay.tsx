import { useEffect, useRef, useState } from 'react';

export default function HandsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    import('./hand-renderer').then(({ createHandRenderer }) => {
      if (cancelled) return;
      try {
        dispose = createHandRenderer(canvas, video, setReady);
      } catch {
        setReady(false);
      }
    }).catch(() => setReady(false));

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className="hands-overlay" aria-hidden="true">
      <div className="hands-frame" data-ready={ready}>
        <img
          className="hands-poster"
          src="/media/hands-poster.webp"
          width="1920"
          height="640"
          alt=""
          fetchPriority="high"
          draggable={false}
        />
        <canvas ref={canvasRef} className="hands-canvas" />
      </div>
      <video
        ref={videoRef}
        src="/media/hands-rgba.mp4?v=2"
        className="hands-source"
        preload="auto"
        muted
        playsInline
        loop
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}
