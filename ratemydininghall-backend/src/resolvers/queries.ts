export const queryResolvers = {
    Query: {
        // hardcoded data for testing purposes, eventually will connect to a database/blob storage
        diningHalls: () => [
            { id: "bistro",
              name: "The Bistro",
              description: "Fresh options",
              imageUrl: "https://picsum.photos/seed/bistro/400/24"
            }
        ],
        review: () => null,
        reviews: () => [],
        reviewsByHall: () => []
    }
};