import { demos, type Demo } from './demos';
import SymbiosisDemo from './SymbiosisDemo';

const directions = [
  {
    id: 'eeg-models',
    name: 'EEG Models',
    title: 'Understand the signal.',
    description: 'We are developing foundation models that learn from EEG across people, tasks, and devices. They form the foundation for interpreting neural activity and understanding human intent.',
  },
  {
    id: 'bci',
    name: 'Brain-computer interfaces',
    title: 'Connect intent to action.',
    description: 'We are exploring interfaces that connect decoded brain signals to software and devices, creating more direct ways to communicate and act. Human feedback helps these interactions adapt to each person.',
  },
  {
    id: 'embodied-ai',
    name: 'Embodied AI',
    title: 'Learn to act alongside you.',
    description: 'We are investigating how human intent can guide embodied agents, from assistive robots to interactive companions. Our goal is AI that learns through interaction while people guide its actions.',
  },
];

export default function SymbiosisSection({ onDemoSelect }: { onDemoSelect: (demo: Demo) => void }) {
  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="about-section">
      <div id="symbiosis" tabIndex={-1} className="symbiosis-intro">
        <div className="about-opening">
          <div className="about-heading">
            <p className="content-overline">About NemX Labs / Our vision</p>
            <h2 id="about-title"><span>Symbiotic</span><span>Intelligence.</span></h2>
            <p className="about-tagline">Built to think with you.</p>
          </div>
          <div className="about-introduction">
            <p className="symbiosis-definition">Human and AI.<br />Learning, adapting,<br />and acting together.</p>
            <p>Symbiotic Intelligence is our vision for a lasting connection between people and AI. We’re building systems that learn to understand your intent from brain signals and adapt through your feedback.</p>
            <p className="about-name">NemX stands for Neuro Encoding &amp; Modeling. The X is the frontier we explore: intelligence that grows with you.</p>
          </div>
        </div>
      </div>

      <SymbiosisDemo />

      <div className="research-directions">
        <div className="research-directions-heading">
          <p className="content-overline">From vision to research</p>
          <h3>Building Symbiotic Intelligence.</h3>
          <p>Three connected directions. One shared purpose.</p>
        </div>
        {directions.map((direction, index) => (
          <article id={direction.id} tabIndex={-1} className="research-direction" key={direction.id}>
            <span className="direction-number">0{index + 1}</span>
            <div>
              <p className="content-overline">{direction.name}</p>
              <h4>{direction.title}</h4>
            </div>
            <div className="direction-description">
              <p>{direction.description}</p>
              <button type="button" className="text-link" aria-haspopup="dialog" onClick={() => onDemoSelect(demos[index])}>
                Watch {demos[index].label} demo <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="research-contact">
        <p>Interested in building this future with us?</p>
        <a className="text-link" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
