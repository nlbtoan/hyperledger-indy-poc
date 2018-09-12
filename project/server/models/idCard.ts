import * as mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema({
  idCardSchemaId: String,
  idCardSchema: Object
});

const IdCard = mongoose.model('IdCard', idCardSchema);

export default IdCard;
