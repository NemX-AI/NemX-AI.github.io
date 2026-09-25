import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import HandsOverlay from './HandsOverlay';
import DemoPlayer from './DemoPlayer';
import { demos, type Demo } from './demos';
import SymbiosisSection from './SymbiosisSection';
import { ContactPage, NewsPage, PublicationsPage, SiteFooter } from './SitePages';
import { usePage, type Page } from './use-page';
import NewsAnnouncement from './NewsAnnouncement';

const ease = [0.16, 1, 0.3, 1] as const;
const backgroundVideo = '/media/background.mp4';

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (document.hidden) video.pause();
      else if (video.paused) void video.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pointerdown', syncPlayback, { passive: true });
    syncPlayback();
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      window.removeEventListener('pointerdown', syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={backgroundVideo}
      autoPlay
      loop
      muted
      playsInline
      tabIndex={-1}
      disablePictureInPicture
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function NeuralMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="currentColor"
      className="h-12 w-12 translate-y-[1px] text-black"
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

function Navbar({ page }: { page: Page }) {
  const announcementRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [announcementOffset, setAnnouncementOffset] = useState(0);

  useLayoutEffect(() => {
    // The announcement scrolls away; navigation stays at the top below it.
    const syncScroll = () => {
      setScrolled(window.scrollY > 8);
      setAnnouncementOffset(Math.max(0, announcementRef.current?.getBoundingClientRect().bottom ?? 0));
    };
    const resizeObserver = new ResizeObserver(syncScroll);
    if (announcementRef.current) resizeObserver.observe(announcementRef.current);
    window.addEventListener('scroll', syncScroll, { passive: true });
    syncScroll();
    return () => {
      window.removeEventListener('scroll', syncScroll);
      resizeObserver.disconnect();
    };
  }, [page]);

  return (
    <>
      {page === 'home' && <NewsAnnouncement ref={announcementRef} />}
      <motion.nav
        aria-label="Primary navigation"
        data-scrolled={scrolled || page !== 'home'}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        style={{ top: announcementOffset }}
        className="site-nav pointer-events-none fixed left-0 top-0 z-50 w-full"
      >
        <a href="#home" aria-label="NemX Labs home" className="nav-brand pointer-events-auto flex items-center gap-1">
          <NeuralMark />
          <span className="font-display text-[26px] font-medium tracking-tight text-black">
            NemX Labs
          </span>
        </a>

        <div className="site-page-links">
          <a href="#news" aria-current={page === 'news' ? 'page' : undefined}>News</a>
          <a href="#publications" aria-current={page === 'publications' ? 'page' : undefined}>Publications</a>
          <a href="#contact" aria-current={page === 'contact' ? 'page' : undefined}>Contact us</a>
        </div>

        <div className="nav-symbiosis pointer-events-auto flex items-center">
          <a
            href="#symbiosis"
            aria-label="Symbiotic Intelligence"
            className="flex items-center gap-3.5 whitespace-nowrap rounded-full border border-black/[0.03] bg-[#F4F4F6] p-1 pr-6 transition-colors hover:bg-[#EAEAEF]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              <AdaptiveIcon />
            </span>
            <span className="nav-intelligence-label select-none text-[11px] font-medium text-black/70">
              Symbiotic Intelligence
            </span>
          </a>
        </div>
      </motion.nav>
    </>
  );
}

function Hero({ onDemoSelect }: { onDemoSelect: (demo: Demo) => void }) {
  return (
    <div className="hero-content">
      <h1 id="hero-title" className="hero-heading">
        <span>Neuro <span className="font-light text-black/25">Encoding</span></span>
        <span><span className="font-light text-black/25">Modeling</span> Exploration</span>
      </h1>

      <div className="hero-center">
        <p className="hero-copy hero-statement">Symbiotic AI</p>
      </div>

      <nav id="demos" className="hero-demos" aria-label="Explore our demos">
        {demos.map((demo) => (
          <button
            key={demo.id}
            type="button"
            className="demo-link"
            aria-haspopup="dialog"
            onClick={() => onDemoSelect(demo)}
          >
            {demo.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer className="hero-footer">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease }}
        className="mx-auto w-full max-w-7xl"
      >
        <div className="hero-mission">
          <p className="mb-2 text-[11.5px] font-medium text-black/50">
            Our mission
          </p>
          <p className="mission-copy">
            Building BCI symbiotic AI that decodes human intent from brain
            signals to think, move, and live alongside you
          </p>
        </div>
      </motion.div>
    </footer>
  );
}

function HomePage({ onDemoSelect }: { onDemoSelect: (demo: Demo) => void }) {
  const sceneRef = useRef<HTMLElement>(null);

  return (
    <>
        <section
          ref={sceneRef}
          id="home"
          tabIndex={-1}
          aria-labelledby="hero-title"
          className="hero-section relative flex w-full flex-col justify-between overflow-hidden"
        >
          <div aria-hidden="true" className="bottom-gradient" />
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease }}
            className="pointer-events-none fixed inset-0 z-0 select-none"
          >
            <BackgroundVideo />
          </motion.div>
          <div aria-hidden="true" className="hero-scene-veil" />
          <HandsOverlay sceneRef={sceneRef} />
          <Hero onDemoSelect={onDemoSelect} />
          <Footer />
        </section>

      <SymbiosisSection onDemoSelect={onDemoSelect} />
    </>
  );
}

export default function App() {
  const page = usePage();
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

  useEffect(() => setActiveDemo(null), [page]);

  return (
    <div className="w-full bg-white font-sans text-black antialiased selection:bg-black selection:text-white">
      <Navbar page={page} />
      <main>
        {page === 'home' && <HomePage onDemoSelect={setActiveDemo} />}
        {page === 'news' && <NewsPage />}
        {page === 'publications' && <PublicationsPage />}
        {page === 'contact' && <ContactPage />}
      </main>
      <SiteFooter />
      {activeDemo && <DemoPlayer key={activeDemo.id} demo={activeDemo} onDismiss={() => setActiveDemo(null)} />}
    </div>
  );
}
