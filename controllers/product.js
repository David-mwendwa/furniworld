import Product from '../models/Product.js';
import {
  createOne,
  getOne,
  getMany,
  updateOne,
  deleteOne,
} from '../utils/handleAPI.js';

export const createProduct = createOne(Product);
export const getProducts = getMany(Product);
export const getProduct = getOne(Product);
export const updateProduct = updateOne(Product);
export const deleteProduct = deleteOne(Product);
