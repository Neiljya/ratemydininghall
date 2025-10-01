
/**
 * Utility function to convert a Unix timestamp (in milliseconds) to a formatted date string.
 * Only supports US format for now, military time can be added in future
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string like "Oct 1, 2023, 8:25 PM"
 */
export function formatReviewDate(timestamp: number): string {
    const date = new Date(timestamp);

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}