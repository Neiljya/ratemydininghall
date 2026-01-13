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
        tags: doc.tags ?? [],
        price: doc.price ?? 0,
        category: doc.category ?? null
    };
}

function normalizeName(name: string) {
    return name.trimEnd().toLowerCase();
}

/**
 * a helper function that normalizes/cleans tag inputs and
 * ensures a unique tag array to put inside the db
 * 
 * @param tags - an array of ingredient strings
 * @returns an array of distinct tag strings
 */
function processTags(tags: string[] | null | undefined): string[] {
    if (!tags || !Array.isArray(tags)) return [];

    const cleanTags = tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    
    return Array.from(new Set(cleanTags));
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
                tags?: string[] | null;
                price?: number | null;
                category?: string | null;
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

            const uniqueTags = processTags(input.tags);

            const doc = {
                diningHallSlug,
                name,
                normalizedName,
                description: input.description ?? null,
                imageUrl: input.imageUrl ?? null,
                macros: input.macros ?? null,
                tags: uniqueTags ?? null,
                price: input.price ?? null,
                category: input.category ?? null,
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

        async updateMenuItem(
        _p: unknown,
        {
            id,
            input,
        }: {
            id: string;
            input: {
            diningHallSlug?: string | null;
            name?: string | null;
            description?: string | null;
            imageUrl?: string | null;
            macros?: {
                calories?: number | null;
                protein?: number | null;
                carbs?: number | null;
                fat?: number | null;
            } | null;
            tags?: string[] | null;
            price?: number | null;
            category?: string | null;
            };
        },
        { db, user }: YogaContext
        ) {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");

        const _id = new ObjectId(id);

        const existing = await db.collection(COLLECTIONS.MENU_ITEMS).findOne({ _id });
        if (!existing) throw new Error("Menu item not found");

        // compute next values 
        const nextDiningHallSlug = (input.diningHallSlug ?? existing.diningHallSlug)?.trim();
        const nextName = (input.name ?? existing.name)?.trim();

        if (!nextDiningHallSlug || !nextName) throw new Error("Missing required fields");

        const nextNormalizedName = normalizeName(nextName);

        // prevents duplicates per hall IF hall/name changes
        const hallChanged = nextDiningHallSlug !== existing.diningHallSlug;
        const nameChanged = nextNormalizedName !== (existing.normalizedName ?? normalizeName(existing.name));

        if (hallChanged || nameChanged) {
            const dupe = await db.collection(COLLECTIONS.MENU_ITEMS).findOne({
            _id: { $ne: _id },
            diningHallSlug: nextDiningHallSlug,
            normalizedName: nextNormalizedName,
            });

            if (dupe) {
            throw new Error("A menu item with this name already exists for that dining hall");
            }
        }

        const $set: any = {
            diningHallSlug: nextDiningHallSlug,
            name: nextName,
            normalizedName: nextNormalizedName,
        };

        // only set fields if provided otherwise keep existing ones
        if ("description" in input) $set.description = input.description ?? null;
        if ("imageUrl" in input) $set.imageUrl = input.imageUrl ?? null;
        if ("macros" in input) $set.macros = input.macros ?? null;
        if ("category" in input) $set.category = input.category ?? null;
        
        if ("price" in input) {
            $set.price = input.price ?? null;
        }

        if ("tags" in input) {
            $set.tags = processTags(input.tags);
        }

        await db.collection(COLLECTIONS.MENU_ITEMS).updateOne({ _id }, { $set });

        const updated = await db.collection(COLLECTIONS.MENU_ITEMS).findOne({ _id });
        return toMenuItem(updated);
        },
    },
};