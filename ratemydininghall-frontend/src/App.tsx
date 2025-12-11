import { useDiningHallsBootstrap } from '@hooks/useDiningHallsBootstrap';
import { useReviewsBootstrap } from '@hooks/useReviewsBootstrap';
import ReviewPage from './pages/ReviewPage';

function App() {
    // Initialize dining halls data with caching (preloads them for components)
    useDiningHallsBootstrap();
    useReviewsBootstrap();

    return (
        <>
            <ReviewPage />
        </>
    )
}

export default App;