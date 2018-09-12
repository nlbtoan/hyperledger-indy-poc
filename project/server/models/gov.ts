import * as mongoose from 'mongoose';

const govSchema = new mongoose.Schema({
  name: String,
  govWalletName: String,
  address: String,
  phone: Number
});

const Government = mongoose.model('Government', govSchema);

export default Government;
