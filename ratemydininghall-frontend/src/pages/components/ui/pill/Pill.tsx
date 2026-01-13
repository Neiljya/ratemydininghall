// src/components/ui/pill/Pill.tsx
import styles from './pill.module.css';

interface PillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg'; 
}

export default function Pill({ 
  label, 
  selected, 
  onClick, 
  className = '', 
  size = 'md' 
}: PillProps) {
  return (
    <button
      type="button"
      className={`
        ${styles.pill} 
        ${selected ? styles.selected : ''} 
        ${styles[size]} 
        ${className}
      `}
      onClick={onClick}
    >
      {label}
    </button>
  );
}