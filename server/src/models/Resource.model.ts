import mongoose, { Document, Schema } from 'mongoose';

export type MuscleGroup =
  | 'abs' | 'chest' | 'back' | 'legs' | 'glutes'
  | 'biceps' | 'triceps' | 'front_deltoid' | 'mid_deltoid' | 'rear_deltoid';

export type Equipment =
  | 'bodyweight' | 'dumbbell' | 'barbell' | 'resistance_band' | 'gym_machine';

export type Sport = 'yoga' | 'cardio' | 'boxing' | 'stretching';

export type ResourceType = 'video' | 'article';

export interface IResource extends Document {
  title: string;
  description: string;
  type: ResourceType;
  thumbnailUrl: string;
  videoUrl?: string;
  duration?: number;          // phút
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  sport: Sport[];
  viewsCount: number;
  favoritesCount: number;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type:        { type: String, enum: ['video', 'article'], default: 'video' },
    thumbnailUrl:{ type: String, default: '' },
    videoUrl:    { type: String, default: '' },
    duration:    { type: Number, default: 0 },
    muscleGroups:{ type: [String], default: [] },
    equipment:   { type: [String], default: [] },
    sport:       { type: [String], default: [] },
    viewsCount:  { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IResource>('Resource', ResourceSchema);
