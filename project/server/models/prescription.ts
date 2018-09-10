import * as mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionSchemaId: String,
  prescriptionSchema: Object
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
