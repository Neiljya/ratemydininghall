export const diningHallType = `
    type DiningHall {
        id: ID!
        slug: String!
        name: String!
        description: String!
        imageUrl: String!
        parentHallSlug: String
    }

    input CreateDiningHallInput {
        name: String!
        slug: String!
        imageUrl: String
        description: String
        parentHallSlug: String
    }
        
    input UpdateDiningHallInput {
        id: ID!
        name: String
        slug: String
        imageUrl: String
        description: String
        parentHallSlug: String
    }

    input MacrosInput {
        calories: Int
        protein: Int
        carbs: Int
        fat: Int
    }

    input CreateMenuItemInput {
        diningHallSlug: String!
        name: String!
        description: String
        imageUrl: String
        macros: MacrosInput
        price: Float
        category: String
        tags: [String!]!
    }

    input CreateMenuItemsBatchInput {
        diningHallSlug: String!
        items: [CreateMenuItemInput!]!
    }

    type BatchCreateResult {
        ok: Boolean!
        createdIds: [ID!]!
    }

    extend type Mutation {
        createDiningHall(input: CreateDiningHallInput!): DiningHall!
        updateDiningHall(input: UpdateDiningHallInput!): Boolean!
        deleteDiningHall(id: ID!): Boolean!

        createMenuItem(input: CreateMenuItemInput!): MenuItem!
        createMenuItemsBatch(input: CreateMenuItemsBatchInput!): BatchCreateResult!
    }
`;