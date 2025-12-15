export const approvePendingReviewMutation = `
  mutation ApprovePendingReview($id: ID!) {
    approvePendingReview(id: $id)
  }
`;

export const rejectPendingReviewMutation = `
  mutation RejectPendingReview($id: ID!) {
    rejectPendingReview(id: $id)
  }
`;

export const moveAcceptedToPendingMutation = `
  mutation MoveAcceptedToPending($id: ID!) {
    moveAcceptedToPending(id: $id)
  }
`;

export const deleteReviewMutation = `
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;
