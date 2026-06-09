const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  itemNo: String,
  glAccount: String,
  description: String,
  debitCredit: { type: String, enum: ['Debit', 'Credit'] },
  amount: Number,
  costCenter: String,
  taxCode: String
});

const glDocumentSchema = new mongoose.Schema({
  documentNo: { type: String, unique: true },
  documentType: { type: String, enum: ['SA', 'KR', 'DR', 'KZ', 'DZ'], default: 'SA' },
  documentDate: { type: Date, required: true },
  postingDate: { type: Date, required: true },
  companyCode: { type: String, default: '1000' },
  currency: { type: String, default: 'INR' },
  reference: String,
  headerText: String,
  lineItems: [lineItemSchema],
  totalDebit: Number,
  totalCredit: Number,
  isBalanced: { type: Boolean, default: false },
  postedBy: String,
  status: { type: String, enum: ['Draft', 'Posted', 'Reversed'], default: 'Draft' }
}, { timestamps: true });

glDocumentSchema.pre('save', function(next) {
  if (!this.documentNo) {
    this.documentNo = '10' + Date.now().toString().slice(-8);
  }
  this.totalDebit = this.lineItems.filter(i => i.debitCredit === 'Debit').reduce((s, i) => s + i.amount, 0);
  this.totalCredit = this.lineItems.filter(i => i.debitCredit === 'Credit').reduce((s, i) => s + i.amount, 0);
  this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  next();
});

module.exports = mongoose.model('GLDocument', glDocumentSchema);
