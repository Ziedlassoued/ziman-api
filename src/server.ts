import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDatabase } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('No MONGODB_URI provided');
}

const app = express();
const port = 3000;

app.use((request, _response, next) => {
  console.log('Request received', request.url);
  next();
});

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
