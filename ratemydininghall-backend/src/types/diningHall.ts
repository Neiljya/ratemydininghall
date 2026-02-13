export type DiningHallInput = {
    slug: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    parentHallSlug?: string | null;
}

export type CreateDiningHallArgs = {
    input: {
        name: string;
        slug: string;
        imageUrl?: string | null;
        description?: string | null;
        parentHallSlug?: string | null;
    };
};

export type UpdateDiningHallArgs = {
    input: {
        id: string;
        name?: string | null;
        slug?: string | null;
        imageUrl?: string | null;
        description?: string | null;
        parentHallSlug?: string | null;
    };
};

export type DeleteDiningHallArgs = {
    id: string;
};