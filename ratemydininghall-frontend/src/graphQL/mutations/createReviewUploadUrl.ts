import { graphQLRequest } from "@graphQL/graphQLClient";
import { createReviewUploadUrlMutation } from "@graphQL/queries/reviewQueries";

export async function createReviewUploadUrl(
    input: {
        diningHallId: string;
        filename: string;
        contentType: string;
    },
    token?: string | null,
) {
    return graphQLRequest(createReviewUploadUrlMutation,
        input,
        token
    );
}