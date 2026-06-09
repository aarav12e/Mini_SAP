const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorNo: { type: String, required: true, unique: true },
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
  paymentTerms: { type: String, default: 'NET30' },
  bankAccount: String,
  ifsc: String,
  accountGroup: { type: String, default: 'KRED' },
  status: { type: String, enum: ['Active', 'Blocked', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
