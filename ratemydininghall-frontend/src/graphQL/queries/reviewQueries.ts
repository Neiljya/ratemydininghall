export const getAllReviewsQuery = `
    query GetAllReviews {
    reviews {
        id
        diningHallSlug
        author
        description
        createdAt
        rating
        status
        targetType
        menuItemId
    }
}`;

export const getReviewsByHallQuery = `
    query GetReviewsByHall($hallSlug: String!) {
        reviewsByHall(hallSlug: $hallSlug) {
            id
            diningHallSlug
            author
            description
            createdAt
            rating
            status
            targetType
            menuItemId
        }
}`;

export const submitPendingReviewMutation = `
  mutation SubmitPendingReview($input: SubmitPendingReviewInput!) {
    submitPendingReview(input: $input) {
      ok
      id
    }
  }
`;
