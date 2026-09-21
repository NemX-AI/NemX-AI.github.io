import { useEffect, useRef, type RefObject } from 'react';

export type DemoDetailRegion = { x: number; y: number; width: number; height: number };

export default function DemoDetail({ videoRef, region }: {
  videoRef: RefObject<HTMLVideoElement | null>;
  region: DemoDetailRegion;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!video || !canvas || !context) return;

    let frame: number | undefined;
    const hasVideoFrames = typeof video.requestVideoFrameCallback === 'function';
    const draw = () => {
      if (video.readyState < 2 || video.seeking || !video.videoWidth) return;
      const width = Math.round(video.videoWidth * region.width);
      const height = Math.round(video.videoHeight * region.height);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.drawImage(video,
        video.videoWidth * region.x, video.videoHeight * region.y, width, height,
        0, 0, width, height);
    };
    const tick = () => {
      frame = undefined;
      draw();
      schedule();
    };
    const schedule = () => {
      if (frame !== undefined || video.paused || video.ended || document.hidden) return;
      frame = hasVideoFrames ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame === undefined) return;
      if (hasVideoFrames) video.cancelVideoFrameCallback(frame);
      else cancelAnimationFrame(frame);
      frame = undefined;
    };
    const refresh = () => { draw(); schedule(); };
    const pause = () => { stop(); draw(); };
    const onVisibility = () => document.hidden ? stop() : refresh();
    const refreshEvents = ['loadeddata', 'seeked', 'playing', 'timeupdate'];
    const stopEvents = ['pause', 'ended', 'emptied'];
    refreshEvents.forEach((event) => video.addEventListener(event, refresh));
    stopEvents.forEach((event) => video.addEventListener(event, pause));
    document.addEventListener('visibilitychange', onVisibility);
    refresh();

    return () => {
      stop();
      refreshEvents.forEach((event) => video.removeEventListener(event, refresh));
      stopEvents.forEach((event) => video.removeEventListener(event, pause));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [videoRef, region]);

  return (
    <section id="demo-text-detail" className="demo-detail" aria-label="Magnified video text">
      <div className="demo-detail-heading">
        <h3>AI analysis · magnified</h3>
        <p id="demo-detail-hint">Swipe or scroll sideways to read the full panel.</p>
      </div>
      <div className="demo-detail-scroll" tabIndex={0} role="region" aria-label="Video text detail" aria-describedby="demo-detail-hint">
        <canvas ref={canvasRef} className="demo-detail-canvas" width={1848} height={288}
          role="img" aria-label="Live magnified view of the video's AI analysis panel" />
      </div>
    </section>
  );
}
