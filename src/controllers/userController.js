import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';
import { createUser, findUserByUsername,findUserById,getAllUsersFromDB, getReportsData, getStaffData, updateUserInDB, deleteUserById, getAllManagersFromDB,getAllStaffFromDB, changePassword,getUserById, getAllUsersWithProfileStatus, updateProfileCompleteStatus } from '../models/userModel.js';
import { hashPassword, comparePasswords } from '../utils/passwordUtils.js';
import {canUpdateUser} from '../utils/roleUtils.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, firstName, lastName, email, password, role, mobile, address } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        const newUser = await createUser(username, firstName, lastName, email, hashedPassword, role, mobile, address);
        const userData = {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            mobile: newUser.mobile,
            address: newUser.address
        };
        return sendResponse(res, ResponseStatus.CREATED, 'User created successfully', userData);
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error creating user', 
            null, 
            error.message
        );
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'User not found');
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
            return sendResponse(res, ResponseStatus.UNAUTHORIZED, 'Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const userData = {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        return sendResponse(res, ResponseStatus.SUCCESS, 'Login successful', userData);
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error logging in', 
            null, 
            error.message
        );
    }
};


export const checkUser = async (req, res) => {
    try {
        // The user ID comes from the verified token
        const userId = req.userId;
        const user = await findUserById(userId);
        
        if (!user) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'User not found');
        }

        const userData = {
            id: user.id,
            username: user.username,
            role: user.role,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            profile_complete: user.profile_complete
        };

        return sendResponse(res, ResponseStatus.SUCCESS, 'User verified successfully', userData);
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error checking user', 
            null, 
            error.message
        );
    }
};

// Admin function to get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersWithProfileStatus();
        return sendResponse(
            res, 
            ResponseStatus.SUCCESS, 
            'Users retrieved successfully', 
            users
        );
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error retrieving users', 
            null, 
            error.message
        );
    }
};

// Admin function to delete a user
export const deleteUser = async (req, res) => {
    const { id } = req.body;

    try {
        const deletedUser = await deleteUserById(id);

        if (!deletedUser) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'User not found');
        }

        return sendResponse(
            res,
            ResponseStatus.SUCCESS,
            'User deleted successfully',
            { id: deletedUser.id }
        );
    } catch (error) {
        return sendResponse(
            res,
            ResponseStatus.SERVER_ERROR,
            'Error deleting user',
            null,
            error.message
        );
    }
};


// Admin and manager function to get reports
export const getReports = async (req, res) => {
    try {
        const reports = await getReportsData();
        return sendResponse(
            res, 
            ResponseStatus.SUCCESS, 
            'Reports retrieved successfully', 
            reports
        );
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error retrieving reports', 
            null, 
            error.message
        );
    }
};

// Admin and manager function to manage staff
export const manageStaff = async (req, res) => {
    try {
        const staffData = await getStaffData();
        return sendResponse(
            res, 
            ResponseStatus.SUCCESS, 
            'Staff data retrieved successfully', 
            staffData
        );
    } catch (error) {
        return sendResponse(
            res, 
            ResponseStatus.SERVER_ERROR, 
            'Error retrieving staff data', 
            null, 
            error.message
        );
    }
};

export const updateUser = async (req, res) => {
    const { id, username, role, firstName, lastName, email, mobile, address } = req.body;
    const updaterRole = req.userRole; // Role of the user making the update

    try {
        // Get the user to be updated
        const userToUpdate = await findUserById(id);

        if (!userToUpdate) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'User not found');
        }

        // Role-based access control
        if (updaterRole === 'manager' && userToUpdate.role !== 'staff') {
            return sendResponse(
                res,
                ResponseStatus.FORBIDDEN,
                'Managers can only update staff users'
            );
        }

        if (updaterRole !== 'admin' && updaterRole !== 'manager') {
            return sendResponse(
                res,
                ResponseStatus.FORBIDDEN,
                'You do not have permission to update this user'
            );
        }

        if (updaterRole === 'manager' && role && role !== 'staff') {
            return sendResponse(
                res,
                ResponseStatus.FORBIDDEN,
                'Managers cannot change user role to anything other than staff'
            );
        }

        // Perform the update
        const updatedUser = await updateUserInDB(id, username, role, firstName, lastName, email, mobile, address);

        return sendResponse(
            res,
            ResponseStatus.SUCCESS,
            'User updated successfully',
            {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                address: updatedUser.address
            }
        );
    } catch (error) {
        return sendResponse(
            res,
            ResponseStatus.SERVER_ERROR,
            'Error updating user',
            null,
            error.message
        );
    }
};



