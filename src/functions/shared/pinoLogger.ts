import compose from "@0dep/pino-applicationinsights";
import pino from "pino";

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
