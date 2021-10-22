import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { ethers } from "ethers";
import { parseEther, formatEther } from "@ethersproject/units";
import BN from "bignumber.js";
import { saveToFile } from "./utils";

const _snapshot = require("./snapshots/1.json");
const snapshot: tokenBalanceSnapshot = _snapshot;

type tokenBalanceSnapshot = {
  wallet: string;
  balance: string;
  type?: string;
}[];

const getTotalSupply = () => {
  let totalSupply = new BN(0);

  for (var i = 0; i < snapshot.length; i++) {
    totalSupply = totalSupply.plus(new BN(snapshot[i].balance));
  }

  return totalSupply;
};

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

interface UserData {
  [user: string]: {
    airdropAmountInWei: string;
    airdropAmount: string;
    proof: string[];
  };
}

const main = () => {
  const airdropIndex = 3;
  const tokenAddress = "0x7eB344a90a09999515097adc049a629d769CD0b8";
  const tokenSymbol = "MOCK";
  const tokenImg = "/images/tokens/matic.png";
  const totalTokensToAirdrop = new BN(parseEther("100000").toString());

  const totalSupply = getTotalSupply();

  let userData: UserData = {};

  const merkleTree = new MerkleTree(
    snapshot.map((x) => {
      const user = x.wallet.toLowerCase();
      const airdropAmount = new BN(x.balance)
        .div(totalSupply)
        .multipliedBy(totalTokensToAirdrop);

      const leaf = getNodeLeaf(
        airdropIndex,
        tokenAddress,
        user,
        airdropAmount.toFixed()
      );

      userData[user] = {
        airdropAmountInWei: airdropAmount.toFixed(),
        airdropAmount: formatEther(airdropAmount.toFixed()).toString(),
        proof: [""], // empty for now, as would be calculated after merkle tree is generated
      };

      return leaf;
    }),
    keccak256,
    { sortPairs: true }
  );

  for (const user in userData) {
    userData[user].proof = merkleTree.getHexProof(
      getNodeLeaf(
        airdropIndex,
        tokenAddress,
        user,
        userData[user].airdropAmountInWei
      )
    );
  }

  let output: {
    root: string;
    airdropIndex: number;
    token: string;
    tokenSymbol: string;
    tokenImg: string;
    totalTokensToAirdropInWei: string;
    userData: UserData;
  } = {
    root: merkleTree.getHexRoot(),
    airdropIndex,
    token: tokenAddress,
    tokenSymbol,
    tokenImg,
    totalTokensToAirdropInWei: totalTokensToAirdrop.toFixed(),
    userData,
  };

  saveToFile(`${airdropIndex}_${tokenAddress}`, output);
};

main();
