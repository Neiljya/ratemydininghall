import ReviewCard from './components/reviews/review-card/ReviewCard';
import TopBar from './components/topbar/Topbar';
import layoutStyles from '@layoutStyles/layout.module.css';
import { useDiningHalls } from '@hooks/useDiningHalls';

/*
get dining hall name from state or props + description
*/

function ReviewPage() {
    const { halls, loading, error } = useDiningHalls();

    // TODO: Change loading and error screens to nicer components
    if (loading && halls.length === 0) {
        return <div> Loading dining halls... </div>
    }

    if (error && halls.length === 0) {
        return <div> Error loading dining halls: {error} </div>
    }
    
    
    return (
        <div>
            <TopBar header="RateMyDiningHall @ UCSD" />
            <div className={layoutStyles.alignLeft}>
                {halls.map(hall => (
                    <ReviewCard
                        key={hall?.id} // React lists require a unique key prop
                        diningHallSlug={hall?.slug}
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