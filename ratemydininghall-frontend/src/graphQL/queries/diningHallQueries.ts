export const getDiningHallsQuery = `
      query GetDiningHalls {
        diningHalls {
          id
          slug
          name
          description
          imageUrl
        }
      }
    `;