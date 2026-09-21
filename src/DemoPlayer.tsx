import { useEffect, useRef, useState } from 'react';
import type { Demo } from './demos';
import { createDemoPlayback, type DemoPlaybackState } from './demo-playback';
import DemoDetail from './DemoDetail';

const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function DemoPlayer({ demo, onDismiss }: { demo: Demo; onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<ReturnType<typeof createDemoPlayback> | null>(null);
  const [failed, setFailed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [speed, setSpeed] = useState<DemoPlaybackState>({ rate: demo.playback.defaultRate, automatic: true });
  const hasSegments = Boolean(demo.playback.segments?.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    const playback = createDemoPlayback(video, demo.playback, (next) => {
      setSpeed((previous) => previous.rate === next.rate && previous.automatic === next.automatic ? previous : next);
    });
    playbackRef.current = playback;

    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    void video?.play().catch(() => {});

    return () => {
      playback.dispose();
      playbackRef.current = null;
      video?.pause();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, [demo]);

  return (
    <dialog
      ref={dialogRef}
      className={`demo-dialog${detailOpen ? ' demo-dialog--details' : ''}`}
      aria-labelledby="demo-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onDismiss();
      }}
    >
      <div className="demo-dialog-header">
        <h2 id="demo-title">{demo.label}</h2>
        <button type="button" className="demo-close" onClick={onDismiss} aria-label="Close video" autoFocus>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <video
        ref={videoRef}
        className="demo-video"
        src={demo.src}
        width={demo.width}
        height={demo.height}
        controls
        autoPlay
        playsInline
        preload="metadata"
        aria-label={`${demo.label} demo video`}
        onError={() => setFailed(true)}
      />
      <div className="demo-playback-controls">
        {demo.detailRegion && (
          <button type="button" className="demo-detail-toggle" aria-expanded={detailOpen}
            aria-controls="demo-text-detail" disabled={failed} onClick={() => setDetailOpen((open) => !open)}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m15.5 15.5 5 5M10.5 7.5v6m-3-3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {detailOpen ? 'Hide details' : 'Text details'}
          </button>
        )}
        <label className="demo-speed">
          <span>Speed</span>
          <select
            aria-label="Playback speed"
            value={hasSegments && speed.automatic ? 'auto' : String(speed.rate)}
            onChange={(event) => playbackRef.current?.setRate(event.target.value === 'auto' ? null : Number(event.target.value))}
            disabled={failed}
          >
            {hasSegments && <option value="auto">Auto ({speed.rate}×)</option>}
            {!speedOptions.includes(speed.rate) && <option value={speed.rate}>{speed.rate}×</option>}
            {speedOptions.map((rate) => <option key={rate} value={rate}>{rate}×{rate === 1 ? ' · Normal' : ''}</option>)}
          </select>
        </label>
      </div>
      {detailOpen && demo.detailRegion && <DemoDetail videoRef={videoRef} region={demo.detailRegion} />}
      {failed && (
        <p className="demo-error" role="alert">
          This video could not be loaded. <a href={demo.src}>Open video</a>
        </p>
      )}
    </dialog>
  );
}
