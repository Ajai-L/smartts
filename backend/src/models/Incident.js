import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    respondersNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    source: { type: String, enum: ['hardware', 'manual', 'sms-fallback', 'ai-geofence'], required: true },
    status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
    riskScore: { type: Number, default: 0 },
    reason: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere', status: 1, createdAt: -1 });

export default mongoose.model('Incident', incidentSchema);
