import * as mongoose from 'mongoose';

const governmentSchema = new mongoose.Schema({
  name: String,
  govWalletName: String,
  address: String,
  phone: Number
});

const Government = mongoose.model('Government', governmentSchema);

export default Government;
