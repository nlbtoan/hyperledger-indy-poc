import * as mongoose from 'mongoose';

const schemaModel = new mongoose.Schema({
  schemaId: String,
  schema: Object
});

const SchemaModel = mongoose.model('SchemaModel', schemaModel);

export default SchemaModel;
