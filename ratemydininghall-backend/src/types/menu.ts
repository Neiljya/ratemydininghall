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
    category?: string | null;
    tags?: string[] | null; // allergens/ingredients tags
};

export type CreateMenuItemArgs = {
    input: {
        diningHallSlug: string;
        name: string;
        description?: string | null;
        imageUrl?: string | null;
        macros?: {
            calories?: number | null;
            protein?: number | null;
            carbs?: number | null;
            fat?: number | null;
        } | null;
        tags?: string[] | null;
        price?: number | null;
        category?: string | null;
    };
};

export type CreateMenuItemsBatchArgs = {
    input: {
        diningHallSlug: string;
        items: Array<CreateMenuItemArgs['input']>;
    };
};
