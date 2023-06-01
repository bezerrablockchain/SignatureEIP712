// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "hardhat/console.sol";

contract SignatureVer is EIP712{
    string private constant SIGNING_DOMAIN = "NOME-DO-APP";
    string private constant SIGNATURE_VERSION = "v1.0.0";

    struct StructToBeSigned {
        string message;
        uint256 price;
        uint8[] write;
        string message2;
    }
    bytes32 private constant _TYPEHASH = keccak256(
        "StructToBeSigned(string message,uint256 price,uint8[] write,string message2)" // #Same as StructToBeSigned but like a signature
    ); 

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {

    }

    function validate(StructToBeSigned calldata sig, bytes calldata ethSignature) view public returns (address) {
        return _verify(sig, ethSignature);
    }

    function _verify(StructToBeSigned calldata sig, bytes calldata ethSignature)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(sig);
        return ECDSA.recover(digest, ethSignature);
    }

    function _hash(StructToBeSigned calldata sig)
        internal
        view
        returns (bytes32)
    {
        // console.log("%s", sig.message);
        // console.log("%d %d", sig.write[0], sig.write[1]);
        // console.log("%s", sig.message2);

        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        _TYPEHASH,
                        keccak256(bytes(sig.message)),
                        sig.price,
                        keccak256(abi.encodePacked(sig.write)),
                        keccak256(bytes(sig.message2))
                    )
                )
            );
    }

    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }
    function getBlockChainID() external view returns (uint256) {
        return block.chainid;
    }
}