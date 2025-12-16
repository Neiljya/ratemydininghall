import { put, del } from '@vercel/blob';
import { ObjectId } from 'mongodb';
import { YogaContext } from '../types/yogaContext';
import { authResolvers } from './auth';
import { COLLECTIONS } from '../db/collections';

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
                menuItemId
            } = input;

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

        ...authResolvers.Mutation,
    },


        
    
};



