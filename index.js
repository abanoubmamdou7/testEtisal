import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import initApp from './src/modules/app.router.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, "./config/.env") });

const app = express();
app.use(cors());

initApp(app, express);


// API endpoint
app.post('/api/query', async (req, res) => {
  try {
    if (!pool) {
      throw new Error('Database not connected.');
    }  

    const { query, params } = req.body;
    console.log('Executing query:', query);
    console.log('With parameters:', params);

    const request = pool.request();

    if (params && Array.isArray(params)) {
      params.forEach((param, index) => {
        request.input(`param${index + 1}`, param);
      });
    }

    let finalQuery = query;
    if (params && params.length > 0) {
      params.forEach((_, index) => {
        finalQuery = finalQuery.replace('?', `@param${index + 1}`);
      });
    }

    const result = await request.query(finalQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
