const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'IN' },
  phone: String,
  email: String,
  gstin: String,
  pan: String,
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String, default: 'NET30' },
  salesOrg: { type: String, default: '1000' },
  accountGroup: { type: String, default: 'DEBI' },
  status: { type: String, enum: ['Active', 'Blocked', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
