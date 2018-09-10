import * as mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: String,
  doctorWalletName: String,
  address: String,
  phone: Number
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
