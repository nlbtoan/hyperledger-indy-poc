import Doctor from '../models/doctor';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

import indy = require('indy-sdk');
import assert = require('assert');
import mkdirp = require('mkdirp');
import fs = require('fs');
import os = require('os');

export default class doctorCtrl extends BaseCtrl {
  model = Doctor;

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
  //   "name":"patient22",
  //   "patientWalletName": "patientWallet22",
  //   "poolHandle": 2,
  //   "poolName": "indy22",
  //   "doctorWallet": 13,
  //   "doctorDid": "BMkm2SzCDifFVFWGu9PEGY",
  //   "doctorPrescriptionCredDefId": "BMkm2SzCDifFVFWGu9PEGY:3:CL:810",
  //   "pharmacyWallet": 21,
  //   "prescriptionCredValues": {
  //         "patient_first_name": { "raw": "Patient", "encoded": "1139481716457488690172217916278103335" },
  //         "patient_last_name": { "raw": "Garcia", "encoded": "5321642780241790123587902456789123452" },
  //         "doctor_name": { "raw": "Dr . James Hold", "encoded": "12434523576212321" },
  //         "status": { "raw": "Cancer", "encoded": "2213454313412354" },
  //         "dob": { "raw": "12-05-1949", "encoded": "3124141231422543541" },
  //         "link": { "raw": "2015", "encoded": "2015" },
  //         "pdf_hash": { "raw": "1997", "encoded": "1997" },
  //         "isCreated": { "raw": "1", "encoded": "1" }
  //     }
  // }
  gettingPrescription = async (req, res) => {
    try {
      let patientWalletName = req.body.patientWalletName;
      let patientWalletCredentials = { 'key': req.body.name + '_key' };
      let [patientWallet, doctorPatientKey, patientDoctorDid, patientDoctorKey, doctorPatientConnectionResponse] = await this.onboarding(req.body.poolHandle, req.body.poolName, "Doctor", req.body.doctorWallet, req.body.doctorDid, "Patient", null, patientWalletName, patientWalletCredentials);
      let prescriptionCredOfferJson = await indy.issuerCreateCredentialOffer(req.body.doctorWallet, req.body.doctorPrescriptionCredDefId);
      let patientDoctorVerkey = await indy.keyForDid(req.body.poolHandle, req.body.pharmacyWallet, doctorPatientConnectionResponse['did']);
      let authcryptedPrescriptionCredOffer = await indy.cryptoAuthCrypt(req.body.doctorWallet, doctorPatientKey, patientDoctorVerkey, Buffer.from(JSON.stringify(prescriptionCredOfferJson), 'utf8'));
      let [doctorPatientVerkey, authdecryptedPrescriptionCredOfferJson, authdecryptedPrescriptionCredOffer] = await this.authDecrypt(patientWallet, patientDoctorKey, authcryptedPrescriptionCredOffer);
      let patientMasterSecretId = await indy.proverCreateMasterSecret(patientWallet, null);
      let doctorPrescriptionCredDef;
      [req.body.doctorPrescriptionCredDefId, doctorPrescriptionCredDef] = await this.getCredDef(req.body.poolHandle, patientDoctorDid, authdecryptedPrescriptionCredOffer['cred_def_id']);
      let [prescriptionCredRequestJson, prescriptionCredRequestMetadataJson] = await indy.proverCreateCredentialReq(patientWallet, patientDoctorDid, authdecryptedPrescriptionCredOfferJson, doctorPrescriptionCredDef, patientMasterSecretId);
      let authcryptedPrescriptionCredRequest = await indy.cryptoAuthCrypt(patientWallet, patientDoctorKey, doctorPatientVerkey, Buffer.from(JSON.stringify(prescriptionCredRequestJson), 'utf8'));
      let authdecryptedPrescriptionCredRequestJson;
      [patientDoctorVerkey, authdecryptedPrescriptionCredRequestJson] = await this.authDecrypt(req.body.doctorWallet, doctorPatientKey, authcryptedPrescriptionCredRequest);
      let prescriptionCredValues = req.body.prescriptionCredValues;
      let [prescriptionCredJson] = await indy.issuerCreateCredential(req.body.doctorWallet, prescriptionCredOfferJson, authdecryptedPrescriptionCredRequestJson, prescriptionCredValues, null, -1);
      let authcryptedPrescriptionCredJson = await indy.cryptoAuthCrypt(req.body.doctorWallet, doctorPatientKey, patientDoctorVerkey, Buffer.from(JSON.stringify(prescriptionCredJson), 'utf8'));
      let [, authdecryptedPrescriptionCredJson] = await this.authDecrypt(patientWallet, patientDoctorKey, authcryptedPrescriptionCredJson);

      await indy.proverStoreCredential(patientWallet, null, prescriptionCredRequestMetadataJson,
        authdecryptedPrescriptionCredJson, doctorPrescriptionCredDef, null);

      res.status(200).json({
        patientWallet: patientWallet,
        patientWalletCredentials: patientWalletCredentials,
        doctorPatientKey: doctorPatientKey,
        patientDoctorDid: patientDoctorDid,
        patientDoctorKey: patientDoctorKey,
        doctorPatientConnectionResponse: doctorPatientConnectionResponse,
        prescriptionCredOfferJson: prescriptionCredOfferJson,
        patientDoctorVerkey: patientDoctorVerkey,
        doctorPatientVerkey: doctorPatientVerkey,
        authdecryptedPrescriptionCredOffer: authdecryptedPrescriptionCredOffer,
        patientMasterSecretId: patientMasterSecretId,
        doctorPrescriptionCredDef: doctorPrescriptionCredDef,
        prescriptionCredRequestJson: prescriptionCredRequestJson,
        prescriptionCredRequestMetadataJson: prescriptionCredRequestMetadataJson,
        prescriptionCredValues: prescriptionCredValues,
        prescriptionCredJson: prescriptionCredJson
      });
    } catch (error) {
      res.sendStatus(403);
    }
  }

