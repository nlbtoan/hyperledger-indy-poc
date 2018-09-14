import * as express from 'express';

import UserCtrl from './controllers/user';
import Admin from './controllers/admin';
import Government from './controllers/government';
import Bank from './controllers/bank';
import Ledger from './controllers/ledger';
import TrustAnchor from './controllers/trustAnchor';
import IdCard from './controllers/idCard';
import CredentialDefinition from './controllers/credentialDefinition';
import ResidentIdCard from './controllers/residentIdCard';
import BankIdCard from './controllers/bankIdCard';

export default function setRoutes(app) {

  const router = express.Router();

  const userCtrl = new UserCtrl();
  const admin = new Admin();
  const government = new Government();
  const bank = new Bank();
  const ledger = new Ledger();
  const trustAnchor = new TrustAnchor();
  const idCard = new IdCard();
  const credentialDefinition = new CredentialDefinition();
  const residentIdCard = new ResidentIdCard();
  const bankIdCard = new BankIdCard();

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
  router.route('/schemas').get(idCard.getAll);
  router.route('/schema/count').get(idCard.count);
  router.route('/schema').post(idCard.insert);
  router.route('/schema/:id').get(idCard.get);
  router.route('/schema/:id').put(idCard.update);
  router.route('/schema/:id').delete(idCard.delete);

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
  router.route('/bankIdCards').get(bankIdCard.getAll);
  router.route('/bankIdCards/count').get(bankIdCard.count);
  router.route('/bankIdCard').post(bankIdCard.insert);
  router.route('/bankIdCard/:id').get(bankIdCard.get);
  router.route('/bankIdCard/:id').put(bankIdCard.update);
  router.route('/bankIdCard/:id').delete(bankIdCard.delete);

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

  // Government
  router.route('/setupCredentialDefinition').post(government.setupCredentialDefinition);
  router.route('/gettingIdCard').post(government.gettingIdCard);
  router.route('/doctorLogin').post(government.login);
  router.route('/doctors').get(government.getAll);
  router.route('/doctors/count').get(government.count);
  router.route('/doctor/:id').get(government.get);
  router.route('/doctor/:id').put(government.update);
  router.route('/doctor/:id').delete(government.delete);

  // Bank
  router.route('/applyLoan').post(bank.applyLoan);
  router.route('/pharmacyLogin').post(bank.login);
  router.route('/pharmacys').get(bank.getAll);
  router.route('/pharmacys/count').get(bank.count);
  router.route('/pharmacy/:id').get(bank.get);
  router.route('/pharmacy/:id').put(bank.update);
  router.route('/pharmacy/:id').delete(bank.delete);

  // Hash
  router.route('/hash').post(government.hashFile);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
