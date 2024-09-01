import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import axios from "axios";

export async function analyzeImage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT;
  const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;

  const textBody = await request.text();
  const parsedBody: { url: string } = JSON.parse(textBody);

  const body = {
    url: parsedBody.url,
  };

  const axiosResponse = await axios
    .post(AZURE_VISION_ENDPOINT, body, {
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

app.http("analyzeImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: analyzeImage,
});
