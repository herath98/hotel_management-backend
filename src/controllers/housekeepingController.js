import { createTask, getTasks ,getTasksByAssignedTo, updateTaskStatus, updateTask,deleteTask } from '../models/housekeepingModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';

export const createHousekeepingTask = async (req, res) => {
    try {
        const task = req.body;
        const newTask = await createTask(task);
        return sendResponse(res, ResponseStatus.SUCCESS, 'Housekeeping task created successfully', newTask);
    } catch (error) {
        const status = error.message.includes('Invalid') ? ResponseStatus.BAD_REQUEST : ResponseStatus.SERVER_ERROR;
        return sendResponse(res, status, error.message);
    }
};
  
  export const listHousekeepingTasks = async (req, res) => {
    try {
      const tasks = await getTasks();
      return sendResponse(res, ResponseStatus.SUCCESS, 'Housekeeping tasks retrieved successfully', tasks);
    } catch (error) {
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving housekeeping tasks', null, error.message);
    }
  };

  export const listHousekeepingTasksByAssignedTo = async (req, res) => {
    try {
        const { assigned_to } = req.body;
        if (!assigned_to) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'assigned_to is required');
        }
        const tasks = await getTasksByAssignedTo(assigned_to);
        return sendResponse(res, ResponseStatus.SUCCESS, 'Housekeeping tasks retrieved successfully', tasks);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving housekeeping tasks', null, error.message);
    }
};

export const updateHousekeepingTaskStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Both id and status are required');
        }

        const updatedTask = await updateTaskStatus(id, status, true);
        if (!updatedTask) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'Task not found');
        }

        return sendResponse(res, ResponseStatus.SUCCESS, 'Task status updated successfully', updatedTask);
    } catch (error) {
        console.error("Error updating housekeeping task status:", error);
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
};

export const updateHousekeepingTask = async (req, res) => {
    try {
        const { id } = req.body;
        const updates = req.body;
        if (!id) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'id is required');
        }
        const updatedTask = await updateTask(id, updates);
        if (!updatedTask) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'Task not found');
        }
        return sendResponse(res, ResponseStatus.SUCCESS, 'Housekeeping task updated successfully', updatedTask);
    } catch (error) {
        const status = error.message.includes('Invalid') ? ResponseStatus.BAD_REQUEST : ResponseStatus.SERVER_ERROR;
        return sendResponse(res, status, error.message);
    }
};

export const deleteHousekeepingTask = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'id is required');
        }

        const deletedTask = await deleteTask(id);
        return sendResponse(res, ResponseStatus.SUCCESS, 'Housekeeping task deleted successfully', deletedTask);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error deleting housekeeping task', null, error.message);
    }
};