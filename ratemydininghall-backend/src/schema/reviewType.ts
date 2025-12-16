export const reviewType = `
    enum ReviewTargetType {
        DINING_HALL
        MENU_ITEM
    }

    type Review {
        id: ID!
        diningHallSlug: String!
        author: String!
        description: String!
        createdAt: String!
        rating: Int!
        status: String
        userId: ID

        # for selecting if its a dining hall rating or menu item rating
        targetType: ReviewTargetType!
        menuItemId: ID
    }

    input SubmitPendingReviewInput {
        diningHallSlug: String!
        author: String!
        description: String!
        rating: Int!
        imageUrl: String

        # for selecting if its a dining hall rating or menu item rating
        targetType: ReviewTargetType!
        menuItem: ID
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
