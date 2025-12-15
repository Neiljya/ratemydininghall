export const reviewType = `
    type Review {
        id: ID!
        diningHallSlug: String!
        author: String!
        description: String!
        createdAt: String!
        rating: Int!
        status: String
        userId: ID
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

    extend type Mutation {
        submitPendingReview(input: SubmitPendingReviewInput!): PendingReviewResult!

        # moderation actions (will be admin only, implemented through resolver checks)
        approvePendingReview(id: ID!): Boolean!
        rejectPendingReview(id: ID!): Boolean!
        moveAcceptedToPending(id: ID!): Boolean!
        deleteReview(id: ID!): Boolean!
    }

    extend type Query {
        pendingReviews: [Review!]!
        acceptedReviews: [Review!]!
    }
`;
