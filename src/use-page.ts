import { useEffect, useLayoutEffect, useState } from 'react';

export type Page = 'home' | 'news' | 'publications' | 'contact';

const readHash = () => window.location.hash.slice(1) || 'home';
const pageTitles: Record<Page, string> = {
  home: 'NemX Labs',
  news: 'News — NemX Labs',
  publications: 'Publications — NemX Labs',
  contact: 'Contact us — NemX Labs',
};

export function usePage() {
  const [hash, setHash] = useState(readHash);
  const page: Page = hash === 'news' || hash === 'publications' || hash === 'contact' ? hash : 'home';

  useEffect(() => {
    const sync = () => setHash(readHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useLayoutEffect(() => {
    document.title = pageTitles[page];
    if (page === 'home') {
      const target = document.getElementById(hash);
      if (hash === 'home' || !target) window.scrollTo({ top: 0, behavior: 'instant' });
      else target.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById(`${page}-title`)?.focus({ preventScroll: true });
    }
  }, [hash, page]);

  return page;
}
