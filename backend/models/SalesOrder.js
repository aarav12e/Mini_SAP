const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  itemNo: String,
  materialNo: String,
  description: String,
  quantity: Number,
  uom: String,
  unitPrice: Number,
  netValue: Number,
  plant: { type: String, default: '1000' }
});

const salesOrderSchema = new mongoose.Schema({
  orderNo: { type: String, unique: true },
  orderType: { type: String, enum: ['OR', 'ZOR', 'CS', 'CR'], default: 'OR' },
  customerNo: { type: String, required: true },
  customerName: String,
  salesOrg: { type: String, default: '1000' },
  poNumber: String,
  requestedDelivery: Date,
  lineItems: [lineItemSchema],
  netValue: Number,
  taxPercent: { type: Number, default: 18 },
  taxAmount: Number,
  grandTotal: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['Draft', 'Open', 'Delivered', 'Billed', 'Cancelled'], default: 'Open' },
  createdBy: String
}, { timestamps: true });

salesOrderSchema.pre('save', function(next) {
  if (!this.orderNo) this.orderNo = 'SO-' + Date.now().toString().slice(-8);
  this.netValue = this.lineItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  this.lineItems.forEach(i => i.netValue = i.quantity * i.unitPrice);
  this.taxAmount = parseFloat((this.netValue * this.taxPercent / 100).toFixed(2));
  this.grandTotal = parseFloat((this.netValue + this.taxAmount).toFixed(2));
  next();
});

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
