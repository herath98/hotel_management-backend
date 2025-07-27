import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const updateAllUsersProfileStatus = async () => {
    try {
        // Get all users
        const users = await prisma.users.findMany({
            include: {
                staff: true
            }
        });

        const updates = [];

        for (const user of users) {
            let isComplete = false;
            
            // For manager and staff roles, check if they exist in staff table
            if (user.role === 'manager' || user.role === 'staff') {
                isComplete = user.staff !== null;
            } else {
                // For admin role, profile is complete if they exist in users table
                isComplete = true;
            }

            // Update the user's profile_complete status
            await prisma.users.update({
                where: { id: user.id },
                data: { profile_complete: isComplete }
            });

            updates.push({
                id: user.id,
                username: user.username,
                role: user.role,
                profile_complete: isComplete
            });
        }

        console.log('Updated profile completion status for all users:', updates);
        return updates;
    } catch (error) {
        console.error('Error updating profile status:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

// Function to update a single user's profile status
export const updateSingleUserProfileStatus = async (userId) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { staff: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        let isComplete = false;
        
        // For manager and staff roles, check if they exist in staff table
        if (user.role === 'manager' || user.role === 'staff') {
            isComplete = user.staff !== null;
        } else {
            // For admin role, profile is complete if they exist in users table
            isComplete = true;
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { profile_complete: isComplete },
            select: {
                id: true,
                username: true,
                role: true,
                profile_complete: true
            }
        });

        console.log('Updated profile completion status for user:', updatedUser);
        return updatedUser;
    } catch (error) {
        console.error('Error updating profile status:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}; 