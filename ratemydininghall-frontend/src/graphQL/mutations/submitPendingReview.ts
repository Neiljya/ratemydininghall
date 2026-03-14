import { graphQLRequest } from '@graphQL/graphQLClient';
import { submitPendingReviewMutation } from '@graphQL/queries/reviewQueries';
import type { NewReviewInput } from '@redux/review-slice/reviewSlice';

export async function submitPendingReview(input: NewReviewInput, token?: string | null) {
  const data = await graphQLRequest<{
    submitPendingReview: { ok: boolean; id: string };
  }>(submitPendingReviewMutation, { input }, token);

  return data.submitPendingReview;
}
