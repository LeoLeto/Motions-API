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
  const textBody = await request.text();
  const parsedBody: { Prompt: string } = JSON.parse(textBody);

  const imageUrl: string = await returnDalleImageUrl(parsedBody.Prompt);
  return { body: imageUrl };
}

export async function returnDalleImageUrl(
  receivedPrompt: string,
  receivedSize?: "1024x1024" | "1792x1024" | "1024x1792"
) {
  // console.log("CREATING IMAGE");
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: receivedPrompt,
    size: receivedSize ? receivedSize : "1792x1024",
  });
  // console.log("IMAGE CREATED: ", image.data[0].url);
  return image.data[0].url;
}

app.http("dalle", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: dalle,
});
