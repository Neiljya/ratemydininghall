import styles from './close-button.module.css';

interface CloseButtonProps {
    onClick: () => void;
    className?: string; 
}

export default function CloseButton({ onClick, className = '' }: CloseButtonProps) {
    return (
        <button 
            type="button"
            className={`${styles.closeIconBtn} ${className}`}
            onClick={onClick}
            aria-label="Close"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    );
}