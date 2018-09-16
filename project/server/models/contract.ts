import * as mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  residentGovernmentDid: String,
  governmentIdCardCredDefId: String,
  money: Number  
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
