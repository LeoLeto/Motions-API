import { MongoClient } from "mongodb";

// const DATABASE_NAME: string = process.env.DATABASE_NAME as string;

export async function createMongoDBConnection() {
  const MONGODB_ATLAS_URI: string = process.env.MONGODB_ATLAS_URI as string;
  const client = new MongoClient(MONGODB_ATLAS_URI);
  await client.connect();
  const DATABASE_NAME: string = "motions";
  const database = client.db(DATABASE_NAME);
  return database;
}
