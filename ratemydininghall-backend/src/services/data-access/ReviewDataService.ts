import redis from '../config/Redis';
import { COLLECTIONS } from '../../db/collections';

export const ReviewDataService = {
    getReviewsByHall: async (diningHallSlug: string) => {
        const cacheKey = `reviews:${diningHallSlug}`;

        if (redis) {
            try {
                const cached = await redis.get(cacheKey);

                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (err) {
                console.warn('Redix fetch failed (ignoring):', err);
            }
        }
    },

    submitPendingReview: async (db: any, reviewDoc: any) => {
        const result = await db.collections(COLLECTIONS.PENDING_REVIEWS).insertOne(reviewDoc);
        return result.insertedId.toString();
    }

}