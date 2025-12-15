import { put, del } from '@vercel/blob';
import type { Db } from 'mongodb';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authResolvers } from './auth';

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

type YogaContext = {
    req: VercelRequest;
    res: VercelResponse;
    db: Db;
};

type SubmitPendingReviewArgs = {
    input: {
        diningHallSlug: string;
        author: string;
        description: string;
        rating: number;
        imageUrl?: string | null;
    };
};

const vercelBlobAPI = 'https://api.vercel.com/v2/blob/upload-url';

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

        async deleteReview(
                _parent: unknown,
                { hallId, id }: DeleteReviewArgs
            ) {
                try {
                    await del(`reviews/${hallId}/${id}.json`);
                    return true;
                } catch (error) {
                    console.error('deleteReview failed: ', error);
                    return false;
                }
        },

        async submitPendingReview(
            _parent: unknown,
            { input }: SubmitPendingReviewArgs,
            { db }: YogaContext
        ) {
            const { diningHallSlug, author, description, rating, imageUrl } = input;

            if ( !diningHallSlug || !author || !description || typeof rating !== 'number') {
                throw new Error('Missing required fields');
            }

            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            const doc = {
                diningHallSlug,
                author,
                description,
                rating,
                imageUrl: imageUrl || null,
                createdAt: new Date(),
                status: 'pending',
            };

            const result = await db.collection('pendingReviews').insertOne(doc);

            return { ok: true, id: result.insertedId.toString() };
        },

        ...authResolvers.Mutation,
        
    
    },



};