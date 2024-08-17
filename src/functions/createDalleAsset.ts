import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { returnDalleImageUrl } from "./dalle";

interface dalleAssetInterface {
  prompt: string;
  size: string;
  type: "background" | "asset";
}

export async function createDalleAsset(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const textBody = await request.text();
  const parsedBody: dalleAssetInterface[] = JSON.parse(textBody);
  let createdAssetsUrls: string[];

  for await (const assetPayload of parsedBody) {
    console.log("ITERATION STARTED");
    const newImage = await returnDalleImageUrl(assetPayload.prompt);
    console.log("NEW IMAGE: ", newImage);
    console.log("THIS RAN 1");
    createdAssetsUrls.push(newImage);
    console.log("THIS RAN 2");
    console.log("createdAssetsUrls: ", createdAssetsUrls);
  }

  console.log("EXITED LOOP");

  return { jsonBody: createdAssetsUrls };
}

app.http("createDalleAsset", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createDalleAsset,
});
