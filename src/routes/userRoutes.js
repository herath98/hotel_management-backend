import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getAllUsers, 
    deleteUser, 
    getReports, 
    manageStaff ,
    checkUser,
    updateUser,
    getAllManagers,
    PasswordChange,
    registerStaffFull,
    updateUserProfileStatus
    
} from '../controllers/userController.js';
import { 
    validateRegister, 
    validateLogin, 
    verifyUser, 
    requireRole ,
    validateUpdate
} from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             role:
 *               type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *               - mobile
 *               - address
 *             properties:
 *               username:
 *                 type: string
 *                 minimum: 3
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minimum: 6
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff]
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/register', validateRegister, registerUser);

/**
 * @swagger
 * /register/staff/full:
 *   post:
 *     summary: Register a new user and staff member in one request
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *               - mobile
 *               - address
 *               - department
 *               - salary
 *               - performance_score
 *               - shift
 *               - joined_date
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff]
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: number
 *               performance_score:
 *                 type: number
 *               shift:
 *                 type: string
 *               joined_date:
 *                 type: string
 *                 format: date-time
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: active
 *     responses:
 *       201:
 *         description: Staff user registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/register/staff/full', registerStaffFull);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin@1234
 *               password:
 *                 type: string
 *                 example: Ma12345%
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/login', validateLogin, loginUser);
/**
 * @swagger
 * /user/check:
 *   get:
 *     summary: Check authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                     role:
 *                       type: string
 *                       example: admin
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No token provided
 *       403:
 *         description: Invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/check', verifyUser, checkUser);

/**
 * @swagger
 * /password/reset:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Authentication
 *     description: 
 *       - Admins can reset any user's password.
 *       - Managers can reset their own password and staff passwords.
 *       - Staff can only reset their own password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       403:
 *         description: Unauthorized to change this password
 *       500:
 *         description: Server error
 */

router.post('/password/reset',verifyUser,PasswordChange);

/**
 * @swagger
 * /admin/users/list:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       role:
 *                         type: string
 */
router.get('/admin/users/list', verifyUser, requireRole(['admin','manager']), getAllUsers);

/**
 * @swagger
 * /admin/user/delete:
 *   post:
 *     summary: Delete a user (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post('/admin/user/delete', verifyUser, requireRole(['admin','manager']), deleteUser);


/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get reports (Admin and Manager)
 *     tags:
 *       - Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports data retrieved successfully
 */
router.get('/reports', verifyUser, requireRole(['admin', 'manager']), getReports);

/**
 * @swagger
 * /admin/staff-management/list:
 *   get:
 *     summary: Get staff management data (Admin and Manager)
 *     tags:
 *       - Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff management data retrieved successfully
 */
router.get('/admin/staff-management/list', verifyUser, requireRole(['admin', 'manager']), manageStaff);

/**
 * @swagger
 * /admin/managers/list:
 *   get:
 *     summary: Get all managers (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Managers retrieved successfully
 */
router.get('/admin/managers/list', verifyUser, requireRole(['admin']), getAllManagers);

/**
 * @swagger
 * /users/edit:
 *   post:
 *     summary: Update user (Admin can update all roles, Manager can only update staff)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff]
 *           examples:
 *             adminUpdate:
 *               value:
 *                 id: 12
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 username: "john_doe"
 *                 email: "john.doe@example.com"
 *                 mobile: "1234567890"
 *                 address: "123 Main St"
 *                 role: "manager"
 *               summary: Admin updating to manager
 *             managerUpdate:
 *               value:
 *                 id: 34
 *                 firstName: "Jane"
 *                 lastName: "Doe"
 *                 username: "jane_doe"
 *                 email: "jane.doe@example.com"
 *                 mobile: "9876543210"
 *                 address: "456 Oak Ave"
 *                 role: "staff"
 *               summary: Manager updating to staff
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     address:
 *                       type: string
 *                     role:
 *                       type: string
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.post('/users/edit', verifyUser, validateUpdate, updateUser);

/**
 * @swagger
 * /users/profile-status:
 *   post:
 *     summary: Update user profile completion status
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Profile status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profile_complete:
 *                       type: boolean
 *       500:
 *         description: Server error
 */
router.post('/users/profile-status', verifyUser, updateUserProfileStatus);

export default router;