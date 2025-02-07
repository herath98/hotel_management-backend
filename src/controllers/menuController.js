// controllers/menuController.js
import MenuModel from '../models/MenuModel.js';

const MenuController = {
    async createMenu(req, res) {
        try {
          const { name, price, category, description, dietary_tags } = req.body;
          
          // Validate required fields
          if (!name || !price || !category) {
            return res.status(400).json({ 
              error: 'Name, price, and category are required fields' 
            });
          }
    
          // Validate price format
          if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ 
              error: 'Price must be a positive number' 
            });
          }
    
          // Validate description length
          if (description && description.length > 500) {
            return res.status(400).json({
              error: 'Description must not exceed 500 characters'
            });
          }
    
          const menu = await MenuModel.create(req.body);
          res.status(201).json(menu);
        } catch (error) {
          res.status(400).json({ error: error.message });
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
    
          res.status(200).json(menus);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

  async updateMenu(req, res) {
    try {
      // Validate price if provided
      if (req.body.price && (typeof req.body.price !== 'number' || req.body.price <= 0)) {
        return res.status(400).json({ 
          error: 'Price must be a positive number' 
        });
      }

      const menu = await MenuModel.update(req.params.id, req.body);
      if (!menu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.status(200).json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteMenu(req, res) {
    try {
      const menu = await MenuModel.delete(req.params.id);
      if (!menu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.status(200).json({ 
        message: 'Menu item deleted successfully',
        deletedItem: menu 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default MenuController;