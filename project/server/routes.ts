import * as express from 'express';

import UserCtrl from './controllers/user';
import WareHouse from './controllers/warehouse';
import NursingHome from './controllers/nursingHome';
import Doctor from './controllers/doctor';
import Pharmacy from './controllers/pharmacy';
import HashFile from './controllers/hashFile';
import Ledger from './controllers/ledger';
import TrustAnchor from './controllers/trustAnchor';
import IdCard from './controllers/idCard';
import CredentialDefinition from './controllers/credentialDefinition';
import PatientPrescription from './controllers/patientPrescription';
import PharmacyPrescription from './controllers/PharmacyPrescription';

export default function setRoutes(app) {

  const router = express.Router();

  const userCtrl = new UserCtrl();
  const wareHouse = new WareHouse();
  const nursingHome = new NursingHome();
  const doctor = new Doctor();
  const pharmacy = new Pharmacy();
  const hashFile = new HashFile();
  const ledger = new Ledger();
  const trustAnchor = new TrustAnchor();
  const idCard = new IdCard();
  const credentialDefinition = new CredentialDefinition();
  const patientPrescription = new PatientPrescription();
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

  // Prescription schema
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
  router.route('/patientPrescriptions').get(patientPrescription.getAll);
  router.route('/patientPrescriptions/count').get(patientPrescription.count);
  router.route('/patientPrescription').post(patientPrescription.insert);
  router.route('/patientPrescription/:id').get(patientPrescription.get);
  router.route('/patientPrescription/:id').put(patientPrescription.update);
  router.route('/patientPrescription/:id').delete(patientPrescription.delete);

  // Pharmacy Prescription Lists
  router.route('/pharmacyPrescriptions').get(pharmacyPrescription.getAll);
  router.route('/pharmacyPrescriptions/count').get(pharmacyPrescription.count);
  router.route('/pharmacyPrescription').post(pharmacyPrescription.insert);
  router.route('/pharmacyPrescription/:id').get(pharmacyPrescription.get);
  router.route('/pharmacyPrescription/:id').put(pharmacyPrescription.update);
  router.route('/pharmacyPrescription/:id').delete(pharmacyPrescription.delete);

  //// Interation with the ledger ////
  // Warehouse
  router.route('/createPoolLedger').post(wareHouse.createPoolLedger);
  router.route('/addTrustAnchor').post(wareHouse.addTrustAnchor);
  router.route('/createSchema').post(wareHouse.createSchema);
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

  // Doctor
  router.route('/setupCredentialDefinition').post(doctor.setupCredentialDefinition);
  router.route('/gettingPrescription').post(doctor.gettingPrescription);
  router.route('/doctorLogin').post(doctor.login);
  router.route('/doctors').get(doctor.getAll);
  router.route('/doctors/count').get(doctor.count);
  router.route('/doctor/:id').get(doctor.get);
  router.route('/doctor/:id').put(doctor.update);
  router.route('/doctor/:id').delete(doctor.delete);

  // Pharmacy
  router.route('/applyPrescription').post(pharmacy.applyPrescription);
  router.route('/pharmacyLogin').post(pharmacy.login);
  router.route('/pharmacys').get(pharmacy.getAll);
  router.route('/pharmacys/count').get(pharmacy.count);
  router.route('/pharmacy/:id').get(pharmacy.get);
  router.route('/pharmacy/:id').put(pharmacy.update);
  router.route('/pharmacy/:id').delete(pharmacy.delete);

  // Hash
  router.route('/hash').post(hashFile.hashFile);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
