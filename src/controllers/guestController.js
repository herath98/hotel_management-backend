import { 
    getGuestById, 
    createGuest, 
    updateGuest, 
    deleteGuest ,
    listAllGuests
  } from '../models/guestModel.js';
  
  export const listGuestProfiles = async (req, res) => {
    try {
      const guests = await listAllGuests();
      res.status(200).json({
        success: true,
        data: guests
      });
    } catch (error) {
      console.error('Error in listGuestProfiles:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
  
  export const viewGuestProfile = async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ success: false, message: 'Guest ID is required' });
      }
  
      const guest = await getGuestById(id);
      if (!guest) {
        return res.status(404).json({ success: false, message: 'Guest not found' });
      }
      
      res.status(200).json({
        success: true,
        data: guest
      });
    } catch (error) {
      console.error('Error in viewGuestProfile:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
  
  export const createGuestProfile = async (req, res) => {
    try {
      // Input validation
      const { name, contact } = req.body;
      if (!name || !contact) {
        return res.status(400).json({ success: false, message: 'Name and contact information are required' });
      }
  
      const newGuest = await createGuest(req.body);
      res.status(201).json({ success: true, data: newGuest });
    } catch (error) {
      console.error('Error in createGuestProfile:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
  
  export const updateGuestProfile = async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Guest ID is required' });
      }
  
      const updatedGuest = await updateGuest(id, updateData);
      if (!updatedGuest) {
        return res.status(404).json({ success: false, message: 'Guest not found' });
      }
      res.status(200).json({ success: true, data: updatedGuest });
    } catch (error) {
      console.error('Error in updateGuestProfile:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
  
  export const deleteGuestProfile = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Guest ID is required' });
      }
  
      const deletedGuest = await deleteGuest(id);
      if (!deletedGuest) {
        return res.status(404).json({ success: false, message: 'Guest not found' });
      }
      res.status(200).json({ success: true, message: 'Guest deleted successfully', guest: deletedGuest });
    } catch (error) {
      console.error('Error in deleteGuestProfile:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };



//   Get specific page with custom limit:
//   http://localhost:3000/api/guests/list?page=2&limit=5