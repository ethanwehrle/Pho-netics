export default function PracticeSetCard({ set, onSelect }) {
  return (
    <article
      className="practice-set-card"
      aria-labelledby={`set-${set.id}-title`}
    >
      <button
        className="practice-set-card__trigger"
        type="button"
        aria-labelledby={`set-${set.id}-title`}
        aria-describedby={`set-${set.id}-description set-${set.id}-meta`}
        aria-haspopup="dialog"
        onClick={() => onSelect(set)}
      />
      <div className="practice-set-card__header">
        <h3 className="practice-set-card__title" id={`set-${set.id}-title`}>
          {set.name}
        </h3>
        <div className="practice-set-card__meta" id={`set-${set.id}-meta`}>
          <span>{set.words.length.toLocaleString()} {set.words.length === 1 ? 'word' : 'words'}</span>
          <span className="practice-set-card__difficulty">{set.difficulty}</span>
        </div>
      </div>
      <div className="practice-set-card__media">
        <img className="practice-set-card__image" src={set.image} alt="" />
        <div className="practice-set-card__overlay">
          <p className="practice-set-card__description" id={`set-${set.id}-description`}>
            {set.description}
          </p>
        </div>
      </div>
    </article>
  );
}