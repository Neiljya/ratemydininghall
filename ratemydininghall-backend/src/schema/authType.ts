export const authType = `
    type AuthStatus {
        ok: Boolean!
        role: String
    }

    input LoginInput {
        username: String!
        password: String!
    }

    extend type Query {
        me: AuthStatus!
    }

    extend type Mutation {
        login(input: LoginInput!): AuthStatus!
        logout: Boolean!
        refreshSession: AuthStatus!
    }
`;
