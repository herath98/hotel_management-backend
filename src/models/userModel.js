import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const createUser = async (username, firstName, lastName, email, hashedPassword, role, mobile, address) => {
    return await prisma.users.create({
        data: {
            username,
            firstname: firstName,
            lastname: lastName,
            email,
            password: hashedPassword,
            role,
            mobile,
            address,
            profile_complete: false, // Default to false for new users
        },
    });
};

export const findUserByUsername = async (username) => {
    return await prisma.users.findUnique({
        where: {
            username,
        },
    });
};


export const findUserById = async (userId) => {
    return await prisma.users.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            role: true,
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            address: true,
            profile_complete: true,
        },
    });
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;

    if (role === 'admin' && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Only admins can assign admin role' });
    }

    try {
        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id, 10),
            },
            data: {
                username,
                role,
            },
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};


export const getAllUsersFromDB = async () => {
    return await prisma.users.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            address: true,
        },
    });
};

export const deleteUserById = async (id) => {
    // First, check if user is staff
    const user = await prisma.users.findUnique({
        where: { id: parseInt(id, 10) },
        select: { role: true }
    });

    // If staff, delete from staff table first
    if (user && (user.role === 'staff' ||  user.role === 'manager')) {
        await prisma.staff.deleteMany({
            where: { user_id: parseInt(id, 10) }
        });
    }

    // Delete user from users table
    return await prisma.users.delete({
        where: {
            id: parseInt(id, 10),
        },
        select: {
            id: true,
        },
    });
};

export const getReportsData = async () => {
    return await prisma.users.groupBy({
        by: ['role'],
        _count: {
            role: true,
        },
        _max: {
            created_at: true,
        },
    });
};

export const getStaffData = async () => {
    return await prisma.users.findMany({
        where: {
            role: 'staff',
        },
        select: {
            id: true,
            username: true,
            role: true,
            created_at: true,
            last_login: true,
        },
    });
};

export const updateUserInDB = async (id, username, role, firstName, lastName, email, mobile, address) => {
    return await prisma.users.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            username,
            role,
            firstname: firstName,
            lastname: lastName,
            email,
            mobile,
            address,
        },
        select: {
            id: true,
            username: true,
            role: true,
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            address: true,
        },
    });
};

export const getAllManagersFromDB = async () => {
    return await prisma.users.findMany({
        where: {
            role: 'manager',
        },
    });
};
export const getAllStaffFromDB = async () => {
    return await prisma.users.findMany({
        where: {
            role: 'staff',
        },
    });
};

export const changePassword = async (userId, newHashedPassword) => {
    return await prisma.users.update({
        where: {
            id: userId,
        },
        data: {
            password: newHashedPassword,
        },
    });
};
export const getUserById = async (userId) => {
    return await prisma.users.findUnique({
        where: {
            id: userId,
        },
    });
};

// Function to check if user has complete profile (exists in both users and staff tables)
export const checkProfileComplete = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { staff: true }
    });
    
    if (!user) return false;
    
    // For manager and staff roles, check if they exist in staff table
    if (user.role === 'manager' || user.role === 'staff') {
        return user.staff !== null;
    }
    
    // For admin role, profile is complete if they exist in users table
    return true;
};

// Function to update profile completion status
export const updateProfileCompleteStatus = async (userId) => {
    const isComplete = await checkProfileComplete(userId);
    
    return await prisma.users.update({
        where: { id: userId },
        data: { profile_complete: isComplete },
        select: {
            id: true,
            username: true,
            role: true,
            profile_complete: true,
        }
    });
};

// Function to get all users with profile completion status
export const getAllUsersWithProfileStatus = async () => {
    return await prisma.users.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            address: true,
            profile_complete: true,
        },
    });
};
