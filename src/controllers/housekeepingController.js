import { createTask, getTasks ,getTasksByAssignedTo, updateTaskStatus, updateTask,deleteTask } from '../models/housekeepingModel.js';

export const createHousekeepingTask = async (req, res) => {
    try {
        const task = req.body;
        const newTask = await createTask(task);
        res.status(200).json({ success: true, data: newTask });
    } catch (error) {
        const status = error.message.includes('Invalid') ? 400 : 500;
        res.status(status).json({ 
            success: false, 
            message: error.message 
        });
    }
};
  
  export const listHousekeepingTasks = async (req, res) => {
    try {
      const tasks = await getTasks();
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  export const listHousekeepingTasksByAssignedTo = async (req, res) => {
    try {
        const { assigned_to } = req.body;
        if (!assigned_to) {
            return res.status(400).json({ 
                success: false, 
                message: 'assigned_to is required' 
            });
        }
        const tasks = await getTasksByAssignedTo(assigned_to);
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateHousekeepingTaskStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both id and status are required' 
            });
        }

        const updatedTask = await updateTaskStatus(id, status, true);
        if (!updatedTask) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: updatedTask,
            message: 'Task status updated successfully'
        });
    } catch (error) {
        console.error("Error updating housekeeping task status:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

export const updateHousekeepingTask = async (req, res) => {
    try {
        const { id } = req.body;
        const updates = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'id is required' });
        }
        const updatedTask = await updateTask(id, updates);
        if (!updatedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        const status = error.message.includes('Invalid') ? 400 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

export const deleteHousekeepingTask = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'id is required' 
            });
        }

        const deletedTask = await deleteTask(id);
        res.status(200).json({ success: true, data: deletedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};