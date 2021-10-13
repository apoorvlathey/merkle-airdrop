// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor(address receiver) ERC20("Mock", "MCK") {
    _mint(receiver, 1_000_000 * (10**decimals()));
  }
}