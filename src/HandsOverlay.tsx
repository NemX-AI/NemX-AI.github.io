import { useEffect, useRef, useState, type RefObject } from 'react';
import { getHeroReveal } from './hero-choreography';

export default function HandsOverlay({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const onReady = (isReady: boolean) => {
      if (cancelled) return;
      setReady(isReady);
      setFallback(!isReady);
      // A blocked or failed video must leave the site's copy readable.
      if (!isReady) sceneRef.current?.style.setProperty('--hero-reveal', '1');
    };

    import('./hand-renderer').then(({ createHandRenderer }) => {
      if (cancelled) return;
      try {
        dispose = createHandRenderer(canvas, video, onReady, (progress) => {
          sceneRef.current?.style.setProperty('--hero-reveal', String(getHeroReveal(progress)));
        });
      } catch {
        onReady(false);
      }
    }).catch(() => onReady(false));

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [sceneRef]);

  return (
    <div className="hands-overlay" aria-hidden="true">
      <div className="hands-frame" data-ready={ready}>
        <img
          className="hands-poster"
          src={fallback ? '/media/hands-poster.webp' : '/media/hands-contact.webp'}
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
