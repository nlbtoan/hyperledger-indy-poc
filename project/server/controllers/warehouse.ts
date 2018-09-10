import WareHouse from '../models/warehouse';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

import indy = require('indy-sdk');
import assert = require('assert');
import mkdirp = require('mkdirp');
import fs = require('fs');
import os = require('os');

export default class wareHouseCtrl extends BaseCtrl {
  model = WareHouse;

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

  // Step: 3
  // URL: /api/createSchema
  // Body:
  // {
  //   "nursingHomeWallet": 5,
  //   "nursingHomeDid": "AFJZeQZk3utUA2kcbvK1Zd",
  //   "poolHandle": 2,
  //   "schema": ["patient_first_name", "patient_last_name", "doctor_name", "status", "dob", "link", "pdf_hash", "isCreated"]
  // }
  createSchema = async (req, res) => {
    try {
      let [prescriptionSchemaId, prescriptionSchema] = await indy.issuerCreateSchema(req.body.nursingHomeDid, 'Prescription', '1.2', req.body.schema);

      await this.sendSchema(req.body.poolHandle, req.body.nursingHomeWallet, req.body.nursingHomeDid, prescriptionSchema);
      res.status(200).json({
        prescriptionSchemaId: prescriptionSchemaId,
        prescriptionSchema: prescriptionSchema
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(403);
    }
  }

  // Step: 2
  // URL: /api/addTrustAnchor
  // Body:
  // {
  //   "name": "nursingHome22",
  //   "trustAnchorWalletName": "nursingHomeWallet22",
  //   "poolHandle": 2,
  //   "poolName": "indy22",
  //   "stewardWallet": 3,
  //   "stewardDid": "Th7MpTaRZVRYnPiabds81Y"
  // }
  addTrustAnchor = async (req, res) => {
    let poolHandle = req.body.poolHandle;
    let stewardWallet = req.body.stewardWallet;
    let stewardDid = req.body.stewardDid;
    let entityName = req.body.name;
    let trustAnchorWalletConfig = { 'id': req.body.trustAnchorWalletName };
    let trustAnchorWalletCredentials = { 'key': entityName + '_key' };
    let [trustAnchorWallet, stewardTrustAnchorKey, trustAnchorStewardDid, trustAnchorStewardKey] = await this.onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, entityName, null, trustAnchorWalletConfig, trustAnchorWalletCredentials);

    let trustAnchorDID = await this.getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid,
      stewardTrustAnchorKey, entityName, trustAnchorWallet, trustAnchorStewardDid,
      trustAnchorStewardKey, 'TRUST_ANCHOR');

    if (trustAnchorDID) {
      res.status(200).json({
        trustAnchorName: entityName,
        trustAnchorDID: trustAnchorDID,
        trustAnchorWallet: trustAnchorWallet,
        stewardTrustAnchorKey: stewardTrustAnchorKey,
        trustAnchorStewardDid: trustAnchorStewardDid,
        trustAnchorStewardKey: trustAnchorStewardKey
      });
    } else {
      res.sendStatus(403);
    }
  }

  // Step: 1
  // URL: /api/createPoolLedger
  // Body:
  // {
  //   "poolName":"indy22",
  //   "stewardWalletName":"truong22"
  // }
  createPoolLedger = async (req, res) => {
    let poolName = req.body.poolName;
    let poolGenesisTxnPath = await this.getPoolGenesisTxnPath(poolName);
    let poolConfig = {
      "genesis_txn": poolGenesisTxnPath
    };
    try {
      await indy.createPoolLedgerConfig(poolName, poolConfig);
    } catch (e) {
      if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
        throw e;
      }
    }

    await indy.setProtocolVersion(2);

    let poolHandle = await indy.openPoolLedger(poolName);
    let stewardWalletConfig = { 'id': req.body.stewardWalletName };
    let stewardWalletCredentials = { 'key': 'steward_key' };
    try {
      await indy.createWallet(stewardWalletConfig, stewardWalletCredentials);
    } catch (e) {
      if (e.message !== "WalletAlreadyExistsError") {
        throw e;
      }
    }
    let stewardWallet = await indy.openWallet(stewardWalletConfig, stewardWalletCredentials);
    let stewardDidInfo = {
      'seed': '000000000000000000000000Steward1'
    };

    let [stewardDid, stewardKey] = await indy.createAndStoreMyDid(stewardWallet, stewardDidInfo);

