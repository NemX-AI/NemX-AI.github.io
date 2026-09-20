import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import './symbiosis-demo.css';

const intentPath = 'M16 112C122 4 438 4 544 112';
const actionPath = 'M544 148C438 256 122 256 16 148';
const trailSegments = Array.from({ length: 10 }, (_, index) => 9 - index);

type TrailStyle = CSSProperties & { '--trail-delay': string; '--direction-delay'?: string };

function LoopSignal({ path, returning, glowId }: { path: string; returning?: boolean; glowId: string }) {
  return (
    <g className="loop-signal" style={{ '--direction-delay': returning ? '4s' : '0s' } as CSSProperties}>
      <path d={path} pathLength="100" className="loop-signal-glow" filter={`url(#${glowId})`} />
      {trailSegments.map((index) => (
        <path
          key={index}
          d={path}
          pathLength="100"
          className="loop-signal-segment"
          style={{
            '--trail-delay': `${index * 0.045}s`,
            strokeOpacity: (1 - index / 10) ** 1.5,
            strokeWidth: 3.4 - index * 0.18,
          } as TrailStyle}
        />
      ))}
    </g>
  );
}

export default function SymbiosisDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  const glowId = useId();
  const moving = playing && inView && visible && reducedMotion === false;

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return (
    <div ref={rootRef} id="symbiosis-demo" tabIndex={-1} className="symbiosis-demo" data-playing={moving}>
      <header className="symbiosis-demo-heading">
        <div>
          <p className="content-overline">How symbiosis works</p>
          <h3>A continuous exchange.</h3>
        </div>
        <p>Your intent guides the system. Its actions invite your feedback. Each exchange helps it adapt to you.</p>
      </header>

      <div className="symbiosis-loop-layout" role="img" aria-label="Human intent and feedback travel along the upper loop to AI. AI responds with action along the lower loop. Each arrival gently highlights the receiving side. Human and AI learn and adapt together.">
        <div className="loop-participant loop-human" aria-hidden="true">
          <div className="loop-node">
            <span className="loop-reception loop-reception-outer" />
            <span className="loop-reception loop-reception-inner" />
            <span className="loop-node-name">Human</span>
          </div>
          <p>Intent &amp;<br />judgment</p>
        </div>

        <div className="loop-connection" aria-hidden="true">
          <p className="loop-path-label">Intent &amp; feedback</p>
          <div className="loop-drawing">
            <svg viewBox="0 0 560 260" fill="none" focusable="false">
              <defs>
                <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              <path d={intentPath} className="loop-track" />
              <path d={actionPath} className="loop-track" />
              <LoopSignal path={intentPath} glowId={glowId} />
              <LoopSignal path={actionPath} glowId={glowId} returning />
              <path className="loop-arrow" d="m533 110 11 2-2-11M27 150l-11-2 2 11" />
            </svg>
            <p className="loop-shared-copy"><span className="loop-learn">Learn.</span> <span className="loop-adapt">Adapt.</span><strong>Together.</strong></p>
          </div>
          <p className="loop-path-label">Action</p>
        </div>

        <div className="loop-participant loop-ai" aria-hidden="true">
          <div className="loop-node">
            <span className="loop-reception loop-reception-outer" />
            <span className="loop-reception loop-reception-inner" />
            <span className="loop-node-name">AI</span>
          </div>
          <p>Learning &amp;<br />action</p>
        </div>
      </div>

      {!reducedMotion && <div className="loop-playback">
        <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause symbiosis animation' : 'Play symbiosis animation'}>
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}<span>{playing ? 'Pause' : 'Play'}</span>
        </button>
      </div>}
    </div>
  );
}
