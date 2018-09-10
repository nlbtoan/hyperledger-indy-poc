import * as mongoose from 'mongoose';

const trustAnchorSchema = new mongoose.Schema({
  trustAnchorName: String,
  trustAnchorDID: String,
  trustAnchorWallet: Number,
  stewardTrustAnchorKey: String,
  trustAnchorStewardDid: String,
  trustAnchorStewardKey: String
});

const TrustAnchor = mongoose.model('TrustAnchor', trustAnchorSchema);

export default TrustAnchor;
