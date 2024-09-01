import { ContainerClient } from "@azure/storage-blob";
import { Readable } from "stream";

export async function uploadImageToBlobStorage(
  containerClient: ContainerClient,
  imageStream: Readable,
  filename: string
): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  await blockBlobClient.uploadStream(imageStream);
  return blockBlobClient.url;
}
