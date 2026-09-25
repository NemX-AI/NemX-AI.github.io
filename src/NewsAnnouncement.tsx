import type { Ref } from 'react';
import { newsByDate } from './site-content';

export default function NewsAnnouncement({ ref }: { ref: Ref<HTMLElement> }) {
  const latest = newsByDate[0];
  if (!latest) return null;

  return (
    <aside ref={ref} className="news-announcement" aria-label="Latest news">
      <a className="news-announcement-link" href="#news">
        <span className="news-announcement-badge"><span aria-hidden="true" />News</span>
        <span className="news-announcement-copy">
          <span className="news-announcement-label">{latest.announcement?.label ?? latest.category}</span>
          <span className="news-announcement-title">{latest.announcement?.text ?? latest.title}</span>
        </span>
        <span className="news-announcement-action">
          <span className="news-announcement-action-label">Read update</span>
          <span className="news-announcement-arrow">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </a>
    </aside>
  );
}
