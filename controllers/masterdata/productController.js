import {
  createProduct as createProductService,
  getProductById,
  getAllProducts as getAllProductsService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  getProductsForDropdown as getProductsForDropdownService
} from '../../services/masterdata/productService.js';

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { productName, isActive } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'productName is required' });
    }

    const newProduct = await createProductService({
      productName,
      isActive
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Get Product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await getAllProductsService();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { productName, isActive } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'productName is required' });
    }

    const updatedProduct = await updateProductService(req.params.productId, {
      productName,
      isActive
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await deleteProductService(req.params.productId);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get Products for Dropdown
export const getProductsForDropdown = async (req, res) => {
  try {
    const products = await getProductsForDropdownService();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products for dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch products for dropdown' });
  }
};
