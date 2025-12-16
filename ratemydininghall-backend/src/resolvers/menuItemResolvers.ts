import { ObjectId } from 'mongodb';
import { YogaContext } from '../types/yogaContext';
import { COLLECTIONS } from '../db/collections';
import { getMenuItemsWithRatingsByHall } from '../db/aggregations/menuItemsWithRatings';

// everything in here is what is allowed to be returned as a "menu item"
function toMenuItem(doc: any) {
    return {
        id: doc._id.toString(),
        diningHallSlug: doc.diningHallSlug,
        name: doc.name,
        description: doc.description ?? null,
        imageUrl: doc.imageUrl ?? null,
        macros: doc.macros ?? null,
        avgRating: doc.avgRating ?? 0,
        ratingCount: doc.ratingCount ?? 0,
    };
}

function normalizeName(name: string) {
    return name.trimEnd().toLowerCase();
}


export const menuItemResolvers = {
    Query: {
        async menuItemsByHall(
            _p: unknown,
            { diningHallSlug }: { diningHallSlug: string },
            { db }: YogaContext
        ) {
            const docs = await getMenuItemsWithRatingsByHall(db, diningHallSlug);
            return docs.map(toMenuItem);
        },

        async menuItem(
            _p: unknown,
            { id }: { id: string },
            { db }: YogaContext
        ) {
            const doc = await db.collection(COLLECTIONS.MENU_ITEMS)
                .findOne({ _id: new ObjectId(id) });
            
            return doc ? toMenuItem(doc) : null;
        },

        async searchMenuItems(
            _p: unknown,
            { diningHallSlug, q }: { diningHallSlug: string, q: string },
            { db }: YogaContext
        ) {
            const query = q.trim()
            if (!query) return [];

            // conducts a substring search for the menu item
            const docs = await db.collection(COLLECTIONS.MENU_ITEMS)
                .find({
                    diningHallSlug,
                    name: { $regex: query, $options: 'i' },
                })
                .sort({ name: 1 })
                .limit(50)
                .toArray();
            
            return docs.map(toMenuItem);
        },
    },

    Mutation: {
        async createMenuItem(
            _p: unknown,
            { input }: { input: {
                diningHallSlug: string; 
                name: string;
                description?: string | null;
                imageUrl?: string | null;
                macros?: { 
                    calories?: number; 
                    protein?: number; 
                    carbs?: number; 
                    fat?: number 
                } | null;
                }},
            { db, user }: YogaContext
        ) {
            if (!user || user.role !== 'admin') throw new Error ('Unauthorized');

            const diningHallSlug = input.diningHallSlug?.trim();
            const name = input.name?.trim();

            if (!diningHallSlug || !name) throw new Error('Missing required fields');

            const normalizedName = normalizeName(name);

            // prevent duplicate items per hall
            // does this by searching the normalized (all lowercase) name of the item
            const existing = await db.collection(COLLECTIONS.MENU_ITEMS).findOne({
                diningHallSlug,
                normalizedName,
            });

            if (existing) return toMenuItem(existing);

            const doc = {
                diningHallSlug,
                name,
                normalizedName,
                description: input.description ?? null,
                imageUrl: input.imageUrl ?? null,
                macros: input.macros ?? null
            };

            try {
                const result = await db.collection(COLLECTIONS.MENU_ITEMS).insertOne(doc);
                const created = await db.collection(COLLECTIONS.MENU_ITEMS)
                    .findOne({_id: result.insertedId})
                return toMenuItem(created);
            } catch (err: any) {
                if (err?.code === 11000) {
                    const duplicated = await db.collection(COLLECTIONS.MENU_ITEMS)
                        .findOne({ diningHallSlug, normalizedName });
                    if (duplicated) return toMenuItem(duplicated);
                }
                throw err;
            }
        },

        async deleteMenuItem(_p: unknown, { id }: { id: string }, {db, user}: YogaContext) {
            if (!user || user.role !== 'admin') throw new Error('Unauthorized');
            const _id = new ObjectId(id);
            const res = await db.collection(COLLECTIONS.MENU_ITEMS).deleteOne({ _id });
            return res.deletedCount === 1;  
        },
    },
};