import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type YogaContext = {
    req: VercelRequest;
    res: VercelResponse;
    db: Db;
}

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
            const doc = await db.collection('reviews').findOne({_id: new ObjectId(id)});

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
            const docs = await db.collection('reviews').find({}).sort({createdAt: -1 }).toArray();
            return docs.map((doc: any) => ({
                id: doc._id.toString(),
                diningHallId: doc.diningHallId?.toString() ?? doc.diningHalLId,
                author: doc.author,
                description: doc.description,
                rating: doc.rating,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
                imageUrl: doc.imageUrl ?? null
            }));
        },

    async reviewsByHall(
        _parent: unknown,
        { diningHallId }: { diningHallId: string },
        { db }: YogaContext
    ) {
        const docs = await db
            .collection('reviews')
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
        }));
    },
    },
};