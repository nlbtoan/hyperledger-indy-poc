import Pharmacy from '../models/pharmacy';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

import indy = require('indy-sdk');
import assert = require('assert');
import mkdirp = require('mkdirp');
import fs = require('fs');
import os = require('os');

export default class pharmacyCtrl extends BaseCtrl {
  model = Pharmacy;

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

  // Step: 6
  // URL: /api/applyPrescription
  // Body: 
  // {
  //   "poolHandle": "",
  //   "poolName": "",
  //   "patientWallet": "",
  //   "patientWalletName": "",
  //   "patientWalletCredentials": "",
  //   "patientDoctorDid": "",
  //   "patientMasterSecretId": "",
  //   "pharmacyWallet": "",
  //   "pharmacyDid": "",
  //   "doctorPrescriptionCredDefId": "",
  //   "status": "",
  //   "doctorName": "",
  //   "pdfHash": "",
  //   "patientFirstName": "",
  //   "patientLastName": "",
  //   "dateOfBirth": ""
  // }
  applyPrescription = async (req, res) => {
    try {
      let pharmacyPatientKey, patientPharmacyDid, patientPharmacyKey, pharmacyPatientConnectionResponse;
      [req.body.patientWallet, pharmacyPatientKey, patientPharmacyDid, patientPharmacyKey, pharmacyPatientConnectionResponse] = await this.onboarding(req.body.poolHandle, "Bank", req.body.pharmacyWallet, req.body.pharmacyDid, "Personal", req.body.patientWallet, { 'id': req.body.patientWalletName }, req.body.patientWalletCredentials);

      let prescriptionApplicationProofRequestJson = {
        'nonce': '1432422343242122312411212',
        'name': 'Loan-Application',
        'version': '0.1',
        'requested_attributes': {
          'attr1_referent': {
            'name': 'id'
          },
          'attr2_referent': {
            'name': 'name'
          },
          'attr3_referent': {
            'name': 'dob'
          },
          'attr4_referent': {
            'name': 'gender'
          },
          'attr5_referent': {
            'name': 'nationality'
          },
          'attr6_referent': {
            'name': 'hometown'
          },
          'attr7_referent': {
            'name': 'profile_image_hash'
          }
        },
        'requested_predicates': {
          'predicate1_referent': {
            'name': 'created_at',
            'restrictions': [{ 'cred_def_id': req.body.doctorPrescriptionCredDefId }]
          }
        }
      };

      let patientPharmacyVerkey = await indy.keyForDid(req.body.poolHandle, req.body.pharmacyWallet, pharmacyPatientConnectionResponse['did']);
      let authcryptedPrescriptionApplicationProofRequestJson = await indy.cryptoAuthCrypt(req.body.pharmacyWallet, pharmacyPatientKey, patientPharmacyVerkey, Buffer.from(JSON.stringify(prescriptionApplicationProofRequestJson), 'utf8'));
      let [pharmacyPatientVerkey, authdecryptedPrescriptionApplicationProofRequestJson] = await this.authDecrypt(req.body.patientWallet, patientPharmacyKey, authcryptedPrescriptionApplicationProofRequestJson);
      let credsForPrescriptionApplicationProofRequest = await indy.proverGetCredentialsForProofReq(req.body.patientWallet, authdecryptedPrescriptionApplicationProofRequestJson);
      let credForAttr1 = credsForPrescriptionApplicationProofRequest['attrs']['attr1_referent'][0]['cred_info'];
      let credForAttr2 = credsForPrescriptionApplicationProofRequest['attrs']['attr2_referent'][0]['cred_info'];
      let credForAttr3 = credsForPrescriptionApplicationProofRequest['attrs']['attr3_referent'][0]['cred_info'];
      let credForAttr4 = credsForPrescriptionApplicationProofRequest['attrs']['attr4_referent'][0]['cred_info'];
      let credForAttr5 = credsForPrescriptionApplicationProofRequest['attrs']['attr5_referent'][0]['cred_info'];
      let credForAttr6 = credsForPrescriptionApplicationProofRequest['attrs']['attr6_referent'][0]['cred_info'];
      let credForAttr7 = credsForPrescriptionApplicationProofRequest['attrs']['attr7_referent'][0]['cred_info'];
      let credForPredicate1 = credsForPrescriptionApplicationProofRequest['predicates']['predicate1_referent'][0]['cred_info'];

      let credsForPrescriptionApplicationProof = {};
      credsForPrescriptionApplicationProof[`${credForAttr1['referent']}`] = credForAttr1;
      credsForPrescriptionApplicationProof[`${credForAttr2['referent']}`] = credForAttr2;
      credsForPrescriptionApplicationProof[`${credForAttr3['referent']}`] = credForAttr3;
      credsForPrescriptionApplicationProof[`${credForAttr4['referent']}`] = credForAttr4;
      credsForPrescriptionApplicationProof[`${credForAttr5['referent']}`] = credForAttr5;
      credsForPrescriptionApplicationProof[`${credForAttr6['referent']}`] = credForAttr6;
      credsForPrescriptionApplicationProof[`${credForAttr7['referent']}`] = credForAttr7;
      credsForPrescriptionApplicationProof[`${credForPredicate1['referent']}`] = credForPredicate1;

      let [schemasJson, credDefsJson, revocStatesJson] = await this.proverGetEntitiesFromLedger(req.body.poolHandle, req.body.patientDoctorDid, credsForPrescriptionApplicationProof, 'Personal');

      let prescriptionApplicationRequestedCredsJson = {
        'self_attested_attributes': {
          'attr1_referent': req.body.id,
          'attr2_referent': req.body.name,
          'attr3_referent': req.body.dob
        },
        'requested_attributes': {
          'attr4_referent': { 'cred_id': credForAttr4['referent'], 'revealed': true },
          'attr5_referent': { 'cred_id': credForAttr5['referent'], 'revealed': true },
          'attr6_referent': { 'cred_id': credForAttr6['referent'], 'revealed': true }
        },
        'requested_predicates': { 'predicate1_referent': { 'cred_id': credForPredicate1['referent'] } }
      };

      let prescriptionApplicationProofJson = await indy.proverCreateProof(req.body.patientWallet, authdecryptedPrescriptionApplicationProofRequestJson,
        prescriptionApplicationRequestedCredsJson, req.body.patientMasterSecretId,
        schemasJson, credDefsJson, revocStatesJson);

      let authcryptedPrescriptionApplicationProofJson = await indy.cryptoAuthCrypt(req.body.patientWallet, patientPharmacyKey, pharmacyPatientVerkey, Buffer.from(JSON.stringify(prescriptionApplicationProofJson), 'utf8'));

      let decryptedPrescriptionApplicationProofJson, decryptedPrescriptionApplicationProof;
      [, decryptedPrescriptionApplicationProofJson, decryptedPrescriptionApplicationProof] = await this.authDecrypt(req.body.pharmacyWallet, pharmacyPatientKey, authcryptedPrescriptionApplicationProofJson);

      let revocRefDefsJson, revocRegsJson;
      [schemasJson, credDefsJson, revocRefDefsJson, revocRegsJson] = await this.verifierGetEntitiesFromLedger(req.body.poolHandle, req.body.pharmacyDid, decryptedPrescriptionApplicationProof['identifiers'], 'Pharmacy');

      assert(req.body.id === decryptedPrescriptionApplicationProof['requested_proof']['self_attested_attrs']['attr1_referent']);
      assert(req.body.name === decryptedPrescriptionApplicationProof['requested_proof']['self_attested_attrs']['attr2_referent']);
      assert(req.body.dob === decryptedPrescriptionApplicationProof['requested_proof']['self_attested_attrs']['attr3_referent']);
      assert(req.body.gender === decryptedPrescriptionApplicationProof['requested_proof']['revealed_attrs']['attr4_referent']['raw']);
      assert(req.body.nationality === decryptedPrescriptionApplicationProof['requested_proof']['revealed_attrs']['attr5_referent']['raw']);
      assert(req.body.hometown === decryptedPrescriptionApplicationProof['requested_proof']['revealed_attrs']['attr6_referent']['raw']);
      assert(req.body.profile_image_hash === decryptedPrescriptionApplicationProof['requested_proof']['revealed_attrs']['attr7_referent']['raw']);

      await indy.verifierVerifyProof(prescriptionApplicationProofRequestJson, decryptedPrescriptionApplicationProofJson, schemasJson, credDefsJson, revocRefDefsJson, revocRegsJson);
      res.status(200).json();
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

  proverGetEntitiesFromLedger = async function (poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revStates = {};

    for (let referent of Object.keys(identifiers)) {
      let item = identifiers[referent];
      let [receivedSchemaId, receivedSchema] = await this.getSchema(poolHandle, did, item['schema_id']);
      schemas[receivedSchemaId] = receivedSchema;

      let [receivedCredDefId, receivedCredDef] = await this.getCredDef(poolHandle, did, item['cred_def_id']);
      credDefs[receivedCredDefId] = receivedCredDef;

      if (item.rev_reg_seq_no) {
        // TODO Create Revocation States
      }
    }

    return [schemas, credDefs, revStates];
  }

  getSchema = async function (poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
  }

  verifierGetEntitiesFromLedger = async function (poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegs = {};

    for (let referent of Object.keys(identifiers)) {
      let item = identifiers[referent];
      let [receivedSchemaId, receivedSchema] = await this.getSchema(poolHandle, did, item['schema_id']);
      schemas[receivedSchemaId] = receivedSchema;

      let [receivedCredDefId, receivedCredDef] = await this.getCredDef(poolHandle, did, item['cred_def_id']);
      credDefs[receivedCredDefId] = receivedCredDef;

      if (item.rev_reg_seq_no) {
        // TODO Get Revocation Definitions and Revocation Registries
      }
    }

    return [schemas, credDefs, revRegDefs, revRegs];
  }

  getCredDef = async function (poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    return await indy.parseGetCredDefResponse(getCredDefResponse);
  }

  sendCredDef = async function (poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
  }
}
