import * as mongoose from 'mongoose';

const pharmacyPrescriptionSchema = new mongoose.Schema({
  patientDoctorDid: String,
  doctorPrescriptionCredDefId: String
});

const PharmacyPrescription = mongoose.model('PharmacyPrescription', pharmacyPrescriptionSchema);

export default PharmacyPrescription;
