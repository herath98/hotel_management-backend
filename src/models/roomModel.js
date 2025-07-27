import { PrismaClient } from '../generated/prisma/index.js';
import cloudinary from '../config/cloudinary.js';

const prisma = new PrismaClient();

export const addRoom = async (room) => {
  try {
    const newRoom = await prisma.rooms.create({
      data: room,
    });
    return newRoom;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to add room: ${error.message}`);
  }
};

export const getAllRooms = async () => {
  try {
    const rooms = await prisma.rooms.findMany();
    return rooms;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to get rooms: ${error.message}`);
  }
};

export const updateRoom = async (id, room) => {
  try {
    const updatedRoom = await prisma.rooms.update({
      where: { id: parseInt(id, 10) },
      data: room,
    });
    return updatedRoom;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to update room: ${error.message}`);
  }
};

export const getRoomById = async (id) => {
  try {
    const room = await prisma.rooms.findUnique({
      where: { id: parseInt(id, 10) },
    });
    return room;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to get room: ${error.message}`);
  }
};


export const getRoomsByStatus = async (status) => {
  try {
    const rooms = await prisma.rooms.findMany({
      where: { status },
    });
    return rooms;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to get rooms by status: ${error.message}`);
  }
};

export const updateRoomStatus = async (id, status) => {
  try {
    const updatedRoom = await prisma.rooms.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });
    return updatedRoom;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to update room status: ${error.message}`);
  }
};

export const deleteRoom = async (id) => {
  try {
    const room = await prisma.rooms.delete({
      where: { id: parseInt(id, 10) },
    });
    if (room) {
      const imageUrls = room.image_urls || [];
      for (const imageUrl of imageUrls) {
        await deleteCloudinaryImage(imageUrl);
      }
    }
    return room;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to delete room: ${error.message}`);
  }
};

export const deleteRooms = async (ids) => {
  if (!ids || ids.length === 0) {
    throw new Error("No room IDs provided for deletion.");
  }
  try {
    const deletedRooms = await prisma.rooms.deleteMany({
      where: {
        id: {
          in: ids.map(id => parseInt(id, 10)),
        },
      },
    });
    // Note: deleteMany does not return the deleted records.
    // You may need to fetch them before deletion if you need them.
    return deletedRooms;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to delete rooms: ${error.message}`);
  }
};

export const updateRoomStatusBulk = async (ids, status) => {
  if (!ids || ids.length === 0) {
    throw new Error("No room IDs provided for status update.");
  }
  try {
    const updatedRooms = await prisma.rooms.updateMany({
      where: {
        id: {
          in: ids.map(id => parseInt(id, 10)),
        },
      },
      data: { status },
    });
    return updatedRooms;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new Error(`Failed to update room status: ${error.message}`);
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

    const room = await prisma.rooms.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const currentImageUrls = room.image_urls || [];
    
    // Remove the specified image URL from the array
    const updatedImageUrls = currentImageUrls.filter(url => url !== imageUrl);

    // Update the room with new image_urls array
    await prisma.rooms.update({
      where: { id: parseInt(id, 10) },
      data: { image_urls: updatedImageUrls },
    });

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
