import {
  Flex,
  VStack,
  HStack,
  Center,
  Box,
  Text,
  Image,
  Button,
} from "@chakra-ui/react";
import { formatEther } from "@ethersproject/units";
import { UserData } from "../types";

interface AirdropCardProps {
  airdropIndex: number;
  tokenSymbol: string;
  tokenImg: string;
  totalTokensToAirdropInWei: string;
  userData: UserData[string];
  onClickClaim: Function;
}

function AirdropCard({
  airdropIndex,
  tokenSymbol,
  tokenImg,
  totalTokensToAirdropInWei,
  userData,
  onClickClaim,
}: AirdropCardProps) {
  return (
    <VStack
      border="1px solid black"
      minW="40rem"
      px="1rem"
      py="1rem"
      rounded="lg"
    >
      <HStack w="100%">
        <Flex flex="1" justifyContent="flex-start">
          <HStack>
            <Image src={tokenImg} h="1.3rem" w="1.3rem" rounded="full" />
            <Text>{tokenSymbol}</Text>
          </HStack>
        </Flex>
        <Box>
          Total Airdrop: {formatEther(totalTokensToAirdropInWei)} {tokenSymbol}
        </Box>
        <Flex flex="1" justifyContent="flex-end">
          Your Share:{" "}
          {(
            (parseFloat(userData.airdropAmount) * 100) /
            parseFloat(formatEther(totalTokensToAirdropInWei))
          ).toFixed(4)}
          %
        </Flex>
      </HStack>
      <Center pt="1rem">
        <Button onClick={() => onClickClaim()}>
          Claim {userData.airdropAmount} {tokenSymbol}
        </Button>
      </Center>
    </VStack>
  );
}

export default AirdropCard;
