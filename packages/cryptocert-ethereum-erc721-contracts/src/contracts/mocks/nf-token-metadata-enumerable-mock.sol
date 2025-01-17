// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../nf-token-metadata-enumerable.sol";
import "cryptocert/ethereum-utils-contracts/src/contracts/permission/claimable.sol";

/**
 * @dev This is an example contract implementation of NFToken with enumerable and metadata
 * extensions.
 */
contract NFTokenMetadataEnumerableMock is
  NFTokenMetadataEnumerable,
  Claimable
{

  /**
   * @dev Contract constructor.
   * @param _name A descriptive name for a collection of NFTs.
   * @param _symbol An abbreviated name for NFTokens.
   * @param _uriPrefix Prefix of URI for token metadata URIs.
   * @param _uriPostfix Postfix of URI for token metadata URIs.
   */
  constructor(
    string memory _name,
    string memory _symbol,
    string memory _uriPrefix,
    string memory _uriPostfix
  )
  {
    nftName = _name;
    nftSymbol = _symbol;
    uriPrefix = _uriPrefix;
    uriPostfix = _uriPostfix;
  }

  /**
   * @dev Creates a new NFT.
   * @param _to The address that will own the created NFT.
   * @param _tokenId of the NFT to be created by the msg.sender.
   */
  function create(
    address _to,
    uint256 _tokenId
  )
    external
    onlyOwner
  {
    super._create(_to, _tokenId);
  }

  /**
   * @dev Change URI.
   * @param _uriPrefix New uriPrefix.
   * @param _uriPostfix New uriPostfix.
   */
  function setUri(
    string calldata _uriPrefix,
    string calldata _uriPostfix
  )
    external
    onlyOwner
  {
    super._setUri(_uriPrefix, _uriPostfix);
  }

}
