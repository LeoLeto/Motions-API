import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import OpenAI from "openai";

const openai = new OpenAI();

export async function dalle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestBody: any = await request.json();
  const imageUrl: string = await returnDalleImageUrl(requestBody.Prompt);
  return { body: imageUrl };
}

export async function returnDalleImageUrl(receivedPrompt: string) {
  // console.log("CREATING IMAGE");
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: receivedPrompt,
  });
  // console.log("IMAGE CREATED: ", image.data[0].url);
  return image.data[0].url;
}

app.http("dalle", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: dalle,
});
