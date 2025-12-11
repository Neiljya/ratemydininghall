const GRAPHQL_ENDPOINT =
  import.meta.env.DEV
    ? 'http://localhost:3000/api/graphql'
    : import.meta.env.VITE_GRAPHQL_ENDPOINT;

    type GraphQLResponse<T> = {
        data?: T;
        errors?: { message?: string }[];
    };


/**
 * Generic function to make GraphQL requests
 * 
 * @param query - GraphQL query string
 * @param variables - Optional variables for the query
 * @returns - Parsed data of type TData
 */
export async function graphQLRequest<TData>(
        query: string,
        variables?: Record<string, any>
    ): Promise<TData> {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`GraphQL request failed: ${response.status}: ${text}`);
        }

        const json = (await response.json()) as GraphQLResponse<TData>;

        if (json.errors && json.errors.length > 0) {
            throw new Error(json.errors[0].message ?? 'GraphQL request failed');
        }

        if (!json.data) {
            throw new Error('GraphQL request returned no data');
        }

        return json.data;
    }
    