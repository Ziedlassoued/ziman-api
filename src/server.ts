import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDatabase } from './utils/database';
import { getCharacterCollection } from './utils/database';

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

app.post('/api/characters', async (request, response) => {
  const newCharacter = request.body;
  const characterCollection = getCharacterCollection();
  const existingCharacter = await characterCollection.findOne({
    name: newCharacter.name,
    nickname: newCharacter.nickname,
    birthday: newCharacter.birthday,
    status: newCharacter.satus,
  });
  if (!existingCharacter) {
    const characterDocument = await characterCollection.insertOne(newCharacter);
    const responseDocument = {
      ...newCharacter,
      ...characterDocument.insertedId,
    };
    response.status(200).send(responseDocument);
  } else {
    response.status(409).send('Character is already in the database');
  }
});

/* app.get('/', (_req, res) => {
  res.send('Hello World!');
}); */

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
