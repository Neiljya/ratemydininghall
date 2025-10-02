import { useState } from 'react';
import BoldHeader from '@textComponents/custom-headers/BoldHeader';
import ImageContainer from '../../image-components/ImageContainer';
import CardDescription from '../../text-components/custom-labels/CardDescription';
import ReviewModal from './review-modal/ReviewModal';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';

const placeholderUrl: string =
"https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior";

interface ReviewCardTypes {
    diningHallId?: string;
    headerText?: string;
    description?: string;
    imageUrl?: string;
}
function ReviewCard({ diningHallId='', headerText, description, imageUrl }: ReviewCardTypes) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }
  return (
    <>
      <div
        className={`${globalContainerStyles.roundContainer} ${globalContainerStyles.containerEffect}`}
        onClick={handleOpenModal}
      >
        <ImageContainer imageUrl={imageUrl ? imageUrl : placeholderUrl} alt="Dining Hall" />
        <BoldHeader text={headerText} />
        <CardDescription text={description} />
      </div>
      {/* Creates a popup modal when the card is clicked */}
      <ReviewModal
        diningHallId={diningHallId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        headerText={headerText}
        description={description}
      />
    </>
  );
}

export default ReviewCard;
