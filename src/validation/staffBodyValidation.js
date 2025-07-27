import { body } from 'express-validator';

const createStaffValidationRules = [
  body('user_id').isInt().withMessage('User ID must be an integer'),
  body('department').notEmpty().withMessage('Department is required'),
  body('salary').isDecimal().withMessage('Salary must be a decimal value'),
  body('performance_score').isDecimal().withMessage('Performance score must be a decimal value'),
  body('shift').notEmpty().withMessage('Shift is required'),
  body('joined_date').isISO8601().withMessage('Joined date must be a valid date'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('phone').isMobilePhone().withMessage('Must be a valid phone number'),
  body('role').isIn(['admin', 'manager', 'staff']).withMessage('Role must be admin, manager, or staff'),
];

const updateStaffValidationRules = [
  body('user_id').optional().isInt().withMessage('User ID must be an integer'),
  body('department').optional().notEmpty().withMessage('Department is required'),
  body('salary').optional().isDecimal().withMessage('Salary must be a decimal value'),
  body('performance_score').optional().isDecimal().withMessage('Performance score must be a decimal value'),
  body('shift').optional().notEmpty().withMessage('Shift is required'),
  body('joined_date').optional().isISO8601().withMessage('Joined date must be a valid date'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Must be a valid phone number'),
];

export { createStaffValidationRules, updateStaffValidationRules };
