import compose from "@0dep/pino-applicationinsights";
import pino from "pino";

// export const insights = require("pino-applicationinsights");
// export const pinoms = require("pino-multi-stream");

// create the Azure Application Insights destination stream

// export const pinoLogger = pino({
//   transport: {
//     target: "pino-pretty",
//     options: {
//       translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
//       ignore: "pid,hostname",
//     },
//   },
// });

const transport = compose({
  track(chunk) {
    const { time, severity, msg: message, properties, exception } = chunk;
    this.trackTrace({ time, severity, message, properties });
    if (exception) this.trackException({ time, exception, severity });
  },
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  config: { maxBatchSize: 1 },
});

export const logger = pino({ level: "trace" }, transport);
