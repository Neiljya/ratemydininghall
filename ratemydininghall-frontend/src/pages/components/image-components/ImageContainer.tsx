import globalContainerStyles from '@containerStyles/globalContainer.module.css';

interface ImageContainerProps {
  imageUrl: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}
function ImageContainer({ 
  imageUrl, 
  alt = "Image",
  width = '100%',
  height = '100%' 
  }: ImageContainerProps) {
  return (
    <div className={globalContainerStyles.roundImageContainer}
    style={{
      width: width,
      height: height,
    }}
    
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: width,
          height: height,
          borderRadius: '8px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

export default ImageContainer;