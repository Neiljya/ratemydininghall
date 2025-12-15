import BoldHeader from '@textComponents/custom-headers/BoldHeader';
import ImageContainer from '../../image-components/ImageContainer';
import CardDescription from '../../text-components/custom-labels/CardDescription';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import globalLayoutStyles from '@layoutStyles/layout.module.css';
import Stars from '@stars/Stars';

const placeholderUrl: string =
"https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior";

interface ReviewCardTypes {
    diningHallSlug?: string;
    headerText?: string;
    description?: string;
    imageUrl?: string;
    onClick?: () => void; // onclick propr
}

function ReviewCard({ headerText, description, imageUrl, onClick }: ReviewCardTypes) {
  
  return (
      <div
        className={`${globalContainerStyles.roundContainer} ${globalContainerStyles.containerEffect}`}
        onClick={onClick} // pass the click up to the parent
        style={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflow: 'hidden'
        }}
      >
        <ImageContainer imageUrl={imageUrl ? imageUrl : placeholderUrl} alt="Dining Hall" />
        
        {/* Helper div to push content down if needed */}
        <div style={{ height: '200px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative' }}>
            <BoldHeader text={headerText} />
            <div className={globalLayoutStyles.headerSection}>
            <Stars starCount={4} size={30} />
            </div>
            <CardDescription text={description} />
        </div>
      </div>
  );
}

export default ReviewCard;