import { useEffect, useRef, useState, type RefObject } from 'react';
import { getHeroReveal } from './hero-choreography';

export default function HandsOverlay({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || fallback) return;

    const onReady = (isReady: boolean) => {
      if (cancelled) return;
      setReady(isReady);
      setFallback(!isReady);
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
  }, [sceneRef, fallback]);

  useEffect(() => {
    if (!fallback) return;
    const scene = sceneRef.current;
    const poster = posterRef.current;
    const frame = poster?.parentElement;
    if (!scene || !poster || !frame) return;

    // WeChat/iOS can reject all video autoplay (including muted video). Animate
    // the existing contact image instead: no media permission or tap required.
    let elapsed = 0;
    let previous: number | undefined;
    let raf: number | undefined;
    let inView = false;
    const reveal = (value: number) => {
      scene.style.setProperty('--hero-reveal', String(value));
      frame.style.setProperty('--hands-opening', String(value));
    };
    const tick = (now: number) => {
      if (previous !== undefined) elapsed += now - previous;
      previous = now;
      reveal(getHeroReveal(0.5 + Math.min(elapsed, 6000) / 12000));
      raf = elapsed < 6000 ? requestAnimationFrame(tick) : undefined;
    };
    const sync = () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      raf = undefined;
      previous = undefined;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { reveal(1); return; }
      if (inView && !document.hidden && poster.complete && poster.naturalWidth && elapsed < 6000) {
        raf = requestAnimationFrame(tick);
      }
    };
    const onError = () => reveal(1);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    reveal(0);
    observer.observe(frame);
    poster.addEventListener('load', sync);
    poster.addEventListener('error', onError);
    document.addEventListener('visibilitychange', sync);
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      observer.disconnect();
      poster.removeEventListener('load', sync);
      poster.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [sceneRef, fallback]);

  return (
    <div className="hands-overlay" aria-hidden="true">
      <div className="hands-frame" data-ready={ready && !fallback} data-fallback={fallback}>
        <img
          ref={posterRef}
          className="hands-poster hands-poster-left"
          src="/media/hands-contact.webp"
          width="1920"
          height="640"
          alt=""
          fetchPriority="high"
          draggable={false}
        />
        <img className="hands-poster hands-poster-right" src="/media/hands-contact.webp" width="1920" height="640" alt="" draggable={false} />
        <canvas ref={canvasRef} className="hands-canvas" />
      </div>
      {!fallback && <video
        ref={videoRef}
        src="/media/hands-rgba.mp4?v=2"
        className="hands-source"
        preload="auto"
        autoPlay
        muted
        playsInline
        loop
        tabIndex={-1}
        disablePictureInPicture
      />}
    </div>
  );
}
