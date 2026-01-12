export type MacrosInput = {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
};
  
export type MenuItemInput = {
    diningHallSlug: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    macros?: MacrosInput | null;
    price?: number | null;
    tags?: string[] | null; // allergens/ingredients tags
};
  
