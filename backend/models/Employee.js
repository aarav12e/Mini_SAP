const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  personnelNo: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['M', 'F', 'O'] },
  email: { type: String },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  employeeGroup: { type: String, enum: ['1-Active', '2-Retiree', '3-Intern', '4-Contract'], default: '1-Active' },
  companyCode: { type: String, default: '1000' },
  costCenter: { type: String },
  salary: { type: Number },
  joiningDate: { type: Date },
  validTo: { type: Date, default: new Date('9999-12-31') },
  status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Terminated'], default: 'Active' },
  leaveBalance: { type: Number, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
