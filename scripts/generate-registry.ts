import { GetCollectionSuccessResponse, iDenomUnit, iMetadata } from 'bitbadgesjs-sdk';
import env from 'dotenv';
import fs from 'fs';
import path from 'path';

import { BitBadgesAPI } from 'bitbadgesjs-sdk';

env.config();

interface AssetRegistryAsset {
  base: string;
  symbol: string;
  exponent: string;
  logo?: string;
  type_asset?: string;
}

interface AssetRegistry {
  assets: AssetRegistryAsset[];
}

interface BitBadgesChainConfig {
  chain_name: string;
  registry_name: string;
  api: Array<{ provider: string; address: string }>;
  rpc: Array<{ provider: string; address: string }>;
  sdk_version: string;
  coin_type: string;
  min_tx_fee: string;
  addr_prefix: string;
  logo: string;
  assets: AssetRegistryAsset[];
}

const api = new BitBadgesAPI({
  apiKey: process.env.BITBADGES_API_KEY,
  convertFunction: BigInt,
});

export async function generateExplorerAssetRegistry() {
  try {
    console.log('Starting asset registry generation...');

    // Get status to know the next collection ID
    const statusResponse = await api.getStatus();
    if (!statusResponse) {
      throw new Error('Status not found');
    }

    console.log(`Next collection ID: ${statusResponse.status.nextCollectionId}`);

    const assets: AssetRegistryAsset[] = [];

    // Iterate through all collections
    for (let i = 1; i < statusResponse.status.nextCollectionId; i++) {
      const collectionId = i.toString();
      console.log(`Processing collection ${collectionId}...`);
      let collectionRes: GetCollectionSuccessResponse<bigint> | undefined;
      try {
        collectionRes = await api.getCollection(collectionId, {
          includeCosmosCoinWrapperPaths: true,
        });
        if (!collectionRes) {
          console.log(`Collection ${collectionId} not found, skipping...`);
          continue;
        }
      } catch (e) {
        console.log(`Collection ${collectionId} not found, skipping...`);
        continue;
      }

      const collection = collectionRes.collection;

      // Check if collection has cosmosCoinWrapperPaths
      if (!collection.cosmosCoinWrapperPaths || collection.cosmosCoinWrapperPaths.length === 0) {
        console.log(`Collection ${collectionId} has no cosmosCoinWrapperPaths, skipping...`);
        continue;
      }

      console.log(
        `Collection ${collectionId} has ${collection.cosmosCoinWrapperPaths.length} cosmos coin wrapper paths`
      );

      // Process each cosmosCoinWrapperPath
      for (const wrapperPath of collection.cosmosCoinWrapperPaths) {
        const path = wrapperPath;
        const { denomUnits, denom, symbol, metadata } = path;

        const fullBaseDenom = `badges:${collectionId}:${denom}`;

        const allDenomUnits: (iDenomUnit<bigint> & { denom: string; metadata: iMetadata<bigint> })[] = [
          {
            denom: fullBaseDenom,
            symbol,
            decimals: BigInt(0),
            isDefaultDisplay: denomUnits.every((unit) => !unit.isDefaultDisplay),
            metadata: metadata || { name: '', description: '', image: '' },
          },
          ...denomUnits.map((unit) => ({
            ...unit,
            denom: unit.symbol,
            metadata: unit.metadata || { name: '', description: '', image: '' },
          })),
        ];

        // Get the display denom unit (usually the one with decimals > 0)
        const displayUnit = allDenomUnits.find((unit) => unit.isDefaultDisplay) || allDenomUnits[0];

        const asset: AssetRegistryAsset = {
          base: fullBaseDenom,
          symbol: displayUnit.symbol,
          exponent: displayUnit.decimals.toString(),
          logo: displayUnit.metadata.image || '',
          type_asset: 'sdk.coin',
        };

        assets.push(asset);
      }
    }

    // Create the asset registry JSON
    const assetRegistry: AssetRegistry = {
      assets: assets,
    };

    // Write to assets.json file in the bitbadges-asset-registry folder
    const outputDir = path.join(process.cwd(), '..', 'bitbadges-asset-registry');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'assets.json');
    fs.writeFileSync(outputPath, JSON.stringify(assetRegistry, null, 2));

    console.log(`Generated asset registry with ${assets.length} assets`);
    console.log(`Output written to: ${outputPath}`);

    // Update bitbadges.json file
    await updateBitBadgesJson(assets);

    // Pretty print the JSON to console
    console.log('\n=== GENERATED ASSETS.JSON ===');
    console.log(JSON.stringify(assetRegistry, null, 2));
    console.log('=== END GENERATED ASSETS.JSON ===\n');

    return assetRegistry;
  } catch (error) {
    console.error('Error generating asset registry:', error);
    throw error;
  }
}

async function updateBitBadgesJson(newAssets: AssetRegistryAsset[]) {
  try {
    const bitbadgesJsonPath = path.join(process.cwd(), 'chains', 'mainnet', 'bitbadges.json');

    // Read existing bitbadges.json
    const existingConfig: BitBadgesChainConfig = JSON.parse(fs.readFileSync(bitbadgesJsonPath, 'utf8'));

    // Create a map of existing assets by base for quick lookup
    const existingAssetsMap = new Map<string, AssetRegistryAsset>();
    existingConfig.assets.forEach((asset) => {
      existingAssetsMap.set(asset.base, asset);
    });

    // Merge new assets with existing ones, replacing when base matches
    newAssets.forEach((newAsset) => {
      existingAssetsMap.set(newAsset.base, newAsset);
    });

    // Convert back to array and sort by base for consistency
    const mergedAssets = Array.from(existingAssetsMap.values()).sort((a, b) => a.base.localeCompare(b.base));

    // Update the config
    existingConfig.assets = mergedAssets;

    // Write back to file
    fs.writeFileSync(bitbadgesJsonPath, JSON.stringify(existingConfig, null, 2));

    console.log(`Updated bitbadges.json with ${mergedAssets.length} total assets (${newAssets.length} new/updated)`);
    console.log(`Updated file: ${bitbadgesJsonPath}`);
  } catch (error) {
    console.error('Error updating bitbadges.json:', error);
    throw error;
  }
}

// Main execution
(async () => {
  if (process.env.BENCHMARK_MODE !== 'true') {
    await generateExplorerAssetRegistry();
  }
})().catch(console.error);
