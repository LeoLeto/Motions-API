import { Collection } from "mongodb";
import { dalleAssetInterface } from "../dalleAsset";

export async function insertDalleAsset(
    dalleAssetsCollection: Collection<dalleAssetInterface>,
    assetPayload: dalleAssetInterface
  ): Promise<void> {
    await dalleAssetsCollection.insertOne(assetPayload);
  }