import { useEffect, useState } from 'react';
import styles from './notification.module.css'

export type NotificationVariant = 'success' | 'error' | 'info';

interface NotificationProps {
    message: string;
    variant?: NotificationVariant;
    show: boolean;
    durationMs?: number;
    onClose?: () => void;
}

function Notification({
    message,
    variant = 'info',
    show,
    durationMs = 2500,
    onClose
}: NotificationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!show) {
            setVisible(false);
            return;
        }

        setVisible(true);

        if (durationMs <= 0) return;

        const t = window.setTimeout(() => {
            setVisible(false);
            window.setTimeout(() => onClose?.(), 200);
        }, durationMs);

        return () => window.clearTimeout(t);
    }, [show, durationMs, onClose]);

    if (!show) return null;

    return (<div
      className={[
        styles.wrapper,
        visible ? styles.in : styles.out,
        styles[variant],
      ].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      onClick={() => {
        setVisible(false);
        window.setTimeout(() => onClose?.(), 200);
      }}
    >
      <div className={styles.content}>
        <span className={styles.title}>
          {variant === 'success' ? 'Success' : variant === 'error' ? 'Error' : 'Notice'}
        </span>
        <span className={styles.message}>{message}</span>
      </div>

      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
          window.setTimeout(() => onClose?.(), 200);
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Notification;