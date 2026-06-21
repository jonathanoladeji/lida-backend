const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phoneNumber: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  neighbourhood: { type: String, required: true },
  addressDescription: { type: String },
  agreedToRules: { type: Boolean, required: true, default: false },
  role: { type: String, enum: ['resident', 'admin'], default: 'resident' },
  isSuspended: { type: Boolean, default: false },
  suspendedReason: { type: String },
  avatar: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
