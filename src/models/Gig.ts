import mongoose, { Document, Schema } from 'mongoose';

export interface IGig extends Document {
  title: string;
  description: string;
  budget: number;
  ownerId: mongoose.Types.ObjectId;
  status: 'open' | 'assigned';
  createdAt: Date;
  updatedAt: Date;
}

const gigSchema = new Schema<IGig>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'assigned'], default: 'open' },
}, {
  timestamps: true,
});

export default mongoose.model<IGig>('Gig', gigSchema);
