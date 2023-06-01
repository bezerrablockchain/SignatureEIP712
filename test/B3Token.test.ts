import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';

import type { SignatureVer } from '../typechain-types/contracts/SignatureVer';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('SignatureVer', () => {
  let signatureVer: SignatureVer;
  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;

  beforeEach(async () => {
    [signer1, signer2] = await ethers.getSigners();

    // #SignatureVer Deploy
    const signatureVerFactory = await ethers.getContractFactory('SignatureVer', signer1);
    signatureVer = await signatureVerFactory.deploy();
    await signatureVer.deployed();

    expect(signatureVer.address).to.properAddress;
  });

  describe('Signature tests', () => {
    it('should sign a message and get signer address back', async () => {
      const SIGNING_DOMAIN = "NOME-DO-APP"; // # Same as defined on smart contract
      const SIGNATURE_VERSION = "v1.0.0";   // # Same as defined on smart contract

        const chainId = await signatureVer.getChainID();
        const message = 'Hello World';
        const price = 100;
        const write = [1, 2, 3];
        const message2 = 'Hello World 2';

        const structToBeSignedValues = {
          message,
          price,
          write,
          message2,
        };
        // console.log('structToBeSignedValues:', structToBeSignedValues);

        const domain = {
          name: SIGNING_DOMAIN,
          version: SIGNATURE_VERSION,
          chainId: chainId,
          verifyingContract: signatureVer.address,
        };
        // console.log('domain:', domain);

        const types = {
          StructToBeSigned: [ // # Same name as structToBeSignedValues on smart contract
            { name: 'message', type: 'string' },
            { name: 'price', type: 'uint256' },
            { name: 'write', type: 'uint8[]' },
            { name: 'message2', type: 'string' },
          ],
        };
        // console.log('types:', types);

        // # Sign
        const signature = await signer1._signTypedData(domain, types, structToBeSignedValues);
        const signature2 = await signer2._signTypedData(domain, types, structToBeSignedValues);

        // # Verify
        const addressBack = await signatureVer.validate(structToBeSignedValues, signature);
        const addressBack2 = await signatureVer.validate(structToBeSignedValues, signature2);

        // # Print
        console.log('signer1    :', signer1.address);
        console.log('addressBack:', addressBack);
        console.log('signer2    :', signer2.address);
        console.log('addressBack2:', addressBack2);

        // # Assert
        expect(addressBack).to.equal(signer1.address);
        expect(addressBack2).to.equal(signer2.address);
    });
  });
});
