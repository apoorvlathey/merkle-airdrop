import { Dispatch, SetStateAction } from "react";
import { ethers, Signer as SignerAlias } from "ethers";

export type Web3Provider = ethers.providers.Web3Provider | undefined;

export type setProvider = Dispatch<SetStateAction<Web3Provider>>;

export type Signer = SignerAlias;

export interface TokenAirdrop {
  root: string;
  airdropIndex: number;
  token: string;
  tokenSymbol: string;
  tokenImg: string;
  totalTokensToAirdropInWei: string;
  userData: UserData;
}

export interface UserData {
  [user: string]: {
    airdropAmountInWei: string;
    airdropAmount: string;
    proof: string[];
  };
}
