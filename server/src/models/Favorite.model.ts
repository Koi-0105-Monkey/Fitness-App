import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  workout: mongoose.Types.ObjectId;
  addedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Unique constraint: mỗi user chỉ favorite 1 workout 1 lần
FavoriteSchema.index({ user: 1, workout: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
