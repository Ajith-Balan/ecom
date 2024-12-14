import express from 'express';
import dotenv from 'dotenv';
import connection from './connection.js';
import auth from './router/auth.js';
import categoryRoutes from './router/categoryRoutes.js';
import productRoutes from './router/productRoutes.js';
import cors from 'cors';
import cron from 'node-cron';
import { MongoClient } from 'mongodb';

dotenv.config();
connection();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use('/api/v1/auth', auth);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);

// MongoDB connection for pinging
const client = new MongoClient(process.env.dburl, {
  useNewUrlParser: true,
  
});

// Function to connect and ping MongoDB
async function pingDatabase() {
  try {
    if (!client.isConnected()) {
      console.log('Connecting to MongoDB...');
      await client.connect();
    }
    const db = client.db(); // Use default database if not specified
    await db.command({ ping: 1 });
    console.log('Ping successful: MongoDB connection is alive.');
  } catch (error) {
    console.error('Ping failed:', error);
  }
}

// Cron job to ping MongoDB every 5 minutes
cron.schedule('*/5 * * * *', pingDatabase);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
