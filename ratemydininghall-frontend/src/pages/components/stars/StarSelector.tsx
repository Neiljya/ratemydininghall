import { useState } from 'react';
import styles from './stars.module.css';

interface StarSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

function StarSelector({ value, onChange }: StarSelectorProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className={styles.reviewStars}>
      {Array.from({ length: 5 }, (_, i) => {
        const index = i + 1;
        const isActive = index <= (hover ?? value);
        return (
          <span
            key={index}
            className={`${styles.starSelectable} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarSelector;