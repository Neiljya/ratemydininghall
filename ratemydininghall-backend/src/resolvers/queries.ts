import { ObjectId } from "mongodb";
import type { YogaContext } from '../types/yogaContext'
import { authResolvers } from "./auth";
import { COLLECTIONS } from "../db/collections";

// export const queryResolvers = {
//     Query: {
//         // hardcoded data for testing purposes, eventually will connect to a database/blob storage
//         diningHalls: () => [
//             { id: "bistro",
//               name: "The Bistro",
//               description: "Fresh options",
//               imageUrl: "https://picsum.photos/seed/bistro/400/24"
//             }
//         ],
//         review: () => null,
//         reviews: () => [],
//         reviewsByHall: () => []
//     }
// };

function requireAdmin(ctx: YogaContext) {
    if (!ctx.user || ctx.user.role !== 'admin'){
        throw new Error('Unauthorized');
    }
}
export const queryResolvers = {
    Query: {
        async diningHalls(
            _parent: unknown,
            _args: unknown,
            { db }: YogaContext
        ) {
            const docs = await db.collection('diningHalls').find({}).toArray();

            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                slug: doc.slug,
                name: doc.name,
                description: doc.description,
                imageUrl: doc.imageUrl
            }));
        },

        async review(
            _parent: unknown,
            { id }: { id: string },
            { db }: YogaContext
        ) {
            const doc = await db.collection(COLLECTIONS.REVIEWS).findOne({_id: new ObjectId(id)});

            if (!doc) return null;

            return {
                id: doc._id.toString(),
                diningHallId: doc.diningHallId?.toString() ?? doc.diningHalLId,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
                imageUrl: doc.imageUrl ?? null
            };
        },

        async reviews(
            _parent: unknown,
            _args: unknown,
            { db }: YogaContext
        ) {
            const docs = await db.collection(COLLECTIONS.REVIEWS).find({}).sort({createdAt: -1 }).toArray();
            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                diningHallSlug: doc.diningHallSlug?.toString() ?? doc.diningHalLSlug,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
                imageUrl: doc.imageUrl ?? null,
                targetType: doc.targetType ?? (doc.menuItemId ? 'MENU_ITEM' : 'DINING_HALL'),
                menuItemId: doc.menuItemId?.toString?.() ?? doc.menuItemId ?? null,
            }));
        },

        async reviewsByHall(
            _parent: unknown,
            { diningHallId }: { diningHallId: string },
            { db }: YogaContext
        ) {
            const docs = await db
                .collection(COLLECTIONS.REVIEWS)
                .find({ diningHallId })
                .sort({ createdAt: -1 })
                .toArray();

            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                diningHallId: doc.diningHallId?.toString?.() ?? doc.diningHallId,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date
                    ? doc.createdAt.toISOString()
                    : doc.createdAt,
                imageUrl: doc.imageUrl ?? null,
                targetType: doc.targetType ?? (doc.menuItemId ? 'MENU_ITEM' : 'DINING_HALL'),
                menuItemId: doc.menuItemId?.toString?.() ?? doc.menuItemId ?? null,
            }));
        },

        async pendingReviews(_p: unknown, _a: unknown, ctx: YogaContext) {
            requireAdmin(ctx);

            const docs = await ctx.db
                .collection(COLLECTIONS.PENDING_REVIEWS)
                .find({})
                .sort({ createdAt: -1 })
                .toArray();
            
            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                diningHallSlug: doc.diningHallSlug,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
                status: doc.status ?? 'pending',
                userId: doc.userId?.toString?.() ?? null
                
            }));
        },

        async acceptedReviews(_p: unknown, _a: unknown, ctx: YogaContext) {
            requireAdmin(ctx);

            const docs = await ctx.db
                .collection(COLLECTIONS.REVIEWS)
                .find({})
                .sort({ createdAt: -1 })
                .toArray();
            
            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                diningHallSlug: doc.diningHallSlug,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
                status: doc.status ?? 'accepted',
                userId: doc.userId?.toString?.() ?? null,
                targetType: doc.targetType ?? (doc.menuItemId ? 'MENU_ITEM' : 'DINING_HALL'),
                menuItemId: doc.menuItemId?.toString?.() ?? doc.menuItemId ?? null,
            }));
        },

        ...authResolvers.Query,
    },
};