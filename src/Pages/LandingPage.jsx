import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <section className="landing-page" aria-labelledby="landing-page-title">
      <div className="landing-page__hero">
        <div className="landing-page__content">
          <p className="landing-page__eyebrow">A little practice goes a long way</p>
          <h2 className="landing-page__title" id="landing-page-title">
            Vietnamese, one card at a time.
          </h2>
          <p className="landing-page__description">
            Explore vocabulary sets, choose which language to see first, and
            build confidence with a focused flashcard practice.
          </p>
          <Link className="landing-page__action" to="/sets">
            Browse all practice sets
          </Link>
        </div>
      </div>
    </section>
  );
}
