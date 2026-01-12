import mongoose, { Document, Schema } from 'mongoose';

export interface IBid extends Document {
  gigId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>({
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'hired', 'rejected', 'withdrawn'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.model<IBid>('Bid', bidSchema);
