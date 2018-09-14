import * as mongoose from 'mongoose';

const bankIdCardSchema = new mongoose.Schema({
  residentGovernmentDid: String,
  governmentIdCardCredDefId: String
});

const BankIdCard = mongoose.model('BankIdCard', bankIdCardSchema);

export default BankIdCard;
