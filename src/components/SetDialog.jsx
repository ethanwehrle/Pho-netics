import { useEffect, useRef } from 'react';

export default function SetDialog({ set, onStartPractice, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (set) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [set]);

  return (
    <dialog
      className="set-dialog"
      ref={dialogRef}
      aria-labelledby="set-dialog-title"
      aria-describedby="set-dialog-description set-dialog-count"
      onCancel={onClose}
      onClose={onClose}
    >
      {set && (
        <>
          <h2 id="set-dialog-title">{set.name}</h2>
          <p id="set-dialog-description">{set.description}</p>
          <p className="set-dialog__count" id="set-dialog-count">
            {set.words.length.toLocaleString()} {set.words.length === 1 ? 'word' : 'words'}
          </p>
          <div className="set-dialog__languages">
            <button className="language-button" type="button" onClick={() => onStartPractice('english')}>
              English
            </button>
            <button className="language-button" type="button" onClick={() => onStartPractice('vietnamese')}>
              Vietnamese
            </button>
          </div>
          <button className="cancel-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </>
      )}
    </dialog>
  );
}