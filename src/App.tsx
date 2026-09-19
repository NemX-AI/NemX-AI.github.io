import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import HandsOverlay from './HandsOverlay';

const ease = [0.16, 1, 0.3, 1] as const;
const backgroundVideo = '/media/background.mp4';

function NeuralMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="currentColor"
      className="h-10 w-10 translate-y-[1px] text-black"
    >
      <rect
        x="7"
        y="19"
        width="15"
        height="5.5"
        rx="2.75"
        transform="rotate(-35 7 19)"
      />
      <rect
        x="17.5"
        y="24"
        width="15"
        height="5.5"
        rx="2.75"
        transform="rotate(-35 17.5 24)"
      />
    </svg>
  );
}

function AdaptiveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="12" cy="5" r="2.3" fill="currentColor" />
      <circle cx="19" cy="12" r="2.3" fill="currentColor" />
      <circle cx="12" cy="19" r="2.3" fill="currentColor" />
      <circle cx="5" cy="12" r="2.3" fill="currentColor" />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
      className="pointer-events-none fixed left-0 top-0 z-50 flex w-full flex-col items-center justify-between gap-4 p-6 sm:flex-row md:p-8"
    >
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <div className="flex items-center gap-1">
          <NeuralMark />
          <span className="font-display text-[18px] font-medium tracking-tight text-black">
            NeuralKinetics
          </span>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          className="flex cursor-pointer items-center gap-2.5 rounded-full border border-black/[0.03] bg-black p-1 pr-5 text-[12px] font-medium text-white transition-all duration-200 hover:bg-zinc-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
            <Plus size={13} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="pr-1 text-[11.5px]">Menu</span>
        </button>

        <div className="hidden h-11 select-none items-center gap-5 rounded-full border border-black/[0.03] bg-[#F4F4F6] px-6 text-[11.5px] font-normal text-black/60 md:flex">
          <span>Advanced Bionics</span>
          <span>Cognitive AI</span>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center">
        <button
          type="button"
          className="flex items-center gap-3.5 rounded-full border border-black/[0.03] bg-[#F4F4F6] p-1 pr-6 transition-colors hover:bg-[#EAEAEF]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
            <AdaptiveIcon />
          </span>
          <span className="select-none text-[11px] font-medium text-black/70">
            Adaptive Systems
          </span>
        </button>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <div className="relative z-30 flex min-h-0 flex-1 flex-col items-center justify-center px-6 md:px-12">
      <div className="mt-24 w-full max-w-7xl translate-y-10 px-4 text-center md:mt-0 md:translate-y-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease, delay: 0.2 }}
          className="flex select-none flex-col items-center justify-center"
        >
          <h1 id="hero-title" className="font-display text-[7.5vw] font-medium leading-[0.9] tracking-tight text-black md:text-[5.8vw] lg:text-[4.6vw]">
            NeuralKinetics
          </h1>
          <h2 className="mt-1 font-display text-[7.5vw] font-medium leading-[0.9] tracking-tight md:mt-1.5 md:text-[5.8vw] lg:text-[4.6vw]">
            <span className="mr-1.5 font-light tracking-tight text-black/25 md:mr-2">
              cybernetics
            </span>
            <span className="font-medium tracking-tight text-black">
              made organic
            </span>
          </h2>
        </motion.div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-30 w-full shrink-0 px-8 py-10 md:px-16 md:py-14">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease }}
        className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end"
      >
        <div className="max-w-[300px] md:max-w-[340px]">
          <p className="mb-2 text-[11.5px] font-medium text-black/50">
            Autonomous Dynamics
          </p>
          <p className="text-[19px] font-normal leading-[1.15] tracking-tight text-black md:text-[21px]">
            Unifying biological grace with machine intelligence to design the
            next era of fusion
          </p>
        </div>

        <div className="hidden h-16 w-px bg-black/[0.08] lg:block" />

        <div className="flex flex-wrap gap-2.5">
          {['Neuromorphic', 'AGI', 'Cybernetics'].map((tag) => (
            <button
              key={tag}
              type="button"
              className="cursor-pointer rounded-full border border-black/15 bg-white px-6 py-3.5 text-[11.5px] font-normal text-black transition-all duration-300 hover:border-black hover:bg-black hover:text-white active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="w-full bg-white font-sans text-black antialiased selection:bg-black selection:text-white">
      <Navbar />
      <div aria-hidden="true" className="bottom-gradient" />
      <main>
        <section
          aria-labelledby="hero-title"
          className="relative flex h-screen w-full flex-col justify-between overflow-hidden"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease }}
            className="pointer-events-none fixed inset-0 z-0 select-none"
          >
            <video
              src={backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
          <HandsOverlay />
          <Hero />
          <Footer />
        </section>

        <section aria-labelledby="about-title" className="about-section">
          <div className="about-grid">
            <div className="about-headline">
              <h2 id="about-title">
                <span>Built to</span>
                <span>move with you</span>
              </h2>
              <p className="about-intro">
                Biological instinct. Adaptive intelligence.
                A more natural connection between human and machine.
              </p>
            </div>

            <div className="about-feature about-cognition">
              <p className="about-overline">01 / Cognitive intelligence</p>
              <h3>Sense.<br />Understand.<br />Adapt.</h3>
              <p className="about-detail">
                Intelligence that reads the world around it, learns from every
                interaction, and responds in the moment.
              </p>
            </div>

            <div className="about-bio">
              <p className="about-overline">The human side of technology</p>
              <p>
                We work at the intersection of biology and computation.
                Every system begins with the way people feel, think, and move.
              </p>
            </div>

            <div className="about-feature about-movement">
              <p className="about-overline">02 / Advanced bionics</p>
              <h3>Precision.<br />With feeling.</h3>
              <p className="about-detail">
                Engineered for strength. Designed for subtlety.
                Movement that feels like a part of you.
              </p>
            </div>
          </div>

          <ul className="about-disciplines" aria-label="Our disciplines">
            {['Bionics', 'Cognition', 'Perception', 'Robotics', 'Adaptation', 'Symbiosis'].map((discipline) => (
              <li key={discipline}>{discipline}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
