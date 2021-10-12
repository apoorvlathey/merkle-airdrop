# hardhat-boilerplate

Quickly setup your next project! This boilerplate includes:

- typechain
- hardhat-deploy
- etherscan-verify
- openzeppelin contracts
- waffle
- hardhat-tracer
- mocha
- chai

## Setup

`yarn install`

## Scripts

1. Compile contracts and create their Typescript bindings.

   `yarn compile`

2. Run tests (Note: Forking is enabled by default to Polygon Mainnet. Refer `.env.example` and create `.env` with required variables)

   `yarn test`

3. Deploy to local hardhat node

   `yarn deploy:default`  
   Note: If you want to force deploy again, add `--reset` flag

4. Deploy to Polygon Mainnet

   `yarn deploy:polygon`

5. Verify deployed contracts on Etherscan (Polygonscan)

   `yarn etherscan-verify:polygon`
