import globalContainerStyles from '../../../global-styles/container-styles/globalContainer.module.css';

function ImageContainer({ imageUrl, alt = "Image" }: { imageUrl: string, alt?: string }) {
  return (
    <div className={globalContainerStyles.roundImageContainer}>
      <img 
        src={imageUrl} 
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

export default ImageContainer;