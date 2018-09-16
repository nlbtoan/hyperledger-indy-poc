import * as mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema({
  schemaId: String,
  schemaData: Object
});

const IdCardSchema = mongoose.model('IdCardSchema', idCardSchema);

export default IdCardSchema;
