/**
 * GraphQL Mutation type definition
 * 
 * Mutations are functions that clients are allowed to use to modify
 * data on the server (create, update, delete) similar to RESTful POST, PUT, DELETE
 * 
 * Put all possible mutations in this type, these are the
 * 
 * These are the "list of commands" that clients can execute to modify data
 */
export const mutationType = `
    type Mutation {
        createReview(
            hallId: ID!
            author: String!
            description: String!
            rating: Int!
            imageUrl: String
        ): Review!

        deleteReview(id: ID!): Boolean!
        `
