export const COLLECTIONS = {
    DINING_HALLS: 'diningHalls',
    REVIEWS: 'reviews',
    PENDING_REVIEWS: 'pendingReviews',
    MENU_ITEMS: 'menuItems',
    USERS: 'users'
} as const

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];