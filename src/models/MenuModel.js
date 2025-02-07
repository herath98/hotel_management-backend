// models/menuModel.js
import pool from '../config/database.js';

const VALID_CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Special Offers'];
const VALID_DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Contains Nuts'];

const MenuModel = {
  async create(menuData) {
    // Check for duplicate name
    const existingItem = await pool.query(
      'SELECT id FROM menu_items WHERE LOWER(name) = LOWER($1)',
      [menuData.name]
    );
    
    if (existingItem.rows.length > 0) {
      throw new Error('A menu item with this name already exists');
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(menuData.category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Validate dietary tags
    if (menuData.dietary_tags) {
      const invalidTags = menuData.dietary_tags.filter(tag => !VALID_DIETARY_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(`Invalid dietary tags: ${invalidTags.join(', ')}`);
      }
    }

    const { 
      name, 
      description, 
      price, 
      category, 
      is_available, 
      dietary_tags 
    } = menuData;

    const query = `
      INSERT INTO menu_items (
        name, 
        description, 
        price, 
        category, 
        is_available, 
        dietary_tags
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      name, 
      description, 
      price, 
      category, 
      is_available ?? true,
      dietary_tags || []
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async list() {
    const query = `
      SELECT * FROM menu_items 
      ORDER BY 
        CASE category
          WHEN 'Starters' THEN 1
          WHEN 'Main Course' THEN 2
          WHEN 'Desserts' THEN 3
          WHEN 'Beverages' THEN 4
          WHEN 'Special Offers' THEN 5
        END,
        name
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async update(id, menuData) {
    // Check for duplicate name if name is being updated
    if (menuData.name) {
      const existingItem = await pool.query(
        'SELECT id FROM menu_items WHERE LOWER(name) = LOWER($1) AND id != $2',
        [menuData.name, id]
      );
      
      if (existingItem.rows.length > 0) {
        throw new Error('A menu item with this name already exists');
      }
    }

    // Validate category if provided
    if (menuData.category && !VALID_CATEGORIES.includes(menuData.category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Validate dietary tags if provided
    if (menuData.dietary_tags) {
      const invalidTags = menuData.dietary_tags.filter(tag => !VALID_DIETARY_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(`Invalid dietary tags: ${invalidTags.join(', ')}`);
      }
    }

    const { 
      name, 
      description, 
      price, 
      category, 
      is_available, 
      dietary_tags 
    } = menuData;

    const query = `
      UPDATE menu_items 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          is_available = COALESCE($5, is_available),
          dietary_tags = COALESCE($6, dietary_tags)
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      name, 
      description, 
      price, 
      category, 
      is_available, 
      dietary_tags,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM menu_items WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

export default MenuModel;