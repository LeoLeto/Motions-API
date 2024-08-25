import { HttpRequest } from "@azure/functions";
import { createDalleAsset } from "../src/functions/dalleAsset";
import { loadLocalSettings } from "../src/functions/shared/jestEnvironmentLoader";
import { MockInvocationContext } from "./mocks/mockInvocationContext";

loadLocalSettings();

const mockInvocationContext = new MockInvocationContext();

test("Should successfully create a Dalle asset", async () => {
  const mockHttpRequest = new HttpRequest({
    method: "POST",
    url: "http://localhost:7071/api/dalleAsset",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      string: JSON.stringify([
        {
          prompt: "A new animal that's half-penguin half-turtle",
          isTransparent: true,
          orientation: "horizontal",
          description: "Description",
          tags: ["tag 1", "tag 2"],
        },
      ]),
    },
  });

  const createDalleAssetResponse = await createDalleAsset(
    mockHttpRequest,
    mockInvocationContext
  );
  console.log("createDalleAssetResponse: ", createDalleAssetResponse);
  // expect(mockInvocationContext.log).toHaveBeenCalledWith("THIS RUNS");
}, 120000);
