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

interface VisionResponseObjectInterface {
  rectangle: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  object: string;
  confidence: number;
  parent?: { object: string; confidence: number };
}

const TEMPVisionResponse = {
  objects: [
    // {
    //   rectangle: {
    //     x: 338,
    //     y: 46,
    //     w: 167,
    //     h: 161,
    //   },
    //   object: "Wall clock",
    //   confidence: 0.783,
    //   parent: {
    //     object: "Clock",
    //     confidence: 0.802,
    //   },
    // },
    {
      rectangle: {
        x: 151,
        y: 153,
        w: 169,
        h: 272,
      },
      object: "Picture frame",
      confidence: 0.528,
    },
    // {
    //   rectangle: {
    //     x: 404,
    //     y: 54,
    //     w: 409,
    //     h: 507,
    //   },
    //   object: "person",
    //   confidence: 0.855,
    // },
    // {
    //   rectangle: {
    //     x: 9,
    //     y: 378,
    //     w: 698,
    //     h: 184,
    //   },
    //   object: "Desk",
    //   confidence: 0.56,
    // },
  ],
  requestId: "77cf3748-bf23-4098-9645-da8ae645a985",
  metadata: {
    height: 576,
    width: 1024,
    format: "Jpeg",
  },
  modelVersion: "2021-05-01",
};

export async function analyzeImage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT;
  const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;

  const textBody = await request.text();
  const parsedBody: { url: string } = JSON.parse(textBody);

  // const body = {
  //   url: parsedBody.url,
  // };
  cropImage(parsedBody.url, TEMPVisionResponse.objects);
  return;

  const axiosResponse = await axios
    .post(AZURE_VISION_ENDPOINT, parsedBody, {
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => console.error(error));

  return { jsonBody: axiosResponse };
}

async function cropImage(
  imageUrl: string,
  imageObjects: VisionResponseObjectInterface[]
) {
  const axiosResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const imageStream = Readable.from(Buffer.from(axiosResponse.data));
  const imageBufferFromStream = await streamToBuffer(imageStream);

  const image = await Jimp.read(imageBufferFromStream);

  for (const object of imageObjects) {
    console.log(object);
    image
      .crop(
        object.rectangle.x,
        object.rectangle.y,
        object.rectangle.w,
        object.rectangle.h
      )
      .write(uuid() + ".png");
  }
}

// Function to convert Readable stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

app.http("analyzeImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: analyzeImage,
});
