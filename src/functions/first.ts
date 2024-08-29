import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { logger } from "./shared/pinoLogger";
// import { insights, pinoms } from "./shared/pinoLogger";

export async function first(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  logger.info("Informational message");
  logger.error(new Error("things got bad"), "error message");

  const name = request.params.name;

  return { body: `Hello, ${name}!` };
}

app.http("first", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: first,
});
