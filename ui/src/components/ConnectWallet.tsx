import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Torus from "@toruslabs/torus-embed";
import { ethers } from "ethers";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { setProvider } from "../types";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID, // required
    },
  },
  portis: {
    package: Portis, // required
    options: {
      id: process.env.REACT_APP_PORTIS_ID, // required
    },
  },
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: process.env.REACT_APP_FORTMATIC_KEY, // required
    },
  },
  torus: {
    package: Torus, // required
  },
};
const web3Modal = new Web3Modal({
  network: "rinkeby", // optional
  cacheProvider: false, // optional
  providerOptions, // required
});

export const targetNetwork = { name: "Rinkeby Testnet", chainId: 4 };

const connectWallet = async (
  setLocalProvider: setProvider,
  openModal: any,
  setProviderIsFinal: any
) => {
  const provider = new ethers.providers.Web3Provider(await web3Modal.connect());

  const chainId = await (await provider.getNetwork()).chainId;
  if (chainId !== targetNetwork.chainId) {
    openModal();
    setLocalProvider(provider);
  } else {
    setLocalProvider(provider);
    setProviderIsFinal(true);
  }
};

const ConnectWallet = ({
  setProvider,
  ...props
}: {
  setProvider: setProvider;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localProvider, setLocalProvider] = useState<any>();
  const [providerIsFinal, setProviderIsFinal] = useState(false);

  const switchNetwork = () => {
    const params = {
      chainId: ethers.utils.hexValue(targetNetwork.chainId),
    };

    localProvider
      .send("wallet_switchEthereumChain", [params])
      .then(async () => {
        // ethers providers are immutable so need to instantiate a new one
        setLocalProvider(
          new ethers.providers.Web3Provider(await web3Modal.connect())
        );
        setProviderIsFinal(true);
      })
      .catch((error: any) => console.log(error));
  };

  useEffect(() => {
    if (providerIsFinal) {
      setProvider(localProvider);
    }
  }, [providerIsFinal]);

  return (
    <>
      <Button
        onClick={() =>
          connectWallet(setLocalProvider, onOpen, setProviderIsFinal)
        }
        {...props}
      >
        Connect Wallet
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Incorrect Network</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Press OK to switch to {targetNetwork.name} & use this DApp
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => switchNetwork()}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConnectWallet;