    if (stewardDid && stewardKey) {
      res.status(200).json({
        stewardWallet: stewardWallet,
        stewardDid: stewardDid,
        stewardKey: stewardKey,
        poolHandle: poolHandle,
        poolName: poolName
      });
    } else {
      res.sendStatus(403);
    }
  }

  // Function for create stuff
  sendSchema = async function (poolHandle, walletHandle, Did, schema) {
    // schema = JSON.stringify(schema); // FIXME: Check JSON parsing
    let schemaRequest = await indy.buildSchemaRequest(Did, schema);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
  }

  toJson(val) {
    if (val === null || val === void 0) {
      return null
    }
    if (typeof val === 'string') {
      return val
    }
    return JSON.stringify(val)
  }

  getPoolGenesisTxnPath = async function (poolName) {
    let path = `${os.tmpdir()}/indy/${poolName}.txn`;
    await this.savePoolGenesisTxnFile(path);
    return path
  };

  poolGenesisTxnData = async function () {
    let poolIp = process.env.TEST_POOL_IP || "127.0.0.1";
    return `{"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node1", "blskey": "4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba", "client_ip": "${poolIp}", "client_port": 9702, "node_ip": "${poolIp}", "node_port": 9701, "services": ["VALIDATOR"]}, "dest": "Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"}, "metadata": {"from": "Th7MpTaRZVRYnPiabds81Y"}, "type": "0"}, "txnMetadata": {"seqNo": 1, "txnId": "fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"}, "ver": "1"}
            {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node2", "blskey": "37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk", "client_ip": "${poolIp}", "client_port": 9704, "node_ip": "${poolIp}", "node_port": 9703, "services": ["VALIDATOR"]}, "dest": "8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"}, "metadata": {"from": "EbP4aYNeTHL6q385GuVpRV"}, "type": "0"}, "txnMetadata": {"seqNo": 2, "txnId": "1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"}, "ver": "1"}
            {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node3", "blskey": "3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5", "client_ip": "${poolIp}", "client_port": 9706, "node_ip": "${poolIp}", "node_port": 9705, "services": ["VALIDATOR"]}, "dest": "DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"}, "metadata": {"from": "4cU41vWW82ArfxJxHkzXPG"}, "type": "0"}, "txnMetadata": {"seqNo": 3, "txnId": "7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"}, "ver": "1"}
            {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node4", "blskey": "2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw", "client_ip": "${poolIp}", "client_port": 9708, "node_ip": "${poolIp}", "node_port": 9707, "services": ["VALIDATOR"]}, "dest": "4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"}, "metadata": {"from": "TWwCRQRZ2ZHMJFn9TzLp7W"}, "type": "0"}, "txnMetadata": {"seqNo": 4, "txnId": "aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"}, "ver": "1"}`;
  }

  savePoolGenesisTxnFile = async function (filePath) {
    let data = await this.poolGenesisTxnData();
    await this.mkdir(filePath);
    return fs.writeFileSync(filePath, data, 'utf8');
  }

  mkdir = function (filePath) {
    return new Promise((resolve, reject) => {
      let folderPath = filePath.split('/').slice(0, filePath.split('/').length - 1).join('/');
      mkdirp(folderPath, function (err, res) {
        if (err) reject(err);
        else resolve(res);
      })
    })
  }

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

  getVerinym = async function (poolHandle, From, fromWallet, fromDid, fromToKey, to, toWallet, toFromDid, toFromKey, role) {
    let [toDid, toKey] = await indy.createAndStoreMyDid(toWallet, {});
    let didInfoJson = JSON.stringify({
      'did': toDid,
      'verkey': toKey
    });

    let authcryptedDidInfo = await indy.cryptoAuthCrypt(toWallet, toFromKey, fromToKey, Buffer.from(didInfoJson, 'utf8'));
    let [senderVerkey, authdecryptedDidInfo] =
      await indy.cryptoAuthDecrypt(fromWallet, fromToKey, Buffer.from(authcryptedDidInfo));

    let authdecryptedDidInfoJson = JSON.parse(Buffer.from(authdecryptedDidInfo).toString());
    let retrievedVerkey = await indy.keyForDid(poolHandle, fromWallet, toFromDid);

    if (senderVerkey !== retrievedVerkey) {
      throw Error("Verkey is not the same");
    }

    await this.sendNym(poolHandle, fromWallet, fromDid, authdecryptedDidInfoJson['did'], authdecryptedDidInfoJson['verkey'], role);
    return toDid
  }

  sendNym = async function (poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
  }
}
