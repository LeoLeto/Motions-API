import {
  EffectiveFunctionOptions,
  InvocationContext,
  InvocationContextExtraInputs,
  InvocationContextExtraOutputs,
  RetryContext,
  TraceContext,
  TriggerMetadata,
} from "@azure/functions";

export class MockInvocationContext implements InvocationContext {
  invocationId: string = "test-invocation-id";
  functionName: string = "test-function-name";
  retryContext?: RetryContext;
  traceContext?: TraceContext;
  triggerMetadata?: TriggerMetadata;

  // Mock implementation of InvocationContextExtraInputs
  extraInputs: InvocationContextExtraInputs = {
    get: jest.fn(() => {
      return {}; // Return whatever mock data you need
    }),
    set: jest.fn(),
  };

  // Mock implementation of InvocationContextExtraOutputs
  extraOutputs: InvocationContextExtraOutputs = {
    set: jest.fn(),
    get: jest.fn(() => {
      return {}; // Return whatever mock data you need
    }),
  };

  // Mock implementation of EffectiveFunctionOptions
  options: EffectiveFunctionOptions = {
    trigger: {
      type: "httpTrigger", // Example trigger type
      direction: "in", // Example direction
      name: "req", // Example name
    },
    extraInputs: [],
    extraOutputs: [],
  };

  // Mock implementations for logging methods
  log = jest.fn(); // This will mock the log method using Jest
  trace = jest.fn(); // Mock trace method
  debug = jest.fn(); // Mock debug method
  info = jest.fn(); // Mock info method
  warn = jest.fn(); // Mock warn method
  error = jest.fn(); // Mock error method
}
