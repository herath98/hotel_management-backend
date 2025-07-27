import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const createGuest = async (guestData) => {
  return await prisma.guests.create({
    data: guestData,
  });
};

export const updateGuest = async (guestId, guestData) => {
  return await prisma.guests.update({
    where: { id: guestId },
    data: guestData,
  });
};

export const deleteGuest = async (guestId) => {
  return await prisma.guests.delete({
    where: { id: guestId },
  });
};

export const listAllGuests = async () => {
  return await prisma.guests.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });
};
  
export const getGuestById = async (guestId) => {
  return await prisma.guests.findUnique({
    where: { id: guestId },
  });
};
