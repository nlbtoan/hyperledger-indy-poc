import * as mongoose from 'mongoose';

const hashFileSchema = new mongoose.Schema({
  nameFile: String,
  hash: Number
});

const HashFile = mongoose.model('HashFile', hashFileSchema);

export default HashFile;
