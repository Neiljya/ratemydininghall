export type CreateReviewArgs = {
    diningHallId: string;
    author: string;
    description: string;
    rating: number;
    imageUrl?: string | null;
};

export type CreateReviewUploadUrlArgs = {
    diningHallId: string;
    filename: string;
    contentType: string;
};

export type DeleteReviewArgs = {
    hallId: string;
    id: string;
};

export type SubmitPendingReviewArgs = {
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