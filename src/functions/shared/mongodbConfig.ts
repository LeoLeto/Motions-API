import { MongoClient } from "mongodb";

const MONGODB_ATLAS_URI: string = process.env.MONGODB_ATLAS_URI as string;
// const DATABASE_NAME: string = process.env.DATABASE_NAME as string;
const DATABASE_NAME: string = "motions"

const client = new MongoClient(MONGODB_ATLAS_URI);

export async function createMongoDBConnection() {
  await client.connect();
  const database = client.db(DATABASE_NAME);
  return database;
}