// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "cryptocert/ethereum-erc20-contracts/src/contracts/token.sol";

/**
 * @dev This is an implementation of the erc20 token smart contract.
 */
contract TokenCustom is
  Token
{
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _supply,
    uint8 _decimals,
    address _owner
  )
  {
    tokenName = _name;
    tokenSymbol = _symbol;
    tokenDecimals = _decimals;
    tokenTotalSupply = _supply;
    balances[_owner] = tokenTotalSupply;
    emit Transfer(address(0), _owner, tokenTotalSupply);
  }
}
