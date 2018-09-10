import * as mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: String,
  pharmacyWalletName: String,
  address: String,
  phone: Number
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
