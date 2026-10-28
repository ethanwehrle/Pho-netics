export default function SiteHeader({ cardsReviewed, isSidebarOpen, onOpenSidebar }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <h1 className="site-header__title">VietFlip</h1>
        <div className="site-header__actions">
          <p className="site-header__counter" aria-live="polite" aria-atomic="true">
            <span>Cards reviewed</span>
            <strong>{cardsReviewed.toLocaleString()}</strong>
          </p>
          <button
            className="site-header__menu-button"
            type="button"
            aria-label="Open appearance settings"
            aria-haspopup="dialog"
            aria-expanded={isSidebarOpen}
            aria-controls="site-sidebar"
            onClick={onOpenSidebar}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
}