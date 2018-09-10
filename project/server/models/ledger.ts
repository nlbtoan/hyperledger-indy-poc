import * as mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  stewardWallet: Number,
  stewardDid: String,
  stewardKey: String,
  poolHandle: Number,
  poolName: String
});

const Ledger = mongoose.model('Ledger', ledgerSchema);

export default Ledger;
