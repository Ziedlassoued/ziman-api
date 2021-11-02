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

app.get('/api/characters/:name', async (request, response) => {
  const name = request.params.name;
  const existingCharacter = await getCharacterCollection().findOne({ name });
  if (existingCharacter) {
    response.status(200).send(existingCharacter);
  } else {
    response.status(404).send('The requested character does not exist');
  }
});

app.get('/api/characters', async (_request, response) => {
  const characterDocuments = await getCharacterCollection().find().toArray();
  response.status(200).send(characterDocuments);
});

app.delete('/api/characters/:name', async (request, response) => {
  const searchedName = request.params.name;
  const characterCollection = getCharacterCollection();
  const isCharacterKnown = await characterCollection.findOne({
    name: searchedName,
  });

  if (isCharacterKnown) {
    characterCollection.deleteOne(isCharacterKnown);
    response.status(200).send(`${searchedName} has been deleted`);
  } else {
    response.status(404).send('The requested character does not exist');
  }
});

app.post('/api/characters/:name', async (request, response) => {
  const characterCollection = getCharacterCollection();
  const character = request.params.name;

  const updated = await characterCollection.updateOne(
    { name: character },
    { $set: request.body }
  );
  if (updated.matchedCount === 0) {
    response.status(404).send('The requested character does not exist');
    return;
  }
  response.send('Character is updated');
});
connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
