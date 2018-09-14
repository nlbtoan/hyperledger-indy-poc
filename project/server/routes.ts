import * as express from 'express';

import UserCtrl from './controllers/user';
import Admin from './controllers/admin';
import NursingHome from './controllers/nursingHome';
import Government from './controllers/gov';
import Bank from './controllers/bank';
import HashFile from './controllers/hashFile';
import Ledger from './controllers/ledger';
import TrustAnchor from './controllers/trustAnchor';
import IdCard from './controllers/idCard';
import CredentialDefinition from './controllers/credentialDefinition';
import ResidentIdCard from './controllers/residentIdCard';
import PharmacyPrescription from './controllers/PharmacyPrescription';

export default function setRoutes(app) {

  const router = express.Router();

  const userCtrl = new UserCtrl();
  const admin = new Admin();
  const nursingHome = new NursingHome();
  const gov = new Government();
  const bank = new Bank();
  const hashFile = new HashFile();
  const ledger = new Ledger();
  const trustAnchor = new TrustAnchor();
  const idCard = new IdCard();
  const credentialDefinition = new CredentialDefinition();
  const residentIdCard = new ResidentIdCard();
  const pharmacyPrescription = new PharmacyPrescription();

  //// Ledger data managerment ////
  // Ledger
  router.route('/ledgers').get(ledger.getAll);
  router.route('/ledgers/count').get(ledger.count);
  router.route('/ledger').post(ledger.insert);
  router.route('/ledger/:id').get(ledger.get);
  router.route('/ledger/:id').put(ledger.update);
  router.route('/ledger/:id').delete(ledger.delete);

  // Trust Anchor
  router.route('/trustAnchors').get(trustAnchor.getAll);
  router.route('/trustAnchors/count').get(trustAnchor.count);
  router.route('/trustAnchor').post(trustAnchor.insert);
  router.route('/trustAnchor/:id').get(trustAnchor.get);
  router.route('/trustAnchor/:id').put(trustAnchor.update);
  router.route('/trustAnchor/:id').delete(trustAnchor.delete);

  // idCard schema
  router.route('/prescriptions').get(idCard.getAll);
  router.route('/prescriptions/count').get(idCard.count);
  router.route('/prescription').post(idCard.insert);
  router.route('/prescription/:id').get(idCard.get);
  router.route('/prescription/:id').put(idCard.update);
  router.route('/prescription/:id').delete(idCard.delete);

  // Credential Definition
  router.route('/credentialDefinitions').get(credentialDefinition.getAll);
  router.route('/credentialDefinitions/count').get(credentialDefinition.count);
  router.route('/credentialDefinition').post(credentialDefinition.insert);
  router.route('/credentialDefinition/:id').get(credentialDefinition.get);
  router.route('/credentialDefinition/:id').put(credentialDefinition.update);
  router.route('/credentialDefinition/:id').delete(credentialDefinition.delete);

  // Prescription
  router.route('/patientPrescriptions').get(residentIdCard.getAll);
  router.route('/patientPrescriptions/count').get(residentIdCard.count);
  router.route('/patientPrescription').post(residentIdCard.insert);
  router.route('/patientPrescription/:id').get(residentIdCard.get);
  router.route('/patientPrescription/:id').put(residentIdCard.update);
  router.route('/patientPrescription/:id').delete(residentIdCard.delete);

  // Pharmacy Prescription Lists
  router.route('/pharmacyPrescriptions').get(pharmacyPrescription.getAll);
  router.route('/pharmacyPrescriptions/count').get(pharmacyPrescription.count);
  router.route('/pharmacyPrescription').post(pharmacyPrescription.insert);
  router.route('/pharmacyPrescription/:id').get(pharmacyPrescription.get);
  router.route('/pharmacyPrescription/:id').put(pharmacyPrescription.update);
  router.route('/pharmacyPrescription/:id').delete(pharmacyPrescription.delete);

  //// Interation with the ledger ////
  // Admin
  router.route('/createPoolLedger').post(admin.createPoolLedger);
  router.route('/addTrustAnchor').post(admin.addTrustAnchor);
  router.route('/createSchema').post(admin.createSchema);
  router.route('/login').post(userCtrl.login);
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  // Nursing Home
  router.route('/nursingHomeLogin').post(nursingHome.login);
  router.route('/nursingHomes').get(nursingHome.getAll);
  router.route('/nursingHomes/count').get(nursingHome.count);
  router.route('/nursingHome/:id').get(nursingHome.get);
  router.route('/nursingHome/:id').put(nursingHome.update);
  router.route('/nursingHome/:id').delete(nursingHome.delete);

  // Gov
  router.route('/setupCredentialDefinition').post(gov.setupCredentialDefinition);
  router.route('/gettingIdCard').post(gov.gettingIdCard);
  router.route('/doctorLogin').post(gov.login);
  router.route('/doctors').get(gov.getAll);
  router.route('/doctors/count').get(gov.count);
  router.route('/doctor/:id').get(gov.get);
  router.route('/doctor/:id').put(gov.update);
  router.route('/doctor/:id').delete(gov.delete);

  // Pharmacy
  router.route('/applyIdCard').post(bank.applyIdCard);
  router.route('/pharmacyLogin').post(bank.login);
  router.route('/pharmacys').get(bank.getAll);
  router.route('/pharmacys/count').get(bank.count);
  router.route('/pharmacy/:id').get(bank.get);
  router.route('/pharmacy/:id').put(bank.update);
  router.route('/pharmacy/:id').delete(bank.delete);

  // Hash
  router.route('/hash').post(hashFile.hashFile);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
