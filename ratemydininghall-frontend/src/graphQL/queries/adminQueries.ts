export const getPendingReviewsQuery = `
  query GetPendingReviews {
    pendingReviews {
      id
      diningHallSlug
      author
      description
      rating
      createdAt
      status
    }
  }
`;

export const getAcceptedReviewsQuery = `
  query GetAcceptedReviews {
    acceptedReviews {
      id
      diningHallSlug
      author
      description
      rating
      createdAt
      status
    }
  }
`;