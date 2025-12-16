import { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import BoldHeader from '@textComponents/custom-headers/BoldHeader';
import ImageContainer from '../../image-components/ImageContainer';
import CardDescription from '../../text-components/custom-labels/CardDescription';
import Stars from '@stars/Stars';
import styles from './review-card.module.css'; // New CSS module

const placeholderUrl: string =
"https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior";

interface ReviewCardTypes {
    headerText?: string;
    description?: string;
    imageUrl?: string;
    rating?: number;
    onClick?: () => void;
}

function ReviewCard({ headerText, description, imageUrl, rating = 0, onClick }: ReviewCardTypes) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // card tilting method
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Y-axis rotation depends on x mouse position
    // X-axis rotation depends on y mouse position (inverted)
    const rotateX = ((y - centerY) / centerY) * -5; // max tilt of 5 degrees
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className={styles.cardWrapper}>
      <div
        ref={cardRef}
        className={styles.card}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Image Section */}
        <div className={styles.imageWrapper}>
             <ImageContainer imageUrl={imageUrl || placeholderUrl} alt={headerText || "Dining Hall"} />
        </div>
        
        {/* Content Section */}
        <div className={styles.content}>
            <div className={styles.header}>
                <BoldHeader text={headerText} />
            </div>

            <div className={styles.starsWrapper}>
              {/* hardcoded for now */}
                <Stars starCount={rating} size={22} />
            </div>
            
            <div className={styles.description}>
                <CardDescription text={description} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;