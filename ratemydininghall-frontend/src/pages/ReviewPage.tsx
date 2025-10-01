import { useSelector } from 'react-redux';
import { selectDiningHalls } from '@redux/dining-hall-slice/diningHallSelectors';
import ReviewCard from './components/reviews/review-card/ReviewCard';
import TopBar from './components/topbar/Topbar';
import layoutStyles from '@layoutStyles/layout.module.css';

/*
get dining hall name from state or props + description
*/

function ReviewPage() {
    const halls = useSelector(selectDiningHalls);

    return (
        <div>
            <TopBar header="RateMyDiningHall @ UCSD" />
            <div className={layoutStyles.alignLeft}>
                {halls.map(hall => (
                    <ReviewCard
                        key={hall?.id} // React lists require a unique key prop
                        diningHallId={hall?.id}
                        headerText={hall?.name}
                        description={hall?.description}
                        imageUrl={hall?.imageUrl}
                    />
                ))}
            </div>
        </div>
    )
}


export default ReviewPage;