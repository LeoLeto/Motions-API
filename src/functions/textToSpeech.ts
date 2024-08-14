import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import OpenAI from "openai";
import path = require("path");
import * as fs from "fs";

const openai = new OpenAI();
const speechFile = path.resolve("./speech.mp3");

export async function textToSpeech(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input:
      "By default, the Whisper API will output a transcript of the provided audio in text. ",
  });
  console.log("AUDIO CREATED");
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(speechFile),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });
  console.log("AUDIO TRANSCRIBED");

  //   console.log(transcription.text);
  console.log(transcription);

  return { body: `Worked` };
}

app.http("textToSpeech", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: textToSpeech,
});
