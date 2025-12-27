const prisma = require('../config/prisma');

/**
 * GET /pets
 * Get all pets
 */
const getAllPets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format tags to be cleaner
    const formattedPets = pets.map(pet => ({
      ...pet,
      tags: pet.tags.map(pt => pt.tag),
    }));

    res.status(200).json({
      success: true,
      data: formattedPets,
    });
  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * GET /pets/:id
 * Get a single pet by ID
 */
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pet not found',
          code: 'PET_NOT_FOUND',
        },
      });
    }

    // Format tags
    const formattedPet = {
      ...pet,
      tags: pet.tags.map(pt => pt.tag),
    };

    res.status(200).json({
      success: true,
      data: formattedPet,
    });
  } catch (error) {
    console.error('Get pet by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * POST /pets
 * Create a new pet
 */
const createPet = async (req, res) => {
  try {
    const { name, status, categoryId, photoUrls } = req.body;

    // Validation
    if (!name || !status || !categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name, status, and categoryId are required',
          code: 'MISSING_FIELDS',
        },
      });
    }

    // Validate status
    const validStatuses = ['available', 'pending', 'sold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be one of: available, pending, sold',
          code: 'INVALID_STATUS',
        },
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        },
      });
    }

    // Create pet
    const pet = await prisma.pet.create({
      data: {
        name,
        status,
        categoryId: parseInt(categoryId),
        photoUrls: photoUrls || [],
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * PUT /pets/:id
 * Update an existing pet
 */
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, categoryId, photoUrls } = req.body;

    // Check if pet exists
    const existingPet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPet) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pet not found',
          code: 'PET_NOT_FOUND',
        },
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['available', 'pending', 'sold'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Status must be one of: available, pending, sold',
            code: 'INVALID_STATUS',
          },
        });
      }
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Category not found',
            code: 'CATEGORY_NOT_FOUND',
          },
        });
      }
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (photoUrls !== undefined) updateData.photoUrls = photoUrls;

    // Update pet
    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Format tags
    const formattedPet = {
      ...pet,
      tags: pet.tags.map(pt => pt.tag),
    };

    res.status(200).json({
      success: true,
      data: formattedPet,
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * DELETE /pets/:id
 * Delete a pet by ID
 */
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pet not found',
          code: 'PET_NOT_FOUND',
        },
      });
    }

    // Delete pet (tags will be deleted automatically due to cascade)
    await prisma.pet.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Pet deleted successfully',
        id: parseInt(id),
      },
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};
