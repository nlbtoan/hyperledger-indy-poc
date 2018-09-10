import * as mongoose from 'mongoose';

const patientPrescriptionSchema = new mongoose.Schema({
  patientWallet: Number,
  patientWalletCredentials: Object,
  doctorPatientKey: String,
  patientDoctorDid: String,
  patientDoctorKey: String,
  doctorPatientConnectionResponse: Object,
  prescriptionCredOfferJson: Object,
  patientDoctorVerkey: String,
  doctorPatientVerkey: String,
  authdecryptedPrescriptionCredOffer: Object,
  patientMasterSecretId: String,
  doctorPrescriptionCredDef: Object,
  prescriptionCredRequestJson: Object,
  prescriptionCredRequestMetadataJson: Object,
  prescriptionCredValues: Object,
  prescriptionCredJson: Object
});

const PatientPrescription = mongoose.model('PatientPrescription', patientPrescriptionSchema);

export default PatientPrescription;
