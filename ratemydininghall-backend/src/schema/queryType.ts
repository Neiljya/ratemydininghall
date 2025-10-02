/**
 * GraphQL Query type definition
 * 
 * Only types included in the Query type can be queried by clients
 * 
 * Put all possible queries in this type, these are the 
 * "list of commands" that clients can execute, clients can
 * choose what information they want to request
 * 
 * (i.e client only requests diningHalls name and id, not description or imageUrl)
 * 
 * Notation:
 * ! - non-nullable (must have a value)
 * [] - list/array
 * 
 * In this case, we have defined that any query for diningHalls should return
 * an array of DiningHall objects, and the array itself cannot be null
 * 
 * If a query is made for only name and id, we return an array of diningHalls including
 * only their name and id
 */
export const queryType = `
    type Query {
        diningHalls: [DiningHall!]!
        review(id: ID!): Review
        reviews: [Review!]!
        reviewsByHall(hallId: ID!): [Review!]!
    }
`;