import { HttpRequest } from "@azure/functions";
import { createDalleAsset } from "../src/functions/dalleAsset";
import { loadLocalSettings } from "../src/functions/shared/jestEnvironmentLoader";
import { MockInvocationContext } from "./mocks/mockInvocationContext";

loadLocalSettings();

jest.mock("../src/functions/shared/pinoLogger", () => {
  return {
    logger: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    },
  };
});

const mockInvocationContext = new MockInvocationContext();

let dalleAssetPayload = [
  {
    prompt: "A new animal that's half-penguin half-turtle",
    isTransparent: true,
    orientation: "horizontal",
    description: "Description",
    tags: ["tag 1", "tag 2"],
  },
];

function resetAssetPayload() {
  dalleAssetPayload = [
    {
      prompt: "A new animal that's half-penguin half-turtle",
      isTransparent: true,
      orientation: "horizontal",
      description: "Description",
      tags: ["tag 1", "tag 2"],
    },
  ];
}

test("Should successfully create a Dalle asset", async () => {
  const mockHttpRequest = new HttpRequest({
    method: "POST",
    url: "http://localhost:7071/api/dalleAsset",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      string: JSON.stringify(dalleAssetPayload),
    },
  });

  const createDalleAssetResponse = await createDalleAsset(
    mockHttpRequest,
    mockInvocationContext
  );
}, 120000);

test("Should receive a status 400 because the prompt is too short", async () => {
  dalleAssetPayload[0].prompt = "A";
  const mockHttpRequest = new HttpRequest({
    method: "POST",
    url: "http://localhost:7071/api/dalleAsset",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      string: JSON.stringify(dalleAssetPayload),
    },
  });

  const createDalleAssetResponse = await createDalleAsset(
    mockHttpRequest,
    mockInvocationContext
  );
  expect(createDalleAssetResponse.status).toBe(400);
}, 120000);

test("Should receive a status 400 because the orientation is wrong", async () => {
  resetAssetPayload();
  dalleAssetPayload[0].orientation = "wide";
  const mockHttpRequest = new HttpRequest({
    method: "POST",
    url: "http://localhost:7071/api/dalleAsset",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      string: JSON.stringify(dalleAssetPayload),
    },
  });

  const createDalleAssetResponse = await createDalleAsset(
    mockHttpRequest,
    mockInvocationContext
  );
  expect(createDalleAssetResponse.status).toBe(400);
}, 120000);
