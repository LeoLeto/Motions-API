import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import axios from "axios";
import { PassThrough, Readable } from "stream";
import Jimp from "jimp";
import { v4 as uuid } from "uuid";
import { dalleAssetInterface } from "./dalleAsset";
import { BlobServiceClient } from "@azure/storage-blob";
import { createMongoDBConnection } from "./shared/mongodbConfig";
import { uploadImageToBlobStorage } from "./shared/uploadImageToBlobStorage";
import { insertDalleAsset } from "./shared/insertDalleAsset";

export interface VisionResponseObjectInterface {
  rectangle: VisionRectangle;
  object: string;
  confidence: number;
  parent?: {
    object: string;
    confidence: number;
  };
  sceneCode?: string;
}

interface VisionRectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function analyzeImage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT;
  const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;

  const textBody = await request.text();
  const parsedBody: { url: string } = JSON.parse(textBody);

  const visionResponse = await axios
    .post(AZURE_VISION_ENDPOINT, parsedBody, {
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => console.error(error));

  const croppedObjects = await cropImageAndUploadAssets(
    parsedBody.url,
    visionResponse.objects
  );

  return { jsonBody: { visionResponse, croppedObjects } };
}

async function cropImageAndUploadAssets(
  imageUrl: string,
  imageObjects: VisionResponseObjectInterface[]
): Promise<dalleAssetInterface[]> {
  try {
    const AZURE_STORAGE_CONNECTION_STRING =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    const db = await createMongoDBConnection();
    const dalleAssets = db.collection<dalleAssetInterface>("dalleAssets");
    let createdAssets: dalleAssetInterface[] = [];

    const containerClient = blobServiceClient.getContainerClient("motion-ai");
    const axiosResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const originalImage = await Jimp.read(Buffer.from(axiosResponse.data));

    for (const object of imageObjects) {
      const { x, y, w, h } = object.rectangle;

      if (
        x < 0 ||
        y < 0 ||
        w <= 0 ||
        h <= 0 ||
        x + w > originalImage.bitmap.width ||
        y + h > originalImage.bitmap.height
      ) {
        console.warn(
          `Skipping crop for object "${object.object}" due to invalid dimensions.`
        );
        continue;
      }

      const orientation: "vertical" | "horizontal" | "square" =
        w > h ? "horizontal" : h > w ? "vertical" : "square";

      const assetCode = uuid();
      const croppedImage = originalImage.clone().crop(x, y, w, h);
      const outputFilename = `${assetCode}.png`;
      const croppedImageBuffer = await croppedImage.getBufferAsync(
        Jimp.MIME_PNG
      );
      const croppedImageStream = new PassThrough();
      croppedImageStream.end(croppedImageBuffer);
      const url = await uploadImageToBlobStorage(
        containerClient,
        croppedImageStream,
        outputFilename
      );

      const newAssetPayload: dalleAssetInterface = {
        prompt: "",
        orientation,
        isTransparent: false,
        code: assetCode,
        width: w,
        height: h,
        revisedPrompt: "",
        description: "",
        tags: [],
        url,
        scene: object,
      };

      await insertDalleAsset(dalleAssets, newAssetPayload);
      createdAssets.push(newAssetPayload);
    }

    return createdAssets;
  } catch (error) {
    console.error("Error cropping image:", error);
    throw error;
  }
}

app.http("analyzeImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: analyzeImage,
});