export const getAllManagers = async (req, res) => {
    try {
        const managers = await getAllManagersFromDB();
        return sendResponse(res, ResponseStatus.SUCCESS, 'Managers retrieved successfully', managers);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving managers', null, error.message);
    }
};
export const getAllStaffs = async (req, res) => {
    try {
        const staff = await getAllStaffFromDB();
        return sendResponse(res, ResponseStatus.SUCCESS, 'Managers retrieved successfully', staff);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving managers', null, error.message);
    }
};

export const PasswordChange = async (req, res) => {
    const { userId, newPassword } = req.body;
    const requestorId = req.userId; 
    const requestorRole =  req.userRole;

    try {
        // Fetch the target user details
        const targetUser = await getUserById(userId);

        if (!targetUser) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'User not found');
        }

        // Role-based logic
        if (
            (requestorRole === 'admin') || // Admin can change any password
            (requestorRole === 'manager' && 
                (requestorId === userId || targetUser.role === 'staff')) || // Manager can change own or staff passwords
            (requestorRole === 'staff' && requestorId === userId) // Staff can only change their own password
        ) {
            const hashedPassword = await hashPassword(newPassword);
            await changePassword(userId, hashedPassword);
            return sendResponse(res, ResponseStatus.SUCCESS, 'Password changed successfully');
        } else {
            return sendResponse(res, ResponseStatus.FORBIDDEN, 'Unauthorized to change this password');
        }
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error changing password', null, error.message);
    }
};

// Register a new user and create staff in one go
export const registerStaffFull = async (req, res) => {
    // Validate user fields
    const Joi = (await import('joi')).default;
    const userSchema = Joi.object({
        username: Joi.string().min(3).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
        role: Joi.string().valid('admin', 'manager', 'staff').required(),
        mobile: Joi.string().required(),
        address: Joi.string().required(),
        department: Joi.string().required(),
        salary: Joi.number().required(),
        performance_score: Joi.number().required(),
        shift: Joi.string().required(),
        joined_date: Joi.date().iso().required(),
        phone: Joi.string().required(),
        status: Joi.string().optional(),
    });
    const { error } = userSchema.validate(req.body);
    if (error) return sendResponse(res, ResponseStatus.BAD_REQUEST, error.details[0].message);

    const {
        username, firstName, lastName, email, password, role, mobile, address,
        department, salary, performance_score, shift, joined_date, phone, status
    } = req.body;

    const prisma = (await import('../generated/prisma/index.js')).PrismaClient;
    const db = new prisma();
    try {
        // Check for existing username/email
        const existingUser = await db.users.findFirst({
            where: { OR: [{ username }, { email }] }
        });
        if (existingUser) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Username or email already exists');
        }
        // Hash password
        const { hashPassword } = await import('../utils/passwordUtils.js');
        const hashedPassword = await hashPassword(password);
        // Create user
        const newUser = await db.users.create({
            data: {
                username,
                firstname: firstName,
                lastname: lastName,
                email,
                password: hashedPassword,
                role,
                mobile,
                address,
                profile_complete: true, // Set to true since we're creating both user and staff
            },
        });
        // Create staff
        const newStaff = await db.staff.create({
            data: {
                user_id: newUser.id,
                department,
                status: status || 'active',
                salary,
                performance_score,
                shift,
                joined_date: new Date(joined_date),
                email,
                phone,
            },
        });
        return sendResponse(res, ResponseStatus.CREATED, 'Staff user registered successfully', {
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                firstName: newUser.firstname,
                lastName: newUser.lastname,
                email: newUser.email,
                mobile: newUser.mobile,
                address: newUser.address,
                profile_complete: true
            },
            staff: newStaff
        });
    } catch (err) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error registering staff user', null, err.message);
    } finally {
        await db.$disconnect();
    }
};

// Function to update profile completion status for a user
export const updateUserProfileStatus = async (req, res) => {
    const { userId } = req.body;

    try {
        const updatedUser = await updateProfileCompleteStatus(userId);
        return sendResponse(
            res,
            ResponseStatus.SUCCESS,
            'Profile status updated successfully',
            updatedUser
        );
    } catch (error) {
        return sendResponse(
            res,
            ResponseStatus.SERVER_ERROR,
            'Error updating profile status',
            null,
            error.message
        );
    }
};
