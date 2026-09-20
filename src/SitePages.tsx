import { useState, type FormEvent, type ReactNode } from 'react';
import { contactEmails, news, publications } from './site-content';

function PageHeading({ id, overline, title, children }: { id: string; overline: string; title: string; children: ReactNode }) {
  return (
    <header className="page-heading">
      <p className="content-overline">{overline}</p>
      <h1 id={id} tabIndex={-1}>{title}</h1>
      <p className="page-intro">{children}</p>
    </header>
  );
}

function EmptyCollection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-collection">
      <span className="collection-mark" aria-hidden="true">↗</span>
      <div><h2>{title}</h2><p>{children}</p></div>
      <a className="text-link" href="#demos">Explore our demos <span aria-hidden="true">↗</span></a>
    </div>
  );
}

export function NewsPage() {
  return (
    <section className="content-page" aria-labelledby="news-title">
      <PageHeading id="news-title" overline="From the lab" title="News.">
        Research milestones, new ideas, and updates from NemX Labs.
      </PageHeading>
      {news.length ? (
        <div className="news-list">
          {[...news].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
            <article className="news-item" key={item.id}>
              <div className="news-meta">
                <time dateTime={item.date}>{new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                <span>{item.category}</span>
              </div>
              <div><h2>{item.title}</h2>
                {item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {item.link && <a className="text-link" href={item.link.href} target="_blank" rel="noopener noreferrer">{item.link.label} <span aria-hidden="true">↗</span></a>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyCollection title="More from the lab, soon.">We’ll share our latest announcements here. In the meantime, explore our work through three demos.</EmptyCollection>
      )}
    </section>
  );
}

export function PublicationsPage() {
  return (
    <section className="content-page" aria-labelledby="publications-title">
      <PageHeading id="publications-title" overline="Our research" title="Publications.">
        Exploring the foundations of intelligence shared between people and machines.
      </PageHeading>
      <div className="collection-heading"><h2>Selected publications</h2>{publications.length > 0 && <span>{publications.length} papers</span>}</div>
      {publications.length ? (
        <div className="publication-list">
          {[...publications].sort((a, b) => b.year - a.year).map((paper) => (
            <article className={`publication-item${paper.image ? '' : ' publication-without-image'}`} key={paper.id}>
              {paper.image && <img src={paper.image} alt="" loading="lazy" className="publication-image" />}
              <div>
                <h3>{paper.title}</h3>
                <p className="publication-authors">{paper.authors}</p>
                <p className="publication-venue">{paper.venue}, {paper.year}</p>
                {paper.note && <p className="publication-note">{paper.note}</p>}
                <div className="publication-links">
                  {paper.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyCollection title="Research takes shape here.">Our publication list will be available here, with links to papers and accompanying resources.</EmptyCollection>
      )}
    </section>
  );
}

export function ContactPage() {
  const [draft, setDraft] = useState('');

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactEmails.length) return;
    const fields = new FormData(event.currentTarget);
    const purpose = String(fields.get('purpose'));
    const subject = `NemX Labs — ${purpose}`;
    const body = `Name: ${String(fields.get('name')).trim() || 'Not provided'}\nEmail: ${String(fields.get('email')).trim()}\nPurpose: ${purpose}\n\n${String(fields.get('message')).trim()}`;
    setDraft(`mailto:${contactEmails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  return (
    <section className="content-page contact-page" aria-labelledby="contact-title">
      <PageHeading id="contact-title" overline="Start a conversation" title="Contact us.">
        Let’s explore what we can build together.
      </PageHeading>
      <div className="contact-grid">
        <div className="contact-context">
          <h2>A connection begins<br />with an idea.</h2>
          <p>For research collaborations, partnerships, demo enquiries, or questions about NemX Labs, tell us what you have in mind.</p>
          {contactEmails.length > 0 && <div className="contact-addresses">{contactEmails.map((email) => <a key={email} href={`mailto:${email}`} className="contact-address">{email}</a>)}</div>}
          <p className="contact-note">Share your email address and the purpose of your enquiry so we can continue the conversation.</p>
        </div>
        <form className="contact-form" onSubmit={prepareEmail} onChange={() => setDraft('')}>
          <div className="contact-fields">
            <label>Your name <span>(optional)</span><input name="name" autoComplete="name" maxLength={100} /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@organisation.com" required maxLength={254} /></label>
          </div>
          <label>What would you like to discuss?
            <select name="purpose" required defaultValue="">
              <option value="" disabled>Select a purpose</option>
              <option>Research collaboration</option><option>Partnership</option><option>Demo enquiry</option><option>Media enquiry</option><option>General enquiry</option>
            </select>
          </label>
          <label>Your message<textarea name="message" placeholder="Tell us a little about your idea or question." rows={6} required maxLength={3000} /></label>
          <div className="contact-submit">
            <button type="submit" className="solid-button" disabled={!contactEmails.length}>Prepare email <span aria-hidden="true">↗</span></button>
            <p>{contactEmails.length ? 'Addressed to both contacts. Review and send in your email app.' : 'Our email contact will be available soon.'}</p>
          </div>
          {draft && <div className="contact-draft" role="status"><p>Your email draft is ready. Open your email app to review and send it.</p><p className="contact-recipients">To: {contactEmails.join(', ')}</p><a className="text-link" href={draft}>Open email app <span aria-hidden="true">↗</span></a></div>}
        </form>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><a className="footer-brand" href="#home">NemX Labs</a><p>Intelligence that grows with you.</p></div>
      <nav aria-label="Footer navigation"><a href="#news">News</a><a href="#publications">Publications</a><a href="#contact">Contact us</a><a href="https://github.com/NemX-AI" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav>
      <span>© {new Date().getFullYear()} NemX Labs</span>
    </footer>
  );
}
