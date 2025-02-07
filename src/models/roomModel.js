import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

export const addRoom = async (room) => {
  const {
    room_number,
    room_type,
    status,
    base_price,
    capacity,
    bed_type,
    amenities,
    room_size,
    view_type,
    floor_number,
    description,
    image_urls,
    room_category,
    maintenance_status,
    is_smoking,
    seasonal_pricing,
    tax_rate,
    discount_rules
  } = room;

  const query = `
    INSERT INTO rooms (
      room_number, room_type, status, base_price, capacity, bed_type, 
      amenities, room_size, view_type, floor_number, description, 
      image_urls, room_category, maintenance_status, is_smoking,
      seasonal_pricing, tax_rate, discount_rules
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
    RETURNING *`;

  const values = [
    room_number,
    room_type,
    status,
    base_price,
    capacity,
    bed_type,
    amenities,
    room_size,
    view_type,
    floor_number,
    description,
    image_urls,
    room_category,
    maintenance_status,
    is_smoking,
    seasonal_pricing,
    tax_rate,
    discount_rules
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to add room: ${error.message}`);
  }
};

export const getAllRooms = async () => {
    try {
      const query = 'SELECT * FROM rooms';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to get rooms: ${error.message}`);
    }
  };

export const updateRoom = async (id, room) => {
  const {
    room_number,
    room_type,
    status,
    base_price,
    capacity,
    bed_type,
    amenities,
    room_size,
    view_type,
    floor_number,
    description,
    image_urls,
    room_category,
    maintenance_status,
    is_smoking,
    seasonal_pricing,
    tax_rate,
    discount_rules
  } = room;

  const query = `
    UPDATE rooms 
    SET room_number = COALESCE($1, room_number), 
        room_type = COALESCE($2, room_type), 
        status = COALESCE($3, status), 
        base_price = COALESCE($4, base_price),
        capacity = COALESCE($5, capacity), 
        bed_type = COALESCE($6, bed_type), 
        amenities = COALESCE($7, amenities), 
        room_size = COALESCE($8, room_size),
        view_type = COALESCE($9, view_type), 
        floor_number = COALESCE($10, floor_number), 
        description = COALESCE($11, description),
        image_urls = COALESCE($12, image_urls), 
        room_category = COALESCE($13, room_category), 
        maintenance_status = COALESCE($14, maintenance_status),
        is_smoking = COALESCE($15, is_smoking), 
        seasonal_pricing = COALESCE($16, seasonal_pricing), 
        tax_rate = COALESCE($17, tax_rate),
        discount_rules = COALESCE($18, discount_rules)
    WHERE id = $19 
    RETURNING *`;

  const values = [
    room_number,
    room_type,
    status,
    base_price,
    capacity,
    bed_type,
    amenities,
    room_size,
    view_type,
    floor_number,
    description,
    image_urls,
    room_category,
    maintenance_status,
    is_smoking,
    seasonal_pricing,
    tax_rate,
    discount_rules,
    id
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to update room: ${error.message}`);
  }
};

export const getRoomById = async (id) => {
  const query = 'SELECT * FROM rooms WHERE id = $1';
  try {
    console.log('Fetching room with id:', id); // Log the id being queried
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      console.log('Room not found for id:', id); // Log if no room is found
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to get room: ${error.message}`);
  }
};


export const getRoomsByStatus = async (status) => {
  const query = 'SELECT * FROM rooms WHERE status = $1';
  const result = await pool.query(query, [status]);
  return result.rows;
};

export const updateRoomStatus = async (id, status) => {
  const query = 'UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

export const deleteRoom = async (id) => {
  const query = 'DELETE FROM rooms WHERE id = $1 RETURNING *';
  try {
    const result = await pool.query(query, [id]);
    if (result.rows[0]) {
      const imageUrls = result.rows[0].image_urls || [];
      for (const imageUrl of imageUrls) {
        await deleteCloudinaryImage(imageUrl);
      }
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to delete room: ${error.message}`);
  }
};

export const deleteRooms = async (ids) => {
  if (!ids || ids.length === 0) {
    throw new Error("No room IDs provided for deletion.");
  }
  const query = `DELETE FROM rooms WHERE id = ANY($1) RETURNING *`;
  try {
    const result = await pool.query(query, [ids]);
    if (result.rows && result.rows.length > 0) {
      for (const row of result.rows) {
        const imageUrls = row.image_urls || [];
        for (const imageUrl of imageUrls) {
          await deleteCloudinaryImage(imageUrl);
        }
      }
      return result.rows;
    }
    return null;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to delete rooms: ${error.message}`);
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    // Extract public_id from the Cloudinary URL
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = `hotel-rooms/${filenameWithExtension.split('.')[0]}`; // Assuming folder is 'hotel-rooms'

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Create the delete image endpoint handler
export const deleteRoomImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.body;

    if (!id || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and image URL are required'
      });
    }

    // First, get the current room data
    const query = 'SELECT image_urls FROM rooms WHERE id = $1';
    const roomResult = await pool.query(query, [id]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const currentImageUrls = roomResult.rows[0].image_urls || [];
    
    // Remove the specified image URL from the array
    const updatedImageUrls = currentImageUrls.filter(url => url !== imageUrl);

    // Update the room with new image_urls array
    const updateQuery = `
      UPDATE rooms 
      SET image_urls = $1 
      WHERE id = $2 
      RETURNING *
    `;
    
    await pool.query(updateQuery, [updatedImageUrls, id]);

    // Delete the image from Cloudinary
    await deleteCloudinaryImage(imageUrl);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
};