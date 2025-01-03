import mongoose from 'mongoose';

const vpnLogSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  isVpn: {
    type: Boolean,
    required: true
  },
  details: {
    org: String,
    company: String,
    hostname: String,
    city: String,
    region: String,
    country: String
  },
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const VpnLog = mongoose.model('VpnLog', vpnLogSchema);