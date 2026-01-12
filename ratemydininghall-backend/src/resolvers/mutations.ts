import { put, del } from '@vercel/blob';
import { ObjectId } from 'mongodb';
import { YogaContext } from '../types/yogaContext';
import { authResolvers } from './auth';
import { COLLECTIONS } from '../db/collections';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY = 'https://www.google.com/recaptcha/api/siteverify'

// ADMIN ONLY 

type CreateDiningHallArgs = {
  input: {
    name: string;
    slug: string;
    imageUrl?: string | null;
    description?: string | null;
    parentHallSlug?: string | null;
  };
};

type UpdateDiningHallArgs = {
  input: {
    id: string;
    name?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    parentHallSlug?: string | null;
  };
};

type DeleteDiningHallArgs = {
  id: string;
};

type CreateMenuItemArgs = {
  input: {
    diningHallSlug: string;
    name: string;
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
  };
};

type CreateMenuItemsBatchArgs = {
  input: {
    diningHallSlug: string;
    items: Array<CreateMenuItemArgs['input']>;
  };
};

// ****************************************** //
type CreateReviewArgs = {
    diningHallId: string;
    author: string;
    description: string;
    rating: number;
    imageUrl?: string | null;
};

type CreateReviewUploadUrlArgs = {
    diningHallId: string;
    filename: string;
    contentType: string;
};

type DeleteReviewArgs = {
    hallId: string;
    id: string;
};


type SubmitPendingReviewArgs = {
    input: {
        diningHallSlug: string;
        author: string;
        description: string;
        rating: number;
        imageUrl?: string | null;
        menuItemId?: string | null;
        captchaToken: string;
    };
};

const vercelBlobAPI = 'https://api.vercel.com/v2/blob/upload-url';

type ReviewTargetType = 'DINING_HALL' | 'MENU_ITEM';

const assertValidTarget = (input: any): ReviewTargetType => {
  const hasMenuItem = !!input.menuItemId;

  // infer target type
  const targetType: ReviewTargetType = hasMenuItem ? 'MENU_ITEM' : 'DINING_HALL';

  if (targetType === 'MENU_ITEM' && !input.menuItemId) {
    throw new Error('menuItemId is required when targetType is MENU_ITEM');
  }

  return targetType;
};

function normalizeTargetFromDoc(doc: any): { targetType: ReviewTargetType; menuItemId: string | null } {
  const menuItemId = doc.menuItemId ?? null;
  const targetType: ReviewTargetType =
    doc.targetType ??
    (menuItemId ? 'MENU_ITEM' : 'DINING_HALL');

  return { targetType, menuItemId: targetType === 'MENU_ITEM' ? menuItemId : null };
}

function requireAdmin(ctx: YogaContext) {
    if (!ctx.user || ctx.user.role !== 'admin') throw new Error('Unauthorized');
}

async function cascadeDiningHallSlug(db: any, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;

  await db.collection(COLLECTIONS.MENU_ITEMS).updateMany(
    { diningHallSlug: oldSlug },
    { $set: { diningHallSlug: newSlug } }
  );

  await db.collection(COLLECTIONS.REVIEWS).updateMany(
    { diningHallSlug: oldSlug },
    { $set: { diningHallSlug: newSlug } }
  );

  await db.collection(COLLECTIONS.PENDING_REVIEWS).updateMany(
    { diningHallSlug: oldSlug },
    { $set: { diningHallSlug: newSlug } }
  );
}



