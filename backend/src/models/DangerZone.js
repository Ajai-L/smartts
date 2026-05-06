import mongoose from 'mongoose';

const dangerZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    severity: { type: Number, min: 1, max: 10, default: 5 },
    radiusMeters: { type: Number, required: true, min: 100 },
    center: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    isActive: { type: Boolean, default: true },
    advisoryMessages: {
      en: { type: String, required: true },
      es: { type: String, default: '' },
      fr: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

dangerZoneSchema.index({ center: '2dsphere', isActive: 1 });

export default mongoose.model('DangerZone', dangerZoneSchema);
