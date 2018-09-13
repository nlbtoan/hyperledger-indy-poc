import * as mongoose from 'mongoose';

const BankSchema = new mongoose.Schema({
  name: String,
  BankWalletName: String,
  address: String,
  phone: Number
});

const Bank = mongoose.model('Bank', BankSchema);

export default Bank;