export const mutationResolvers = {
    Mutation: {
        // 1) Ask for a one-time signed upload URL (browser PUT file to this URL)
        async createReviewUploadUrl(
            _parent: unknown,
            { diningHallId, filename, contentType }: CreateReviewUploadUrlArgs
        ) {
            const response = await fetch(vercelBlobAPI, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.VERCEL_BLOB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contentType,
                    metadata: { diningHallId, filename },
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating upload URL: ${response.status}: ${text}`);
            }

            const { url, pathname } = await response.json();

            return {
                uploadUrl: url,
                key: pathname,
                publicUrl: null
            };
        },

        async createReview(
            _parent: unknown,
            { diningHallId, author, description, rating, imageUrl }: CreateReviewArgs
        ) {
            const id = crypto.randomUUID();
            const createdAt = new Date().toISOString();

            const review = {
                id,
                diningHallId: diningHallId,
                author,
                description,
                rating,
                createdAt,
                imageUrl: imageUrl ?? null
            };

            const key = `reviews/${diningHallId}/${id}.json`;
            await put(key, JSON.stringify(review), {
                access: 'public',
                contentType: 'application/json',
            });

            return review;
        },

        async submitPendingReview(
            _parent: unknown,
            { input }: SubmitPendingReviewArgs,
            { db }: YogaContext
        ) {
            const {
                diningHallSlug, 
                author, 
                description, 
                rating, 
                imageUrl,
                menuItemId,
                captchaToken
            } = input;

            // captcha verification before uploading/processing any data
            if (!captchaToken) {
                throw new Error('Captcha token is missing');
            }

            const params = new URLSearchParams({
                secret: RECAPTCHA_SECRET_KEY as string,
                response: captchaToken
            })

            const verifyResponse = await fetch(RECAPTCHA_VERIFY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: params.toString()
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                console.error('Captcha failed:', verifyData['error-codes']);
                throw new Error('Captcha verification failed');
            }
            // ************************************************************

            if ( !diningHallSlug || !author || !description || typeof rating !== 'number') {
                throw new Error('Missing required fields');
            }

            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            const targetType = assertValidTarget(input);

            const doc = {
                diningHallSlug,
                author,
                description,
                rating,
                imageUrl: imageUrl || null,
                createdAt: new Date(),
                status: 'pending',
                targetType,
                menuItemId: targetType === 'MENU_ITEM' ? menuItemId : null,
            };

            const result = await db.collection(COLLECTIONS.PENDING_REVIEWS).insertOne(doc);

            return { ok: true, id: result.insertedId.toString() };
        },

        async approvePendingReview(_p: unknown, { id }: {id: string}, ctx: YogaContext) {
            requireAdmin(ctx);

            const _id = new ObjectId(id);
            const pending = await ctx.db.collection(COLLECTIONS.PENDING_REVIEWS).findOne({ _id });
            if (!pending) return false;

            const { targetType, menuItemId } = normalizeTargetFromDoc(pending);

            const acceptedDoc = {
                diningHallSlug: pending.diningHallSlug,
                author: pending.author,
                description: pending.description,
                rating: pending.rating,
                imageUrl: pending.imageUrl ?? null,
                createdAt: pending.createdAt ?? new Date(),
                status: 'accepted',
                userId: pending.userId ?? null,
                targetType,
                menuItemId,
            };

            await ctx.db.collection(COLLECTIONS.REVIEWS).insertOne(acceptedDoc);
            await ctx.db.collection(COLLECTIONS.PENDING_REVIEWS).deleteOne({ _id });

            return true;
        },

        async rejectPendingReview(_p: unknown, { id }: { id: string }, ctx: YogaContext) {
            requireAdmin(ctx);
            const _id = new ObjectId(id);
            const res = await ctx.db.collection(COLLECTIONS.PENDING_REVIEWS).deleteOne({ _id });
            return res.deletedCount === 1;
        },

        async moveAcceptedToPending(_p: unknown, { id }: { id: string }, ctx: YogaContext) {
            requireAdmin(ctx);

            const _id = new ObjectId(id);
            const accepted = await ctx.db.collection(COLLECTIONS.REVIEWS).findOne({ _id });
            if (!accepted) return false;

            const { targetType, menuItemId } = normalizeTargetFromDoc(accepted);

            const pendingDoc = {
                diningHallSlug: accepted.diningHallSlug,
                author: accepted.author,
                description: accepted.description,
                rating: accepted.rating,
                imageUrl: accepted.imageUrl ?? null,
                createdAt: accepted.createdAt ?? new Date(),
                status: 'pending',
                userId: accepted.userId ?? null,
                targetType,
                menuItemId,
            };

            await ctx.db.collection(COLLECTIONS.PENDING_REVIEWS).insertOne(pendingDoc);
            await ctx.db.collection(COLLECTIONS.REVIEWS).deleteOne({ _id });

            return true;
        },

        async deleteReview(_p: unknown, { id }: { id: string }, ctx: YogaContext) {
            requireAdmin(ctx);
            const _id = new ObjectId(id);
            const res = await ctx.db.collection(COLLECTIONS.REVIEWS).deleteOne({ _id });
            return res.deletedCount === 1;
        },

        async createDiningHall(_p: unknown, { input }: CreateDiningHallArgs, ctx: YogaContext) {
            requireAdmin(ctx);

            const name = input.name?.trim();
            const slug = input.slug?.trim();
            const parentHallSlug = input.parentHallSlug?.trim();

            if (!name || !slug) throw new Error('name and slug are required');

            const existing = await ctx.db.collection(COLLECTIONS.DINING_HALLS).findOne({ slug });
            if (existing) throw new Error('Dining hall slug already exists');

            const doc = {
                name,
                slug,
                imageUrl: input.imageUrl?.trim() || null,
                description: input.description?.trim() || null,
                parentHallSlug: parentHallSlug || null,
                createdAt: new Date(),
            };

            const res = await ctx.db.collection(COLLECTIONS.DINING_HALLS).insertOne(doc);

            return {
                id: res.insertedId.toString(),
                name: doc.name,
                slug: doc.slug,
                imageUrl: doc.imageUrl,
                description: doc.description,
            };
        },

        async updateDiningHall(_p: unknown, { input }: UpdateDiningHallArgs, ctx: YogaContext) {
            requireAdmin(ctx);

            const _id = new ObjectId(input.id);
            const hall = await ctx.db.collection(COLLECTIONS.DINING_HALLS).findOne({ _id });
            if (!hall) throw new Error('Dining hall not found');

            const patch: Record<string, any> = {};

            if (typeof input.name === 'string') patch.name = input.name.trim();
            if (typeof input.imageUrl === 'string') patch.imageUrl = input.imageUrl.trim() || null;
            if (typeof input.description === 'string') patch.description = input.description.trim() || null;

            if (typeof input.parentHallSlug === 'string') {
                const v = input.parentHallSlug.trim();
                patch.parentHallSlug = v ? v : null;
            }

            let newSlug: string | null = null;
            if (typeof input.slug === 'string') {
                newSlug = input.slug.trim();
                if (!newSlug) throw new Error('slug cannot be empty');

                const conflict = await ctx.db.collection(COLLECTIONS.DINING_HALLS).findOne({
                slug: newSlug,
                _id: { $ne: _id },
                });
                if (conflict) throw new Error('Slug already in use');

                patch.slug = newSlug;
            }

            if (Object.keys(patch).length === 0) return true;

            await ctx.db.collection(COLLECTIONS.DINING_HALLS).updateOne({ _id }, { $set: patch });

            // cascade if slug changed
            if (newSlug && newSlug !== hall.slug) {
                await cascadeDiningHallSlug(ctx.db, hall.slug, newSlug);
            }

            return true;
        },

        async deleteDiningHall(_p: unknown, { id }: DeleteDiningHallArgs, ctx: YogaContext) {
            requireAdmin(ctx);

            const _id = new ObjectId(id);
            const hall = await ctx.db.collection(COLLECTIONS.DINING_HALLS).findOne({ _id });
            if (!hall) return false;

            // delete hall
            const res = await ctx.db.collection(COLLECTIONS.DINING_HALLS).deleteOne({ _id });

            // cleanup related docs (recommended)
            await ctx.db.collection(COLLECTIONS.MENU_ITEMS).deleteMany({ diningHallSlug: hall.slug });
            await ctx.db.collection(COLLECTIONS.REVIEWS).deleteMany({ diningHallSlug: hall.slug });
            await ctx.db.collection(COLLECTIONS.PENDING_REVIEWS).deleteMany({ diningHallSlug: hall.slug });

            return res.deletedCount === 1;
        },

        async createMenuItem(_p: unknown, { input }: CreateMenuItemArgs, ctx: YogaContext) {
            requireAdmin(ctx);

            const diningHallSlug = input.diningHallSlug?.trim();
            const name = input.name?.trim();
            if (!diningHallSlug || !name) throw new Error('diningHallSlug and name are required');

            const doc = {
                diningHallSlug,
                name,
                description: input.description?.trim() || null,
                imageUrl: input.imageUrl?.trim() || null,
                macros: input.macros ?? null,
                tags: input.tags ?? null,
                price: input.price ?? null,
                createdAt: new Date(),
            };

            const res = await ctx.db.collection(COLLECTIONS.MENU_ITEMS).insertOne(doc);

            return {
                id: res.insertedId.toString(),
                diningHallSlug: doc.diningHallSlug,
                name: doc.name,
                description: doc.description,
                imageUrl: doc.imageUrl,
                macros: doc.macros,
                price: doc.price,
                tags: doc.tags,
            };
        },

        async createMenuItemsBatch(_p: unknown, { input }: CreateMenuItemsBatchArgs, ctx: YogaContext) {
            requireAdmin(ctx);

            const diningHallSlug = input.diningHallSlug?.trim();
            if (!diningHallSlug) throw new Error('diningHallSlug is required');

            const items = (input.items ?? []).map((it) => ({
                diningHallSlug,
                name: it.name?.trim(),
                description: it.description?.trim() || null,
                imageUrl: it.imageUrl?.trim() || null,
                macros: it.macros ?? null,
                tags: it.tags ?? null,
                price: it.price ?? null,
                createdAt: new Date(),
            }));

            const valid = items.filter((x) => x.name);
            if (valid.length === 0) throw new Error('No valid items');

            const res = await ctx.db.collection(COLLECTIONS.MENU_ITEMS).insertMany(valid);

            return { ok: true, createdIds: Object.values(res.insertedIds).map((x) => x.toString()) };
        },


        ...authResolvers.Mutation,
    },


        
    
};



