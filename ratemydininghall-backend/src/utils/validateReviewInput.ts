export interface ReviewInput {
    diningHallSlug: string;
    author: string;
    description: string;
    rating: number;
    menuItemId?: string | null;
    imageUrl?: string | null;
}

export type ReviewTargetType = 'DINING_HALL' | 'MENU_ITEM';


export function validateReviewInput(input: ReviewInput): { targetType: ReviewTargetType } {
    const { diningHallSlug, author, description, rating, menuItemId } = input;

    if (!diningHallSlug || !author || !description) {
        throw new Error('Missing required fields: diningHallSlug, author, and description are mandatory.');
    }

    if (typeof rating !== 'number') {
        throw new Error('Rating must be a number.');
    }
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5.');
    }

    const targetType: ReviewTargetType = menuItemId ? 'MENU_ITEM' : 'DINING_HALL';

    return { targetType };
}