import BoldHeader from '../text-components/custom-headers/BoldHeader';
import ImageContainer from '../image-components/imageContainer';
import globalContainerStyles from '../../../global-styles/container-styles/globalContainer.module.css';

const placeholderUrl: string = "https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior";

function ReviewCard({ headerText }: {headerText?: string}) {
  return (
    <div className={globalContainerStyles.roundContainer}>
      <BoldHeader text={headerText} />
      <ImageContainer imageUrl={placeholderUrl} alt="Dining Hall" />
    </div>
  );
}

export default ReviewCard;
