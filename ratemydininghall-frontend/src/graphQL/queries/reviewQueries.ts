export const getAllReviewsQuery = `
    query GetAllReviews {
    reviews {
        id
        diningHallSlug
        author
        description
        createdAt
        rating
    }
}`;

export const getReviewsByHallQuery = `
    query GetReviewsByHall($diningHallId: String!) {
        reviewsByHall(diningHallId: $diningHallId) {
            id
            diningHallSlug
            author
            description
            createdAt
            rating
        }
}`;