import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, run } from '../db.js';
import { requireAdmin, AuthenticatedRequest, logAuditAction } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== BRANDS ====================
router.get('/brands', (req: Request, res: Response) => {
  const brands = query(`
    SELECT b.*, 
           (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id AND p.status = 'published') as product_count
    FROM brands b 
    WHERE b.status = 'active' 
    ORDER BY b.display_order ASC;
  `);
  res.json({ success: true, brands });
});

router.get('/brands/:slug', (req: Request, res: Response) => {
  const brand = queryOne('SELECT * FROM brands WHERE slug = ? OR id = ?;', [req.params.slug, req.params.slug]);
  if (!brand) {
    res.status(404).json({ success: false, error: 'Brand not found' });
    return;
  }
  const products = query(`
    SELECT p.*,
           (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as primary_image
    FROM products p
    WHERE p.brand_id = ? AND p.status = 'published'
    ORDER BY p.is_featured DESC;
  `, [brand.id]);

  res.json({ success: true, brand, products });
});

router.post('/brands', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, logoUrl, description, seoTitle, seoDescription, displayOrder = 0 } = req.body;
    const id = `brand_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = Date.now();

    run(
      `INSERT INTO brands (id, name, slug, logo_url, description, seo_title, seo_description, status, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?);`,
      [id, name, cleanSlug, logoUrl || '', description || '', seoTitle || '', seoDescription || '', displayOrder, now, now]
    );

    logAuditAction(req.adminId, req.user?.email, 'create_brand', 'brand', id, req.ip || 'unknown', `Created brand ${name}`);
    res.status(201).json({ success: true, brandId: id, message: 'Brand added successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add brand' });
  }
});

router.put('/brands/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name, slug, logoUrl, description, seoTitle, seoDescription, displayOrder, status } = req.body;
    const now = Date.now();

    run(
      `UPDATE brands SET
        name = ?, slug = ?, logo_url = ?, description = ?, seo_title = ?, seo_description = ?,
        display_order = ?, status = ?, updated_at = ?
       WHERE id = ?;`,
      [name, slug, logoUrl, description, seoTitle, seoDescription, displayOrder, status || 'active', now, id]
    );

    logAuditAction(req.adminId, req.user?.email, 'update_brand', 'brand', id, req.ip || 'unknown', `Updated brand ${name}`);
    res.json({ success: true, message: 'Brand updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update brand' });
  }
});

router.delete('/brands/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    // Check if products exist
    const hasProducts = queryOne('SELECT id FROM products WHERE brand_id = ? LIMIT 1;', [id]);
    if (hasProducts) {
      res.status(400).json({ success: false, error: 'Cannot delete brand with associated products. Reassign or delete products first.' });
      return;
    }
    run('DELETE FROM brands WHERE id = ?;', [id]);
    logAuditAction(req.adminId, req.user?.email, 'delete_brand', 'brand', id, req.ip || 'unknown', `Deleted brand ${id}`);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete brand' });
  }
});

// ==================== CATEGORIES ====================
router.get('/categories', (req: Request, res: Response) => {
  const categories = query(`
    SELECT c.*,
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published') as product_count
    FROM categories c
    WHERE c.status = 'active'
    ORDER BY c.display_order ASC;
  `);
  res.json({ success: true, categories });
});

router.get('/categories/:slug', (req: Request, res: Response) => {
  const category = queryOne('SELECT * FROM categories WHERE slug = ? OR id = ?;', [req.params.slug, req.params.slug]);
  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }
  const products = query(`
    SELECT p.*,
           (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as primary_image
    FROM products p
    WHERE p.category_id = ? AND p.status = 'published'
    ORDER BY p.is_featured DESC;
  `, [category.id]);

  res.json({ success: true, category, products });
});

router.post('/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, imageUrl, parentId, displayOrder = 0 } = req.body;
    const id = `cat_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = Date.now();

    run(
      `INSERT INTO categories (id, name, slug, description, image_url, parent_id, status, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?);`,
      [id, name, cleanSlug, description || '', imageUrl || '', parentId || null, displayOrder, now, now]
    );

    logAuditAction(req.adminId, req.user?.email, 'create_category', 'category', id, req.ip || 'unknown', `Created category ${name}`);
    res.status(201).json({ success: true, categoryId: id, message: 'Category created' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create category' });
  }
});

router.put('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name, slug, description, imageUrl, parentId, displayOrder, status } = req.body;
    const now = Date.now();

    run(
      `UPDATE categories SET
        name = ?, slug = ?, description = ?, image_url = ?, parent_id = ?,
        display_order = ?, status = ?, updated_at = ?
       WHERE id = ?;`,
      [name, slug, description, imageUrl, parentId || null, displayOrder, status || 'active', now, id]
    );

    logAuditAction(req.adminId, req.user?.email, 'update_category', 'category', id, req.ip || 'unknown', `Updated category ${name}`);
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const hasProducts = queryOne('SELECT id FROM products WHERE category_id = ? LIMIT 1;', [id]);
    if (hasProducts) {
      res.status(400).json({ success: false, error: 'Cannot delete category containing products.' });
      return;
    }
    run('DELETE FROM categories WHERE id = ?;', [id]);
    logAuditAction(req.adminId, req.user?.email, 'delete_category', 'category', id, req.ip || 'unknown', `Deleted category ${id}`);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// ==================== VEHICLE COMPATIBILITY ====================
router.get('/vehicles/makes', (req: Request, res: Response) => {
  const makes = query('SELECT * FROM vehicles ORDER BY make ASC;');
  res.json({ success: true, makes });
});

router.get('/vehicles/models', (req: Request, res: Response) => {
  const makeId = req.query.makeId?.toString();
  const sql = makeId
    ? 'SELECT * FROM vehicle_models WHERE vehicle_id = ? ORDER BY model_name ASC;'
    : 'SELECT * FROM vehicle_models ORDER BY model_name ASC;';
  const models = query(sql, makeId ? [makeId] : []);
  res.json({ success: true, models });
});

router.get('/vehicles/compatible-batteries', (req: Request, res: Response) => {
  const modelId = req.query.modelId?.toString();
  if (!modelId) {
    res.status(400).json({ success: false, error: 'Vehicle model ID required' });
    return;
  }

  const batteries = query(
    `SELECT p.*, b.name as brand_name,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as primary_image
     FROM products p
     JOIN product_compatibility pc ON p.id = pc.product_id
     JOIN brands b ON p.brand_id = b.id
     WHERE pc.vehicle_model_id = ? AND p.status = 'published';`,
    [modelId]
  );

  res.json({ success: true, batteries });
});

export default router;
