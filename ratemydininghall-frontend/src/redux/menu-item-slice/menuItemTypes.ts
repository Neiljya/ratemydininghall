export type Macros = {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

export type MenuItem = {
  id: string;
  diningHallSlug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  macros?: Macros | null;

  avgRating: number;
  ratingCount: number;
};
