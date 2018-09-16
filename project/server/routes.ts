import * as express from 'express';

import UserCtrl from './controllers/user';
import Admin from './controllers/admin';
import Government from './controllers/government';
import Bank from './controllers/bank';
import Ledger from './controllers/ledger';
import TrustAnchor from './controllers/trustAnchor';
import IdCardSchema from './controllers/idCardSchema';
import CredentialDefinition from './controllers/credentialDefinition';
import ResidentIdCard from './controllers/residentIdCard';

export default function setRoutes(app) {

  const router = express.Router();

  const userCtrl = new UserCtrl();
  const admin = new Admin();
  const government = new Government();
  const bank = new Bank();
  const ledger = new Ledger();
  const trustAnchor = new TrustAnchor();
  const schema = new IdCardSchema();
  const credentialDefinition = new CredentialDefinition();
  const residentIdCard = new ResidentIdCard();

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

  // Schema
  router.route('/schemas').get(schema.getAll);
  router.route('/schema/count').get(schema.count);
  router.route('/schema').post(schema.insert);
  router.route('/schema/:id').get(schema.get);
  router.route('/schema/:id').put(schema.update);
  router.route('/schema/:id').delete(schema.delete);

  // Credential Definition
  router.route('/credentialDefinitions').get(credentialDefinition.getAll);
  router.route('/credentialDefinitions/count').get(credentialDefinition.count);
  router.route('/credentialDefinition').post(credentialDefinition.insert);
  router.route('/credentialDefinition/:id').get(credentialDefinition.get);
  router.route('/credentialDefinition/:id').put(credentialDefinition.update);
  router.route('/credentialDefinition/:id').delete(credentialDefinition.delete);

  // ID Card
  router.route('/idCards').get(residentIdCard.getAll);
  router.route('/idCard/count').get(residentIdCard.count);
  router.route('/idCard').post(residentIdCard.insert);
  router.route('/idCard/:id').get(residentIdCard.get);
  router.route('/idCard/:id').put(residentIdCard.update);
  router.route('/idCard/:id').delete(residentIdCard.delete);

  //// Interation with the ledger ////
  // Admin
  router.route('/createPoolLedger').post(admin.createPoolLedger);
  router.route('/addTrustAnchor').post(admin.addTrustAnchor);
  router.route('/login').post(userCtrl.login);
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  // Government
  router.route('/createSchema').post(government.createSchema);
  router.route('/setupCredentialDefinition').post(government.setupCredentialDefinition);
  router.route('/createIdCard').post(government.createIdCard);

  // Bank
  router.route('/applyLoan').post(bank.applyLoan);

  // Hash
  router.route('/hash').post(government.hashFile);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
