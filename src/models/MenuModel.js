import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

const VALID_CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Special Offers'];
const VALID_DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Contains Nuts'];

const MenuModel = {
  async create(menuData) {
    const existingItem = await prisma.menu_items.findFirst({
      where: { name: { equals: menuData.name, mode: 'insensitive' } },
    });

    if (existingItem) {
      throw new Error('A menu item with this name already exists');
    }

    if (!VALID_CATEGORIES.includes(menuData.category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    if (menuData.dietary_tags) {
      const invalidTags = menuData.dietary_tags.filter((tag) => !VALID_DIETARY_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(`Invalid dietary tags: ${invalidTags.join(', ')}`);
      }
    }

    return await prisma.menu_items.create({
      data: {
        ...menuData,
        is_available: menuData.is_available ?? true,
        dietary_tags: menuData.dietary_tags || [],
      },
    });
  },

  async list() {
    return await prisma.menu_items.findMany({
      orderBy: [
        {
          category: 'asc', // Prisma does not support custom order like this, so we order by category and then name
        },
        {
          name: 'asc',
        },
      ],
    });
  },

  async update(id, menuData) {
    if (menuData.name) {
      const existingItem = await prisma.menu_items.findFirst({
        where: {
          name: { equals: menuData.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existingItem) {
        throw new Error('A menu item with this name already exists');
      }
    }

    if (menuData.category && !VALID_CATEGORIES.includes(menuData.category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    if (menuData.dietary_tags) {
      const invalidTags = menuData.dietary_tags.filter((tag) => !VALID_DIETARY_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(`Invalid dietary tags: ${invalidTags.join(', ')}`);
      }
    }

    return await prisma.menu_items.update({
      where: { id },
      data: menuData,
    });
  },

  async delete(id) {
    return await prisma.menu_items.delete({
      where: { id },
    });
  },
};

export default MenuModel;
