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
        userId
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
            userId
        }
}`;

export const getMyReviewsQuery = `
    query GetMyReviews {
        myReviews {
            id
            diningHallSlug
            author
            description
            createdAt
            rating
            status
            targetType
            menuItemId
            userId
        }
    }
`;

export const submitPendingReviewMutation = `
  mutation SubmitPendingReview($input: SubmitPendingReviewInput!) {
    submitPendingReview(input: $input) {
      ok
      id
    }
  }
`;

export const createReviewUploadUrlMutation = `
      mutation CreateReviewUploadUrl(
        $diningHallId: String!
        $filename: String!
        $contentType: String!
      ) {
        createReviewUploadUrl(
          diningHallId: $diningHallId
          filename: $filename
          contentType: $contentType
        ) {
          uploadUrl
          key
          publicUrl
        }
      }
`