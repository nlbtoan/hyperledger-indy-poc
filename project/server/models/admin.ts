import * as mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
