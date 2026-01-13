import styles from './price-tag.module.css';

interface PriceTagProps {
  price: string | number;
  size?: 'sm' | 'md' | 'lg'; 
}

export default function PriceTag({ price, size = 'md' }: PriceTagProps) {
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;

  return (
    <span className={`${styles.priceBadge} ${styles[size]}`}>
      ${formattedPrice}
    </span>
  );
}