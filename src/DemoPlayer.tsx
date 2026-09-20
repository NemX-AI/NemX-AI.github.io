import { useEffect, useRef, useState } from 'react';
import type { Demo } from './demos';

export default function DemoPlayer({ demo, onDismiss }: { demo: Demo; onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog) return;

    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    void video?.play().catch(() => {});

    return () => {
      video?.pause();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="demo-dialog"
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
      {failed && (
        <p className="demo-error" role="alert">
          This video could not be loaded. <a href={demo.src}>Open video</a>
        </p>
      )}
    </dialog>
  );
}
