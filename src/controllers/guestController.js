import { 
    getGuestById, 
    createGuest, 
    updateGuest, 
    deleteGuest ,
    listAllGuests
  } from '../models/guestModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';
  
  export const listGuestProfiles = async (req, res) => {
    try {
      const guests = await listAllGuests();
      return sendResponse(res, ResponseStatus.SUCCESS, 'Guest profiles retrieved successfully', guests);
    } catch (error) {
      console.error('Error in listGuestProfiles:', error);
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
  };
  
  export const viewGuestProfile = async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Guest ID is required');
      }
  
      const guest = await getGuestById(id);
      if (!guest) {
        return sendResponse(res, ResponseStatus.NOT_FOUND, 'Guest not found');
      }
      
      return sendResponse(res, ResponseStatus.SUCCESS, 'Guest profile retrieved successfully', guest);
    } catch (error) {
      console.error('Error in viewGuestProfile:', error);
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
  };
  
  export const createGuestProfile = async (req, res) => {
    try {
      // Input validation
      const { name, contact } = req.body;
      if (!name || !contact) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Name and contact information are required');
      }
  
      const newGuest = await createGuest(req.body);
      return sendResponse(res, ResponseStatus.CREATED, 'Guest profile created successfully', newGuest);
    } catch (error) {
      console.error('Error in createGuestProfile:', error);
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
  };
  
  export const updateGuestProfile = async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Guest ID is required');
      }
  
      const updatedGuest = await updateGuest(id, updateData);
      if (!updatedGuest) {
        return sendResponse(res, ResponseStatus.NOT_FOUND, 'Guest not found');
      }
      return sendResponse(res, ResponseStatus.SUCCESS, 'Guest profile updated successfully', updatedGuest);
    } catch (error) {
      console.error('Error in updateGuestProfile:', error);
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
  };
  
  export const deleteGuestProfile = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Guest ID is required');
      }
  
      const deletedGuest = await deleteGuest(id);
      if (!deletedGuest) {
        return sendResponse(res, ResponseStatus.NOT_FOUND, 'Guest not found');
      }
      return sendResponse(res, ResponseStatus.SUCCESS, 'Guest deleted successfully', deletedGuest);
    } catch (error) {
      console.error('Error in deleteGuestProfile:', error);
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Server error', null, error.message);
    }
  };



//   Get specific page with custom limit:
//   http://localhost:3000/api/guests/list?page=2&limit=5