export const menuItemType = `
    type Macros {
        calories: Int
        protein: Int
        carbs: Int
        fat: Int
    }

    type MenuItem {
        id: ID!
        diningHallSlug: String!
        name: String!
        description: String
        imageUrl: String
        macros: Macros
        avgRating: Float!
        ratingCount: Int!
    }

    # inputs are like parameters

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
    }

    extend type Query {
        menuItemsByHall(diningHallSlug: String!): [MenuItem!]!
        menuItem(id: ID!): MenuItem
        searchMenuItems(diningHallSlug: String!, q: String!): [MenuItem!]!
    }

    extend type Mutation {
        createMenuItem(input: CreateMenuItemInput!): MenuItem!
        deleteMenuItem(id: ID!): Boolean!
    }
`;