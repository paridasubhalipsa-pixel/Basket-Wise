import type { Request, Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { CategoryDoc } from '../types.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = db.categories.map((c) => {
      const productCount = db.products.filter((p) => p.categoryId === c._id && p.isActive).length;
      return {
        ...c,
        productCount,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully.',
      data: { categories },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
      errors: [(err as Error).message],
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();

    const newCategory: CategoryDoc = {
      _id: 'cat_' + Date.now().toString(36),
      name: name.trim(),
      slug,
      description: description || '',
      image: image || '/src/assets/images/hero_smart_shopping_1792656373006.jpg',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.categories.push(newCategory);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category: newCategory },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category.',
      errors: [(err as Error).message],
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = db.categories.find((c) => c._id === id);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const { name, description, image, isActive } = req.body;
    if (name) {
      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    category.updatedAt = new Date().toISOString();
    db.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: { category },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category.',
      errors: [(err as Error).message],
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = db.categories.findIndex((c) => c._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    db.categories.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category.',
      errors: [(err as Error).message],
    });
  }
};
