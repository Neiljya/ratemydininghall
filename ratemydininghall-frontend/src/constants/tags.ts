export const TAG_REGISTRY: Record<string, string> = {
    "peanut": "🥜 Peanut",
    "vegan": "🌱 Vegan",
    "vegetarian": "Vegetarian",
    "gluten": "Gluten",
    "halal": "Halal",
    "dairy": "Dairy",
    "soy": "Soy",
    "egg": "Egg",
    "tree_nut": "Tree Nut",
    "fish": "Fish",
    "shellfish": "Shellfish",
    "wheat": "Wheat",
    "sesame": "Sesame",
    "meat": "Meat"
};

/**
 * Helper to get the display name
 */
export const getTagName = (tagId: string): string => {
    return TAG_REGISTRY[tagId] || '';
}