import globalContainerStyles from '@containerStyles/globalContainer.module.css';

function ImageContainer({ imageUrl, alt = "Image" }: { imageUrl: string, alt?: string }) {
  return (
    <div className={globalContainerStyles.roundImageContainer}>
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
}

export default ImageContainer;