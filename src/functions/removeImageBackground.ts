// import {
//   app,
//   HttpRequest,
//   HttpResponseInit,
//   InvocationContext,
// } from "@azure/functions";
// import * as fs from "fs/promises";
// import { transparentBackground } from "transparent-background";
// import path = require("path");
// // import * as fs from "fs";
// import sharp = require("sharp");

// let image_src: //  ImageData |
// ArrayBuffer | Uint8Array | Blob | URL | string = path.resolve("./r3.png");

// export async function removeImageBackground(
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> {
//   const input = await fs.readFile("./r3.png");
//   console.log("input: ", input);

//   const output = await transparentBackground(input, "png", {
//     // uses a 1024x1024 model by default
//     // enabling fast uses a 384x384 model instead
//     fast: false,
//   });
//   console.log("output: ", output);

//   await fs.writeFile("test-output.png", output);
//   return;

// }

// app.http("removeImageBackground", {
//   methods: ["GET", "POST"],
//   authLevel: "anonymous",
//   handler: removeImageBackground,
// });
