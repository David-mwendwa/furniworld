import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION — shutting down');
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5005;
const DB = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!DB) {
  console.error('No database connection string set (DATABASE_URL)');
  process.exit(1);
}

await mongoose.connect(DB);
console.log(`MongoDB connected: ${mongoose.connection.name}`);

const { default: app } = await import('./app.js');

const server = app.listen(PORT, () =>
  console.log(`Furniworld API listening on http://localhost:${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION — shutting down');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated'));
});
