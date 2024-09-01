import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import axios from "axios";
import { Readable } from "stream";
import Jimp from "jimp";
import { v4 as uuid } from "uuid";

interface VisionRectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface VisionResponseObjectInterface {
  rectangle: VisionRectangle;
  object: string;
  confidence: number;
  parent?: {
    object: string;
    confidence: number;
  };
}

export async function analyzeImage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT;
  const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;

  const textBody = await request.text();
  const parsedBody: { url: string } = JSON.parse(textBody);

  const axiosVisionResponse = await axios
    .post(AZURE_VISION_ENDPOINT, parsedBody, {
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => console.error(error));

  cropImage(parsedBody.url, axiosVisionResponse.objects);

  return { jsonBody: axiosVisionResponse };
}

async function cropImage(
  imageUrl: string,
  imageObjects: VisionResponseObjectInterface[]
) {
  try {
    const axiosResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(axiosResponse.data);
    const originalImage = await Jimp.read(imageBuffer);

    for (const object of imageObjects) {
      const { x, y, w, h } = object.rectangle;

      // Validate crop dimensions against the original image
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

      const croppedImage = originalImage.clone().crop(x, y, w, h);
      const outputFilename = `${uuid()}.png`;
      await croppedImage.writeAsync(outputFilename);
      console.log(`Cropped image saved as ${outputFilename}`);
    }
  } catch (error) {
    console.error("Error cropping image:", error);
  }
}

app.http("analyzeImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: analyzeImage,
});
