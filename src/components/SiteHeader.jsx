export default function SiteHeader({ cardsReviewed, isSidebarOpen, onOpenSidebar }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__title">
          <h1 className="site-header__title__main">Phở</h1>
          <span><h1 className="site-header__title__part">-netics</h1></span>
        </div>
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