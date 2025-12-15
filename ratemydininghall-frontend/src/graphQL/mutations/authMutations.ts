export const loginMutation = `
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            ok
            role
        }
    }
`

export const logoutMutation = `
    mutation Logout {
        logout
    }
`;

export const refreshSessionMutation = `
    mutation RefreshSession {
        refreshSession {
            ok
            role
        }
    }
`;