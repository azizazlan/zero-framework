// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "cryptocert/ethereum-xcert-contracts/src/contracts/ixcert-mutable.sol";
import "cryptocert/ethereum-utils-contracts/src/contracts/permission/abilitable.sol";

/**
 * @title XcertUpdateProxy - updates a token on behalf of contracts that have been approved via
 * decentralized governance.
 * @notice There is a possibility of unintentional behavior when token imprint can be overwritten
 * if more than one claim is active. Be aware of this when implementing.
 */
contract XcertUpdateProxy is
  Abilitable
{

  /**
   * @dev List of abilities:
   * 16 - Ability to execute create.
   */
  uint8 constant ABILITY_TO_EXECUTE = 16;

  /**
   * @dev Updates imprint of an existing Xcert.
   * @param _xcert Address of the Xcert contract on which the update will be performed.
   * @param _id The Xcert we will update.
   * @param _tokenURIIntegrityDigest Cryptographic asset URI integrity digest.
   */
  function update(
    address _xcert,
    uint256 _id,
    bytes32 _tokenURIIntegrityDigest
  )
    external
    hasAbilities(ABILITY_TO_EXECUTE)
  {
    XcertMutable(_xcert).updateTokenURIIntegrityDigest(_id, _tokenURIIntegrityDigest);
  }

}
