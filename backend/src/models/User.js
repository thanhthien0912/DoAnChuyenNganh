const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'user', 'admin', 'manager'],
    default: 'student'
  },
  profile: {
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Query middleware to only show active users
userSchema.pre(/^find/, function(next) {
  this.find({ isActive: true });
  next();
});

// Static methods
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.getUsersByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);