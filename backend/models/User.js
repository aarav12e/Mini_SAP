const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, uppercase: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ADMIN', 'HR', 'FINANCE', 'SALES', 'INVENTORY', 'VIEWER'], default: 'VIEWER' },
  client: { type: String, default: '100' },
  language: { type: String, default: 'EN' },
  isLocked: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
