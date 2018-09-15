import * as mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  stewardWallet: String,
  stewardDid: String,
  stewardKey: String,
  poolName: String
});

const Ledger = mongoose.model('Ledger', ledgerSchema);

export default Ledger;
