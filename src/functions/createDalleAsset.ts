import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { returnDalleImageUrl } from "./dalle";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Readable } from "stream";

interface dalleAssetInterface {
  prompt: string;
  size: "1024x1024" | "1792x1024" | "1024x1792";
  type: "background" | "asset";
}

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient("motion-ai");

export async function createDalleAsset(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const textBody = await request.text();
  const parsedBody: dalleAssetInterface[] = JSON.parse(textBody);
  let createdAssetsUrls: string[] = [];

  try {
    for await (const assetPayload of parsedBody) {
      const newImageUrl = await returnDalleImageUrl(
        assetPayload.prompt,
        assetPayload.type === "asset" ? "1024x1024" : "1792x1024"
      );
      const blobName = uuidv4() + ".png";
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const imageBuffer = await axios.get(newImageUrl, {
        responseType: "arraybuffer",
      });
      const imageStream = Readable.from(Buffer.from(imageBuffer.data));
      await blockBlobClient.uploadStream(imageStream);
      createdAssetsUrls.push(blockBlobClient.url);
    }

    return { jsonBody: createdAssetsUrls };
  } catch (error) {
    console.error("Error downloading or uploading image:", error);
    return { body: error };
  }
}

app.http("createDalleAsset", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createDalleAsset,
});
