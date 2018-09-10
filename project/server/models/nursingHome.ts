import * as mongoose from 'mongoose';

const nursingHomeSchema = new mongoose.Schema({
  name: String,
  nursingHomeWalletName: String,
  address: String,
  phone: Number
});

const NursingHome = mongoose.model('NursingHome', nursingHomeSchema);

export default NursingHome;
