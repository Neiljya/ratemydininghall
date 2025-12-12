export const reviewType = `
    type Review {
        id: ID!
        diningHallSlug: String!
        author: String!
        description: String!
        createdAt: String!
        rating: Int!
        status: String
    }

    input SubmitPendingReviewInput {
        diningHallSlug: String!
        author: String!
        description: String!
        rating: Int!
        imageUrl: String
    }

    type PendingReviewResult {
        ok: Boolean!
        id: ID!
    }

    type ReviewUploadUrl {
        uploadUrl: String!
        key: String!
        publicUrl: String
    }
`;
