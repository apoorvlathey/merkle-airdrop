// SPDX-License-Identifier: MIT
pragma solidity =0.8.7;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAirdropDistributor is Ownable {
    using SafeERC20 for IERC20;

    bool isPaused;

    struct AirdropMetadata {
        address token;
        bytes32 root;
        string dataIPFSHash;
    }

    AirdropMetadata[] public airdropMetadata;

    // user -> airdropMetadata index -> if user claimed airdrop
    mapping(address => mapping(uint256 => bool)) public isAirdropClaimed;

    event NewAirdrop(address indexed token, uint256 index);
    event AirdropClaimed(address indexed user, address indexed token, uint256 amount);

    modifier whenNotPaused {
        require(!isPaused, "Paused");
        _;
    }

    // --- External Mutative ---

    function claim(
        uint256 _airdropIndex,
        address _user,
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) external whenNotPaused {
        require(!isAirdropClaimed[_user][_airdropIndex], "Airdrop already claimed");
        address _token = airdropMetadata[_airdropIndex].token;

        require(
            isPartOfMerkleTree(
                _airdropIndex,
                _user,
                _amount,
                _merkleProof
            ),
            "Merkle verification failed"
        );

        isAirdropClaimed[_user][_airdropIndex] = true;

        IERC20(_token).safeTransfer(_user, _amount);

        emit AirdropClaimed(_user, _token, _amount);
    }

    // --- External View ---
    function AirdropsCount() external view returns (uint256) {
        return airdropMetadata.length;
    }

    function isPartOfMerkleTree(
        uint256 _airdropIndex,
        address _user,
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) public view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(_airdropIndex, airdropMetadata[_airdropIndex].token, _user, _amount));
        return MerkleProof.verify(_merkleProof, airdropMetadata[_airdropIndex].root, node);
    }

    // --- Admin ---
    function addAirdrop(AirdropMetadata memory _metadata) external onlyOwner {
        airdropMetadata.push(_metadata);

        emit NewAirdrop(_metadata.token, airdropMetadata.length - 1);
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }
}
