import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// import routes
import productRouter from './routes/product.js';

const app = express();

// use routes
app.use('/api/v1/products', productRouter);

// connection
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URI;
mongoose
  .connect(DB)
  .then(() => console.log('mongoDB connection successful'))
  .catch((err) => console.log(`could not connect to mongoDB`, err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
