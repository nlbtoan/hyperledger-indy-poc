import * as mongoose from 'mongoose';

const credentialDefinitionSchema = new mongoose.Schema({
  doctorPrescriptionCredDefId: String,
  doctorPrescriptionCredDefJson: Object
});

const CredentialDefinition = mongoose.model('CredentialDefinition', credentialDefinitionSchema);

export default CredentialDefinition;
