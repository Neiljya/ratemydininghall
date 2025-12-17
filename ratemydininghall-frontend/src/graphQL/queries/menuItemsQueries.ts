export const MENU_ITEMS_BY_HALL = `
  query MenuItemsByHall($diningHallSlug: String!) {
    menuItemsByHall(diningHallSlug: $diningHallSlug) {
      id
      diningHallSlug
      name
      description
      imageUrl
      macros { calories protein carbs fat }
      avgRating
      ratingCount
    }
  }
`;

export const SEARCH_MENU_ITEMS = `
  query SearchMenuItems($diningHallSlug: String!, $q: String!) {
    searchMenuItems(diningHallSlug: $diningHallSlug, q: $q) {
      id
      diningHallSlug
      name
      imageUrl
      avgRating
      ratingCount
    }
  }
`;
