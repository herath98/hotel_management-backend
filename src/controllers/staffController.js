import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();
import { response } from 'express';
import { validationResult } from 'express-validator';
import { updateSingleUserProfileStatus } from '../utils/updateProfileStatus.js';

// Create a new staff member
export const createStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    user_id,
    department,
    status,
    salary,
    performance_score,
    shift,
    joined_date,
    email,
    phone,
    role,
  } = req.body;

  // Only allow specific roles
  const allowedRoles = ['admin', 'manager', 'staff'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be admin, manager, or staff.' });
  }

  try {
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found for user_id.' });
    }

    // Update user role
    await prisma.users.update({
      where: { id: user_id },
      data: { role },
    });

    // Create staff member
    const newStaff = await prisma.staff.create({
      data: {
        user_id,
        department,
        status,
        salary,
        performance_score,
        shift,
        joined_date: new Date(joined_date),
        email,
        phone,
      },
    });

    // Update user's profile completion status
    await updateSingleUserProfileStatus(user_id);

    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff member.' });
  }
};

// Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    // Get all users with allowed roles
    const allowedRoles = ['admin', 'manager', 'staff'];
    const usersWithRoles = await prisma.users.findMany({
      where: {
        role: {
          in: allowedRoles,
        },
      },
    });

    // Get all staff members with their user info
    const staffMembers = await prisma.staff.findMany({
      include: {
        users: true,
      },
    });

    // Create a Set of user_ids already in staff table
    const staffUserIds = new Set(staffMembers.map(staff => staff.user_id));

    // Add users who are not in staff table
    const usersNotInStaff = usersWithRoles.filter(user => !staffUserIds.has(user.id));

    // Format usersNotInStaff to match staffMembers output (add a 'users' field)
    const formattedUsers = usersNotInStaff.map(user => ({
      id: null, // No staff id
      user_id: user.id,
      department: null,
      status: null,
      salary: null,
      performance_score: null,
      shift: null,
      joined_date: null,
      email: user.email,
      phone: user.phone,
      users: user,
    }));

    // Merge staffMembers and formattedUsers
    const allStaff = [...staffMembers, ...formattedUsers];
    res.status(200).json(allStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff members.' });
  }
};

// Get a single staff member by ID
export const getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const staffMember = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: true,
      },
    });
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.status(200).json(staffMember);
  } catch (error) {
    console.error('Error fetching staff by ID:', error);
    res.status(500).json({ error: 'Failed to fetch staff member.' });
  }
};

// Update a staff member
export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    department,
    status,
    salary,
    performance_score,
    shift,
    joined_date,
    email,
    phone,
  } = req.body;

  const updateData = {};
  if (department !== undefined) updateData.department = department;
  if (status !== undefined) updateData.status = status;
  if (salary !== undefined) updateData.salary = salary;
  if (performance_score !== undefined) updateData.performance_score = performance_score;
  if (shift !== undefined) updateData.shift = shift;
  if (joined_date !== undefined) updateData.joined_date = new Date(joined_date);
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;

  try {
    const updatedStaff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.status(500).json({ error: 'Failed to update staff member.' });
  }
};

// Delete a staff member
export const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    // Get the staff member to find the user_id before deleting
    const staffMember = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      select: { user_id: true }
    });

    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    await prisma.staff.delete({
      where: { id: parseInt(id) },
    });

    // Update user's profile completion status
    await updateSingleUserProfileStatus(staffMember.user_id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.status(500).json({ error: 'Failed to delete staff member.' });
  }
};
