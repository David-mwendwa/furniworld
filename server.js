import 'express-async-errors';
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// import middleware
import notFoundMiddleware from './middleware/notFound.js';
import errorHandlerMiddleware from './middleware/errorHandler.js';

// import routes
import productRouter from './routes/product.js';
import userRouter from './routes/user.js';

const app = express();

app.use(express.json());

// use routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1', userRouter);

// error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// connection
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URI;
mongoose
  .connect(DB)
  .then(() => console.log('mongoDB connection successful'))
  .catch((err) => console.log(`could not connect to mongoDB`, err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
