import { ethers, network, waffle } from "hardhat";
import { parseEther } from "@ethersproject/units";
import keccak256 from "keccak256";
import { AddressZero, MaxUint256, HashZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { solidity } from "ethereum-waffle";
import chai from "chai";

import { MerkleTree } from "merkletreejs";

chai.use(solidity);
const { expect } = chai;
const { deployContract } = waffle;

// artifacts
import MerkleAirdropDistributorArtifact from "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json";
import MockERC20Artifact from "../artifacts/contracts/mock/MockERC20.sol/MockERC20.json";

// types
import { MerkleAirdropDistributor, IERC20 } from "../typechain";

const getNodeLeaf = (
  _airdropIndex: number,
  _token: string,
  _user: string,
  _amount: string
) => {
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(
        ["uint256", "address", "address", "uint256"],
        [_airdropIndex, _token, _user, _amount]
      )
      .slice(2),
    "hex"
  );
};

describe("MerkleAirdropDistributor", () => {
  let merkleAirdrop: MerkleAirdropDistributor;
  let airdropTokens: IERC20[] = [];

  let deployer: SignerWithAddress;
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;

  let snapshotData: { [address: string]: string }[] = [];
  let merkleTrees: MerkleTree[] = [];

  before(async () => {
    [deployer, user0, user1] = await ethers.getSigners();

    // deploy contracts
    merkleAirdrop = (await deployContract(
      deployer,
      MerkleAirdropDistributorArtifact
    )) as MerkleAirdropDistributor;

    // create airdrop tokens and send all to merkleAirdrop
    airdropTokens[0] = (await deployContract(deployer, MockERC20Artifact, [
      merkleAirdrop.address,
    ])) as IERC20;
    airdropTokens[1] = (await deployContract(deployer, MockERC20Artifact, [
      merkleAirdrop.address,
    ])) as IERC20;

    // create merkle metadata
    snapshotData[0] = {
      [user0.address]: parseEther("100").toString(),
      [user1.address]: parseEther("200").toString(),
    };
    snapshotData[1] = {
      [user0.address]: parseEther("300").toString(),
      [user1.address]: parseEther("50").toString(),
    };

    for (var i = 0; i < snapshotData.length; i++) {
      merkleTrees.push(
        new MerkleTree(
          Object.entries(snapshotData[i]).map(([_token, _amount]) =>
            getNodeLeaf(i, airdropTokens[i].address, _token, _amount)
          ),
          keccak256,
          { sortPairs: true }
        )
      );
    }
  });

  describe("Claim Airdrops", () => {
    before(async () => {
      // add merkle metadata to contract
      for (var i = 0; i < merkleTrees.length; i++) {
        await merkleAirdrop.connect(deployer).addAirdrop({
          token: airdropTokens[i].address,
          root: merkleTrees[i].getHexRoot(),
          dataIPFSHash: "abcd",
        });
      }
    });

    context("Token0", () => {
      const airdropIndex = 0;

      it("should allow user0 to claim token0 airdrop", async () => {
        const _token = airdropTokens[airdropIndex];
        const _user = user0;
        const _userAddr = _user.address;
        const _amount = snapshotData[airdropIndex][_userAddr];

        const proof = merkleTrees[airdropIndex].getHexProof(
          getNodeLeaf(airdropIndex, _token.address, _userAddr, _amount)
        );

        const preBalance = await _token.balanceOf(_userAddr);
        await merkleAirdrop
          .connect(_user)
          .claim(airdropIndex, _userAddr, _amount, proof);
        const postBalance = await _token.balanceOf(_userAddr);

        expect(postBalance.sub(preBalance)).to.eq(_amount);
      });

      it("should allow user1 to claim token0 airdrop", async () => {
        const _token = airdropTokens[airdropIndex];
        const _user = user1;
        const _userAddr = _user.address;
        const _amount = snapshotData[airdropIndex][_userAddr];

        const proof = merkleTrees[airdropIndex].getHexProof(
          getNodeLeaf(airdropIndex, _token.address, _userAddr, _amount)
        );

        const preBalance = await _token.balanceOf(_userAddr);
        await merkleAirdrop
          .connect(_user)
          .claim(airdropIndex, _userAddr, _amount, proof);
        const postBalance = await _token.balanceOf(_userAddr);

        expect(postBalance.sub(preBalance)).to.eq(_amount);
      });

      it("should prevent duplicate claim", async () => {
        const _token = airdropTokens[airdropIndex];
        const _user = user0;
        const _userAddr = _user.address;
        const _amount = snapshotData[airdropIndex][_userAddr];

        const proof = merkleTrees[airdropIndex].getHexProof(
          getNodeLeaf(airdropIndex, _token.address, _userAddr, _amount)
        );

        await expect(
          merkleAirdrop
            .connect(_user)
            .claim(airdropIndex, _userAddr, _amount, proof)
        ).to.revertedWith("Airdrop already claimed");
      });
    });

    context("Token1", () => {
      const airdropIndex = 1;

      it("should allow user0 to claim token0 airdrop", async () => {
        const _token = airdropTokens[airdropIndex];
        const _user = user0;
        const _userAddr = _user.address;
        const _amount = snapshotData[airdropIndex][_userAddr];

        const proof = merkleTrees[airdropIndex].getHexProof(
          getNodeLeaf(airdropIndex, _token.address, _userAddr, _amount)
        );

        const preBalance = await _token.balanceOf(_userAddr);
        await merkleAirdrop
          .connect(_user)
          .claim(airdropIndex, _userAddr, _amount, proof);
        const postBalance = await _token.balanceOf(_userAddr);

        expect(postBalance.sub(preBalance)).to.eq(_amount);
      });

      it("should allow user1 to claim token0 airdrop", async () => {
        const _token = airdropTokens[airdropIndex];
        const _user = user1;
        const _userAddr = _user.address;
        const _amount = snapshotData[airdropIndex][_userAddr];

        const proof = merkleTrees[airdropIndex].getHexProof(
          getNodeLeaf(airdropIndex, _token.address, _userAddr, _amount)
        );

        const preBalance = await _token.balanceOf(_userAddr);
        await merkleAirdrop
          .connect(_user)
          .claim(airdropIndex, _userAddr, _amount, proof);
        const postBalance = await _token.balanceOf(_userAddr);

        expect(postBalance.sub(preBalance)).to.eq(_amount);
      });
    });
  });
});
