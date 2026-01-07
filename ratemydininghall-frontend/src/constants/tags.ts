export const TAG_REGISTRY: Record<string, string> = {
    "peanut": "🥜 Peanut",
    "vegan": "🌱 Vegan",
    "vegetarian": "Vegetarian",
    "gluten_free": "Gluten Free",
    "halal": "Halal",
    "dairy_free": "Dairy Free",
    "soy": "Soy",
    "egg": "Egg",
    "tree_nut": "Tree Nut",
    "fish": "Fish",
    "shellfish": "Shellfish",
    "wheat": "Wheat"
};

/**
 * Helper to get the display name
 */
export const getTagName = (tagId: string): string => {
    return TAG_REGISTRY[tagId] || '';
}