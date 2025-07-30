<div align="center">

![Ping Wallet](./public/logo.svg)

<h1>Ping Dashboard</h1>

**Ping Dashboard is not only an explorer but also a wallet and more ... 🛠**

[![version](https://img.shields.io/github/tag/ping-pub/explorer.svg)](https://github.com/ping-pub/explorer/releases/latest)
[![GitHub](https://img.shields.io/github/license/ping-pub/explorer.svg)](https://github.com/ping-pub/explorer/blob/master/LICENSE)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=Follow%20%40ping_pub)](https://twitter.com/ping_pub)
[![https://discord.gg/CmjYVSr6GW](https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat)](https://discord.gg/CmjYVSr6GW)


</div>

`Ping Dashboard` is a light explorer for Cosmos-based Blockchains.  https://ping.pub .

## What sets Ping Dashboard apart from other explorers?
**Ping Dashboard** stands out by providing a real-time exploration of blockchain data without relying on caching or pre-processing. It exclusively fetches data from the Cosmos full node via LCD/RPC endpoints, ensuring a truly authentic experience. This approach is referred to as the "Light Explorer."

## Are you interested in listing your blockchain on https://ping.pub?

To make this repository clean, please submit your request to https://github.com/ping-pub/ping.pub.git


## Why does Ping Dashboard rely on official/trusted third-party public LCD/RPC servers?
There are two primary reasons for this choice:

 - Trust: In a decentralized system, it is crucial to avoid relying solely on a single entity. By utilizing official/trusted third-party public LCD/RPC servers, Ping Dashboard ensures that the data is sourced from a network of trusted participants.
 - Limited Resources: As Ping Dashboard plans to list hundreds of Cosmos-based blockchains in the future, it is impractical for the Ping team to operate validators or full nodes for all of them. Leveraging trusted third-party servers allows for more efficient resource allocation.

## Donation

Your donation will help us make better products. Thanks in advance.

 - Address for ERC20: USDC, USDT, ETH
```
0x88BFec573Dd3E4b7d2E6BfD4D0D6B11F843F8aa1
```

#### Donations from project

- Point Network: 1000USDC and $1000 worth of POINT
- Bitsong: 50k BTSG
- IRISnet: 100k IRIS

## Hire us

You can hire us by submitting an issue and fund the issue on [IssueHunter](https://issuehunt.io/r/ping-pub/explorer)


## Automated Registry Updates

This repository includes an automated system for updating the BitBadges registry assets:

### How it works:
1. **GitHub Actions Workflow**: The `.github/workflows/update-registry.yaml` workflow runs on every push to main
2. **Registry Generation**: The `scripts/generate-registry.ts` script fetches latest asset data from the BitBadges API
3. **Automatic PR Creation**: When changes are detected, a pull request is automatically created with the updated `chains/mainnet/bitbadges.json`

### Manual Execution:
```bash
# Run the registry generation script locally
yarn generate-registry

# Or with npm
npm run generate-registry
```

### Required Environment Variables:
- `BITBADGES_API_KEY`: Your BitBadges API key (set as GitHub secret for CI)

### CI/CD Process:
1. Push to main branch triggers the workflow
2. Script generates updated asset registry
3. If changes are detected, a PR is created automatically
4. PR includes all new/updated assets with proper metadata
5. Manual review and merge of the PR

## Contributors

Developers: @liangping @dingyiming

