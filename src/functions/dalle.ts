import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import OpenAI from "openai";

export async function dalle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const textBody = await request.text();
  const parsedBody: { Prompt: string } = JSON.parse(textBody);

  const imageUrl: string = (await returnDalleImage(parsedBody.Prompt)).url;
  return { body: imageUrl };
}

export async function returnDalleImage(
  receivedPrompt: string,
  receivedProportion?: "square" | "horizontal" | "vertical"
  // receivedSize?: "1024x1024" | "1792x1024" | "1024x1792"
) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error(
      "The OPENAI_API_KEY environment variable is missing or empty."
    );
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // console.log("CREATING IMAGE");
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: receivedPrompt,
    size:
      receivedProportion === "square"
        ? "1024x1024"
        : receivedProportion === "horizontal"
        ? "1792x1024"
        : "1024x1792",
  });
  // console.log("IMAGE CREATED: ", image.data[0].url);
  return {
    url: image.data[0].url,
    revisedPrompt: image.data[0].revised_prompt,
  };
}

app.http("dalle", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: dalle,
});
