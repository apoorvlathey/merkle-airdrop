import { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Spacer,
  VStack,
  HStack,
  Center,
  Box,
  Text,
} from "@chakra-ui/react";
import ConnectWallet from "./components/ConnectWallet";
import AirdropCard from "./components/AirdropCard";
import { Web3Provider, Signer, TokenAirdrop } from "./types";
import { ethers, Contract } from "ethers";
import { airdrops } from "./airdrops";

function App() {
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [signerAddress, setSignerAddress] = useState<string>();

  const [merkleContract, setMerkleContract] = useState<Contract>();

  const merkleABI = require("./abi/MerkleAirdropDistributor.json");
  const merkleAddress = "0x7CB93bC5396F23629D9Da2cCe686e82B07E2170d";

  const [signerAirdrops, setSignerAirdrops] = useState<TokenAirdrop[]>([]);

  useEffect(() => {
    if (provider) {
      setMerkleContract(
        new ethers.Contract(merkleAddress, merkleABI, provider)
      );

      setSigner(provider.getSigner(0));
    }
  }, [provider]);

  // Get signer address
  useEffect(() => {
    const getSignerAddress = async () => {
      if (signer) {
        setSignerAddress(await signer.getAddress());
      }
    };

    getSignerAddress();
  }, [signer]);

  useEffect(() => {
    if (merkleContract && signerAddress) {
      fetchAirdropsForSigner();
    }
  }, [merkleContract, signerAddress]);

  const fetchAirdropsForSigner = async () => {
    let _signerAirdrops: TokenAirdrop[] = [];
    for (var i = 0; i < airdrops.length; i++) {
      // check if user exists in the merkle tree
      if (airdrops[i].userData[signerAddress!.toLowerCase()]) {
        // check if airdrop already claimed or not
        const isAirdropClaimed = await merkleContract!.isAirdropClaimed(
          signerAddress,
          airdrops[i].airdropIndex
        );

        if (!isAirdropClaimed) {
          _signerAirdrops.push(airdrops[i]);
        }
      }
    }

    setSignerAirdrops(_signerAirdrops);
  };

  return (
    <Box>
      <Flex
        py="4"
        px={["2", "4", "10", "10"]}
        borderBottom="2px"
        borderBottomColor="gray.500"
      >
        <Spacer flex="1" />
        <Heading maxW={["302px", "4xl", "4xl", "4xl"]}>Claim Airdrops</Heading>
        <Spacer flex="1" />
      </Flex>
      <Center>
        <Box mt="5rem">
          {!signerAddress ? (
            <ConnectWallet setProvider={setProvider} />
          ) : (
            <VStack>
              <HStack>
                <Text>Your Address: </Text>
                <Text fontWeight="semibold">{signerAddress}</Text>
              </HStack>
              <Heading pt="1rem" fontSize="xl">
                Airdrops Available ⬇️
              </Heading>
              <Box pt="3rem">
                {signerAirdrops?.map((airdrop, i) => (
                  <AirdropCard
                    key={i}
                    airdropIndex={airdrop.airdropIndex}
                    tokenSymbol={airdrop.tokenSymbol}
                    tokenImg={airdrop.tokenImg}
                    totalTokensToAirdropInWei={
                      airdrop.totalTokensToAirdropInWei
                    }
                    userData={airdrop.userData[signerAddress.toLowerCase()]}
                    onClickClaim={async () => {
                      try {
                        await merkleContract
                          ?.connect(signer!)
                          .claim(
                            airdrop.airdropIndex,
                            signerAddress,
                            airdrop.userData[signerAddress.toLowerCase()]
                              .airdropAmountInWei,
                            airdrop.userData[signerAddress.toLowerCase()].proof
                          );
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  />
                ))}
              </Box>
            </VStack>
          )}
        </Box>
      </Center>
    </Box>
  );
}

export default App;
