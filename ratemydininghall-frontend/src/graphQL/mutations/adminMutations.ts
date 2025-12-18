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

export const CREATE_DINING_HALL = `
    mutation CreateDiningHall($input: CreateDiningHallInput!) {
      createDiningHall(input: $input) {
        id
        slug
        name
        imageUrl
        description
      }
  }
`;

export const UPDATE_DINING_HALL = `
  mutation UpdateDiningHall($input: UpdateDiningHallInput!) {
    updateDiningHall(input: $input)
  }
`;

export const DELETE_DINING_HALL = `
  mutation DeleteDiningHall($id: ID!) {
    deleteDiningHall(id: $id)
  }
`;

// for multiple menu items
export const CREATE_MENU_ITEMS_BATCH = `
  mutation CreateMenuItemsBatch($input: CreateMenuItemsBatchInput!) {
    ok
    createdIds
  }
`;

export const CREATE_MENU_ITEM = `
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      id
      diningHallSlug
      name
    }
  }
`;

export const UPDATE_MENU_ITEM = `
  mutation UpdateMenuItem($id: ID!, $input: UpdateMenuItemInput!) {
    updateMenuItem(id: $id, input: $input)
  }
`;

export const DELETE_MENU_ITEM = `
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;
