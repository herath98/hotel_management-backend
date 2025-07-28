// controllers/menuController.js
import MenuModel from '../models/MenuModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';

const MenuController = {
    async createMenu(req, res) {
        try {
          const { name, price, category, description, dietary_tags } = req.body;
          
          // Validate required fields
          if (!name || !price || !category) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Name, price, and category are required fields');
          }
    
          // Validate price format
          if (typeof price !== 'number' || price <= 0) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Price must be a positive number');
          }
    
          // Validate description length
          if (description && description.length > 500) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Description must not exceed 500 characters');
          }
    
          const menu = await MenuModel.create(req.body);
          return sendResponse(res, ResponseStatus.CREATED, 'Menu item created successfully', menu);
        } catch (error) {
          return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Error creating menu item', null, error.message);
        }
      },
    

      async listMenus(req, res) {
        try {
          const { category, dietary_tags } = req.query;
          let menus = await MenuModel.list();
    
          // Filter by category if provided
          if (category) {
            menus = menus.filter(item => item.category === category);
          }
    
          // Filter by dietary tags if provided
          if (dietary_tags) {
            const requestedTags = dietary_tags.split(',');
            menus = menus.filter(item => 
              requestedTags.every(tag => item.dietary_tags.includes(tag))
            );
          }
    
          return sendResponse(res, ResponseStatus.SUCCESS, 'Menu items retrieved successfully', menus);
        } catch (error) {
          return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving menu items', null, error.message);
        }
      },

  async updateMenu(req, res) {
    try {
      // Validate price if provided
      if (req.body.price && (typeof req.body.price !== 'number' || req.body.price <= 0)) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Price must be a positive number');
      }

      const menu = await MenuModel.update(req.params.id, req.body);
      if (!menu) {
        return sendResponse(res, ResponseStatus.NOT_FOUND, 'Menu item not found');
      }
      return sendResponse(res, ResponseStatus.SUCCESS, 'Menu item updated successfully', menu);
    } catch (error) {
      return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Error updating menu item', null, error.message);
    }
  },

  async deleteMenu(req, res) {
    try {
      const menu = await MenuModel.delete(req.params.id);
      if (!menu) {
        return sendResponse(res, ResponseStatus.NOT_FOUND, 'Menu item not found');
      }
      return sendResponse(res, ResponseStatus.SUCCESS, 'Menu item deleted successfully', { deletedItem: menu });
    } catch (error) {
      return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error deleting menu item', null, error.message);
    }
  }
};

export default MenuController;