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
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: "A flying cat",
  });

  console.log(image.data);

  return { body: image.data[0].url };
}

app.http("dalle", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: dalle,
});
