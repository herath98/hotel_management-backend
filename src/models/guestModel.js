import pool from '../config/database.js';


export const createGuest = async (guestData) => {
  const { 
    name, 
    contact, 
    preferences = {}, 
    stay_history = {}, 
    loyalty_points = 0, 
    dietary_needs = '' 
  } = guestData;

  const query = `
    INSERT INTO guests 
      (name, contact, preferences, stay_history, loyalty_points, dietary_needs)
    VALUES 
      ($1, $2, $3, $4, $5, $6)
    RETURNING *`;

  const values = [
    name, 
    contact, 
    JSON.stringify(preferences), 
    JSON.stringify(stay_history),
    loyalty_points,
    dietary_needs
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateGuest = async (guestId, guestData) => {
  const { 
    name, 
    contact, 
    preferences, 
    stay_history, 
    loyalty_points, 
    dietary_needs 
  } = guestData;

  const query = `
    UPDATE guests
    SET 
      name = COALESCE($1, name),
      contact = COALESCE($2, contact),
      preferences = COALESCE($3, preferences),
      stay_history = COALESCE($4, stay_history),
      loyalty_points = COALESCE($5, loyalty_points),
      dietary_needs = COALESCE($6, dietary_needs),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *`;

  const values = [
    name, 
    contact, 
    preferences ? JSON.stringify(preferences) : null,
    stay_history ? JSON.stringify(stay_history) : null,
    loyalty_points,
    dietary_needs,
    guestId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteGuest = async (guestId) => {
  const query = 'DELETE FROM guests WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [guestId]);
  return result.rows[0];
};

export const listAllGuests = async () => {
    const query = 'SELECT * FROM guests ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  };
  
  export const getGuestById = async (guestId) => {
    const query = 'SELECT * FROM guests WHERE id = $1';
    const result = await pool.query(query, [guestId]);
    return result.rows[0];
  };
  