import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  schemaId: String,
  schema: Object
});

const SchemaModel = mongoose.model('Schema', schema);

export default SchemaModel;
