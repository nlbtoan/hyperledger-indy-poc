import * as mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema({
  schemaId: String,
  schema: Object
});

const IdCardSchema = mongoose.model('IdCardSchema', idCardSchema);

export default IdCardSchema;
