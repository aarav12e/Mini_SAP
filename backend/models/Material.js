const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialNo: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  materialType: { type: String, enum: ['RAW', 'FG', 'SFG', 'SPARE', 'SERVICE'], default: 'RAW' },
  materialGroup: String,
  uom: { type: String, default: 'EA' },
  plant: { type: String, default: '1000' },
  storageLocation: { type: String, default: '0001' },
  unrestricted: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  valClass: String,
  mrpType: { type: String, default: 'PD' }
}, { timestamps: true });

materialSchema.virtual('available').get(function() {
  return this.unrestricted - this.reserved;
});

materialSchema.virtual('isBelowReorder').get(function() {
  return this.unrestricted < this.reorderPoint;
});

module.exports = mongoose.model('Material', materialSchema);
