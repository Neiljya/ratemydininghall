import type { Db } from 'mongodb';
import { COLLECTIONS } from '../collections';

export type MenuItemWithRatingsDoc = {
  _id: any;
  diningHallSlug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  macros?: any | null;
  avgRating: number;
  ratingCount: number;
  tags?: string[] | null;
  price?: number | null;
};

// acts like a whitelist 
export async function getMenuItemsWithRatingsByHall(
  db: Db,
  diningHallSlug: string
): Promise<MenuItemWithRatingsDoc[]> {
  const pipeline = [
    { $match: { diningHallSlug } },

    {
      $lookup: {
        from: COLLECTIONS.REVIEWS,
        // reviews.menuItemId is assumed to be a string of the menuItems _id
        let: { menuItemId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$targetType', 'MENU_ITEM'] },
                  { $eq: ['$menuItemId', '$$menuItemId'] },
                  { $eq: ['$status', 'accepted'] }, // only accepted reviews will be computed
                ],
              },
            },
          },
          { $project: { rating: 1 } },
        ],
        as: 'matchedReviews',
      },
    },

    {
      $addFields: {
        ratingCount: { $size: '$matchedReviews' },
        avgRating: {
          $cond: [
            { $gt: [{ $size: '$matchedReviews' }, 0] },
            { $avg: '$matchedReviews.rating' },
            0,
          ],
        },
      },
    },

    {
      $project: {
        _id: 1,
        diningHallSlug: 1,
        name: 1,
        description: 1,
        imageUrl: 1,
        macros: 1,
        avgRating: 1,
        ratingCount: 1,
        tags: 1,
        price: 1
      },
    },

    { $sort: { name: 1 } },
  ];

  return db.collection(COLLECTIONS.MENU_ITEMS).aggregate<MenuItemWithRatingsDoc>(pipeline).toArray();
}
