import ReviewCard from './components/review-card/ReviewCard'; 
import layoutStyles from '../global-styles/layout-styles/layout.module.css';

function ReviewPage(){ 
    return ( 
        <div> 
            <h1>Review Page</h1>
            <div className={layoutStyles.alignRight}>
                <ReviewCard headerText="The Bistro At Seventh"></ReviewCard> 
            </div> 
        </div> 
    ) 
} 


export default ReviewPage;