  // Step: 4
  // URL: /api/setupCredentialDefinition
  // Body:
  // {
  //   "poolHandle": 2,
  //   "doctorDid": "BMkm2SzCDifFVFWGu9PEGY",
  //   "doctorWallet": 13,
  //   "prescriptionSchemaId": "UAyYVcKCQuNKGCztZUn3WX:2:Prescription:1.2",
  //   "prescriptionSchema": {
  //     "ver": "1.0",
  //     "id": "UAyYVcKCQuNKGCztZUn3WX:2:Prescription:1.2",
  //     "name": "Prescription",
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
      [, req.body.prescriptionSchema] = await this.getSchema(poolHandle, req.body.doctorDid, req.body.prescriptionSchemaId);

      let [doctorPrescriptionCredDefId, doctorPrescriptionCredDefJson] = await indy.issuerCreateAndStoreCredentialDef(req.body.doctorWallet, req.body.doctorDid, req.body.prescriptionSchema, 'TAG1', 'CL', '{"support_revocation": false}');
      await this.sendCredDef(poolHandle, req.body.doctorWallet, req.body.doctorDid, doctorPrescriptionCredDefJson);
      
      res.status(200).json({
        doctorPrescriptionCredDefId: doctorPrescriptionCredDefId,
        doctorPrescriptionCredDefJson: doctorPrescriptionCredDefJson
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(403);
    }
  }

  // Function for create stuff
  onboarding = async function (poolHandle, poolName, From, fromWallet, fromDid, to, toWallet, toWalletName, toWalletCredentials) {

    let [fromToDid, fromToKey] = await indy.createAndStoreMyDid(fromWallet, {});

    await this.sendNym(poolHandle, fromWallet, fromDid, fromToDid, fromToKey, null);

    let connectionRequest = {
      did: fromToDid,
      nonce: 123456789
    };

    if (!toWallet) {
      try {
        await indy.createWallet(poolName, toWalletName, 'default', null, this.toJson(toWalletCredentials))
      } catch (e) {
        if (e.message !== "WalletAlreadyExistsError") {
          throw e;
        }
      }
      toWallet = await indy.openWallet(toWalletName, null, this.toJson(toWalletCredentials));
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
