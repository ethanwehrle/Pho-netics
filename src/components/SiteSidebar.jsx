import { useEffect, useRef } from 'react';

export default function SiteSidebar({ isOpen, theme, onThemeChange, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  return (
    <dialog
      className="site-sidebar"
      id="site-sidebar"
      ref={dialogRef}
      aria-labelledby="site-sidebar-title"
      onCancel={handleCancel}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="site-sidebar__header">
        <h2 id="site-sidebar-title">Site Settings</h2>
        <button className="site-sidebar__close" type="button" aria-label="Close menu" onClick={onClose}>
          ×
        </button>
      </div>
      <fieldset className="site-sidebar__theme">
        <legend>Color theme</legend>
        <div className="site-sidebar__theme-options">
          {['light', 'dark'].map((option) => (
            <label className="site-sidebar__theme-option" key={option}>
              <input
                className="site-sidebar__theme-input"
                type="radio"
                name="color-theme"
                value={option}
                checked={theme === option}
                onChange={() => onThemeChange(option)}
              />
              <span className="site-sidebar__theme-label">
                {option === 'light' ? 'Light' : 'Dark'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </dialog>
  );
}