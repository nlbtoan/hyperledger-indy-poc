import * as mongoose from 'mongoose';

const credentialDefinitionSchema = new mongoose.Schema({
  governmentIdCardCredDefId: String,
  governmentIdCardCredDefJson: Object
});

const CredentialDefinition = mongoose.model('CredentialDefinition', credentialDefinitionSchema);

export default CredentialDefinition;
