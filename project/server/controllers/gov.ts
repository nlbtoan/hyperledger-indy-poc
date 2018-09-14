import Government from '../models/gov';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

import indy = require('indy-sdk');
import assert = require('assert');
import mkdirp = require('mkdirp');
import fs = require('fs');
import os = require('os');

export default class govCtrl extends BaseCtrl {
  model = Government;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  }

  // Step: 5
  // URL: /api/gettingPrescription
  // {
  //   "name":"resident22",
  //   "residentWalletName": "residentWallet22",
  //   "poolHandle": 2,
  //   "poolName": "indy22",
  //   "doctorWallet": 13,
  //   "doctorDid": "BMkm2SzCDifFVFWGu9PEGY",
  //   "doctorPrescriptionCredDefId": "BMkm2SzCDifFVFWGu9PEGY:3:CL:810",
  //   "bankWallet": 21,
  //   "prescriptionCredValues": {
  //         "resident_first_name": { "raw": "resident", "encoded": "1139481716457488690172217916278103335" },
  //         "resident_last_name": { "raw": "Garcia", "encoded": "5321642780241790123587902456789123452" },
  //         "doctor_name": { "raw": "Dr . James Hold", "encoded": "12434523576212321" },
  //         "status": { "raw": "Cancer", "encoded": "2213454313412354" },
  //         "dob": { "raw": "12-05-1949", "encoded": "3124141231422543541" },
  //         "link": { "raw": "2015", "encoded": "2015" },
  //         "pdf_hash": { "raw": "1997", "encoded": "1997" },
  //         "isCreated": { "raw": "1", "encoded": "1" }
  //     }
  // }
  gettingIdCard = async (req, res) => {
    let poolHandle = req.body.poolHandle;
    let governmentWallet = req.body.governmentWallet;
    let governmentDid = req.body.governmentDid;
    let bankWallet = req.body.bankWallet;
    let residentWalletConfig = { 'id': req.body.residentWalletName };
    let residentWalletCredentials = { 'key': req.body.name + '_key' };
    let residentWallet, governmentResidentKey, residentGovernmentDid, residentGovernmentKey, governmentResidentConnectionResponse;

    try {
      [residentWallet, governmentResidentKey, residentGovernmentDid, residentGovernmentKey, governmentResidentConnectionResponse] = await this.onboarding(poolHandle, "Government", governmentWallet, governmentDid, "Personal", null, residentWalletConfig, residentWalletCredentials);
      let idCardCredOfferJson = await indy.issuerCreateCredentialOffer(governmentWallet, req.body.governmentIdCardCredDefId);
      let residentGovernmentVerkey = await indy.keyForDid(poolHandle, bankWallet, governmentResidentConnectionResponse['did']);
      let authcryptedIdCardCredOffer = await indy.cryptoAuthCrypt(governmentWallet, governmentResidentKey, residentGovernmentVerkey, Buffer.from(JSON.stringify(idCardCredOfferJson), 'utf8'));
      let [governmentResidentVerkey, authdecryptedIdCardCredOfferJson, authdecryptedIdCardCredOffer] = await this.authDecrypt(residentWallet, residentGovernmentKey, authcryptedIdCardCredOffer);
      let residentMasterSecretId = await indy.proverCreateMasterSecret(residentWallet, null);
      let governmentIdCardCredDef;
      [req.body.governmentIdCardCredDefId, governmentIdCardCredDef] = await this.getCredDef(poolHandle, residentGovernmentDid, authdecryptedIdCardCredOffer['cred_def_id']);
      let [idCardCredRequestJson, idCardCredRequestMetadataJson] = await indy.proverCreateCredentialReq(residentWallet, residentGovernmentDid, authdecryptedIdCardCredOfferJson, governmentIdCardCredDef, residentMasterSecretId);
      let authcryptedIdCardCredRequest = await indy.cryptoAuthCrypt(residentWallet, residentGovernmentKey, governmentResidentVerkey, Buffer.from(JSON.stringify(idCardCredRequestJson), 'utf8'));

      let authdecryptedIdCardCredRequestJson;
      [residentGovernmentVerkey, authdecryptedIdCardCredRequestJson] = await this.authDecrypt(governmentWallet, governmentResidentKey, authcryptedIdCardCredRequest);
      let idCardCredValues = req.body.idCardCredValues;
      let [idCardCredJson] = await indy.issuerCreateCredential(governmentWallet, idCardCredOfferJson, authdecryptedIdCardCredRequestJson, idCardCredValues, null, -1);
      let authcryptedidCardCredJson = await indy.cryptoAuthCrypt(governmentWallet, governmentResidentKey, residentGovernmentVerkey, Buffer.from(JSON.stringify(idCardCredJson), 'utf8'));
      let [, authdecryptedidCardCredJson] = await this.authDecrypt(residentWallet, residentGovernmentKey, authcryptedidCardCredJson);
      await indy.proverStoreCredential(residentWallet, null, idCardCredRequestMetadataJson,
        authdecryptedidCardCredJson, governmentIdCardCredDef, null);
        
      res.status(200).json({
        residentWallet: residentWallet,
        residentWalletCredentials: residentWalletCredentials,
        governmentResidentKey: governmentResidentKey,
        residentGovernmentDid: residentGovernmentDid,
        residentGovernmentKey: residentGovernmentKey,
        governmentResidentConnectionResponse: governmentResidentConnectionResponse,
        idCardCredOfferJson: idCardCredOfferJson,
        residentgovernmentVerkey: residentGovernmentVerkey,
        governmentResidentVerkey: governmentResidentVerkey,
        authdecryptedidCardCredOffer: authdecryptedIdCardCredOffer,
        residentMasterSecretId: residentMasterSecretId,
        governmentidCardCredDef: governmentIdCardCredDef,
        idCardCredRequestJson: idCardCredRequestJson,
        idCardCredRequestMetadataJson: idCardCredRequestMetadataJson,
        idCardCredValues: idCardCredValues,
        idCardCredJson: idCardCredJson
      });
    } catch (error) {
      console.log(error);
      try {
        //Close and delete wallet
        if (residentWallet) {
          await indy.closeWallet(residentWallet);
          await indy.deleteWallet(residentWalletConfig, residentWalletCredentials);
        }
        res.sendStatus(403);
      } catch (e) {
        console.log(e);
        res.sendStatus(403);
      }
    }
  }

  // Step: 4
  // URL: /api/setupCredentialDefinition
  // Body:
  // {
  //   "poolHandle": 2,
  //   "doctorDid": "BMkm2SzCDifFVFWGu9PEGY",
  //   "doctorWallet": 13,
  //   "idCardSchemaId": "UAyYVcKCQuNKGCztZUn3WX:2:IdCard:1.2",
  //   "idCardSchema": {
  //     "ver": "1.0",
  //     "id": "UAyYVcKCQuNKGCztZUn3WX:2:IdCard:1.2",
  //     "name": "IdCard",
  //     "version": "1.2",
  //     "attrNames": [
  //         "doctor_name",
  //         "patient_last_name",
  //         "dob",
  //         "status",
  //         "pdf_hash",
  //         "link",
  //         "isCreated",
  //         "patient_first_name"
  //     ],
  //     "seqNo": null
  //   }
  // }
  setupCredentialDefinition = async (req, res) => {
    try {
      let poolHandle = req.body.poolHandle;
      let governmentWallet = req.body.governmentWallet;
      let governmentDid = req.body.governmentDid;

      [, req.body.idCardSchema] = await this.getSchema(poolHandle, governmentDid, req.body.idCardSchemaId);

      let [governmentIdCardCredDefId, governmentIdCardCredDefJson] = await indy.issuerCreateAndStoreCredentialDef(governmentWallet, governmentDid, req.body.idCardSchema, 'TAG1', 'CL', '{"support_revocation": false}');
      await this.sendCredDef(poolHandle, governmentWallet, governmentDid, governmentIdCardCredDefJson);

      res.status(200).json({
        governmentIdCardCredDefId: governmentIdCardCredDefId,
        governmentIdCardCredDefJson: governmentIdCardCredDefJson
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(403);
    }
  }

  // Function for create stuff
  onboarding = async function (poolHandle, From, fromWallet, fromDid, to, toWallet, toWalletConfig, toWalletCredentials) {
    let [fromToDid, fromToKey] = await indy.createAndStoreMyDid(fromWallet, {});
    await this.sendNym(poolHandle, fromWallet, fromDid, fromToDid, fromToKey, null);

    let connectionRequest = {
      did: fromToDid,
      nonce: 123456789
    };

    if (!toWallet) {
      try {
        await indy.createWallet(toWalletConfig, toWalletCredentials)
      } catch (e) {
        if (e.message !== "WalletAlreadyExistsError") {
          throw e;
        }
      }
      toWallet = await indy.openWallet(toWalletConfig, toWalletCredentials);
    }

    let [toFromDid, toFromKey] = await indy.createAndStoreMyDid(toWallet, {});
    let fromToVerkey = await indy.keyForDid(poolHandle, toWallet, connectionRequest.did);
    let connectionResponse = JSON.stringify({
      'did': toFromDid,
      'verkey': toFromKey,
      'nonce': connectionRequest['nonce']
    });

    let anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(fromToVerkey, Buffer.from(connectionResponse, 'utf8'));
    let decryptedConnectionResponse = JSON.parse(Buffer.from(await indy.cryptoAnonDecrypt(fromWallet, fromToKey, anoncryptedConnectionResponse)).toString());
    if (connectionRequest['nonce'] !== decryptedConnectionResponse['nonce']) {
      throw Error("nonces don't match!");
    }

    await this.sendNym(poolHandle, fromWallet, fromDid, decryptedConnectionResponse['did'], decryptedConnectionResponse['verkey'], null);

    return [toWallet, fromToKey, toFromDid, toFromKey, decryptedConnectionResponse];
  }

  toJson = function (val) {
    if (val === null || val === void 0) {
      return null
    }
    if (typeof val === 'string') {
      return val
    }
    return JSON.stringify(val)
  }

  sendNym = async function (poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
  }

  authDecrypt = async function (walletHandle, key, message) {
    let [fromVerkey, decryptedMessageJsonBuffer] = await indy.cryptoAuthDecrypt(walletHandle, key, message);
    let decryptedMessage = JSON.parse(decryptedMessageJsonBuffer);
    let decryptedMessageJson = JSON.stringify(decryptedMessage);
    return [fromVerkey, decryptedMessageJson, decryptedMessage];
  }

  getCredDef = async function (poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    return await indy.parseGetCredDefResponse(getCredDefResponse);
  }

  getSchema = async function (poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
  }

  sendCredDef = async function (poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
  }
}
