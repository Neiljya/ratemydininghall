import ReviewCard from './components/review-card/ReviewCard'; 
import TopBar from './components/topbar/Topbar';
import layoutStyles from '../global-styles/layout-styles/layout.module.css';

/*
get dining hall name from state or props + description
*/

function ReviewPage(){ 
    return ( 
        <div>
            <TopBar header="RateMyDiningHall @ UCSD" />
            <div className={layoutStyles.alignLeft}>
                <ReviewCard 
                    headerText="The Bistro At Seventh"
                    description="Good dining hall"
                />
            </div> 
        </div> 
    ) 
} 


export default ReviewPage;