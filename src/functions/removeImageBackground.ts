import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { removeBackground } from "@imgly/background-removal-node";
import path = require("path");
// import * as fs from "fs";
import sharp = require("sharp");
import { Rembg } from "@xixiyahaha/rembg-node";
import * as fs from "fs/promises";
import { transparentBackground } from "transparent-background";

let image_src: //  ImageData |
ArrayBuffer | Uint8Array | Blob | URL | string = path.resolve("./r3.png");

export async function removeImageBackground(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const input = await fs.readFile("./r3.png");
  console.log("input: ", input);

  const output = await transparentBackground(input, "png", {
    // uses a 1024x1024 model by default
    // enabling fast uses a 384x384 model instead
    fast: false,
  });
  console.log("output: ", output);

  await fs.writeFile("test-output.png", output);
  return;

  // main();
  //   const blob = await removeBackground(image_src);
  //   console.log("this runs");
  //   console.log("blob: ", blob);
  //   return { body: `test` };

  // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
  return;

  //   const buffer = Buffer.from(await blob.arrayBuffer());
  //   const dataURL = `data:image/png;base64,${buffer.toString("base64")}`;
  //   console.log(dataURL);

  //   return { body: `Hello, ${name}!` };
}

// Function to remove background from an image
async function removeImageBackgroundTEST(imgSource) {
  try {
    // Removing background
    const blob = await removeBackground(imgSource);

    // Converting Blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Generating data URL
    const dataURL = `data:image/png;base64,${buffer.toString("base64")}`;

    // Returning the data URL
    return dataURL;
  } catch (error) {
    // Handling errors
    throw new Error("Error removing background: " + error);
  }
}

// Example usage
// async function main() {
//   try {
//     // Path to the input image
//     const imgSource = "./r3.png";

//     // Removing background from the input image
//     const resultDataURL = await removeImageBackgroundTEST(imgSource);

//     // Writing the result to a file (optional)
//     fs.writeFileSync("output.png", resultDataURL.split(";base64,").pop(), {
//       encoding: "base64",
//     });

//     // Logging success message
//     console.log("Background removed successfully.");
//   } catch (error) {
//     // Logging error message
//     console.error("Error:", error.message);
//   }
// }

app.http("removeImageBackground", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: removeImageBackground,
});
