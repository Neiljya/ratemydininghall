
import clerkClient from '@clerk/clerk-sdk-node';

export const typeResolvers = {
    Review: {
        author: async (parent: any) => {
            if (parent.userId) {
                try {
                    const user = await clerkClient.users.getUser(parent.userId);
                    return user.username || user.firstName || 'Anonymous';
                } catch (err) {
                    console.error('Error fetching user for review author:', err);
                    return parent.author || 'Deleted User';
                }
            }

            return parent.author || 'Anonymous';
        }
    }
};