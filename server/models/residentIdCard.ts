import * as mongoose from 'mongoose';

const ResidentIdCardSchema = new mongoose.Schema({
  residentWallet: Number,
  residentWalletCredentials: Object,
  governmentResidentKey: String,
  residentGovernmentDid: String,
  residentGovernmentKey: String,
  governmentResidentConnectionResponse: Object,
  idCardCredOfferJson: Object,
  residentGovernmentVerkey: String,
  governmentResidentVerkey: String,
  authdecryptedIdCardCredOffer: Object,
  residentMasterSecretId: String,
  governmentIdCardCredDef: Object,
  idCardCredRequestJson: Object,
  idCardCredRequestMetadataJson: Object,
  idCardCredValues: Object,
  idCardCredJson: Object
});

const ResidentIdCard = mongoose.model('ResidentIdCard', ResidentIdCardSchema);

export default ResidentIdCard;
