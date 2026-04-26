import mongoose, { Document, Schema } from 'mongoose';

export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';

// Interface cho Bài tập nhỏ (Exercise)
export interface IExercise {
  name: string;
  duration: string; // VD: '00:30' hoặc '30 seconds' (Dùng đếm ngược)
  reps: string; // VD: 'repetition 3x' hoặc '3 Rep'
  videoUrl?: string; // Link phát video bài tập
  videoDuration?: string; // Thời lượng video (hiển thị cho user biết video dài bao lâu)
  fitMode?: 'contain' | 'cover'; // Chế độ hiển thị video
  description?: string; // Mô tả cách tập
}

// Interface cho Hiệp tập (Round)
export interface IRound {
  roundName: string; // VD: 'Round 1'
  exercises: IExercise[];
}

// Interface cho Khóa tập (Workout)
export interface IWorkout extends Document {
  title: string;
  description: string;
  level: WorkoutLevel;
  duration: number; // Tổng phút, VD: 45
  calories: number; // Kcal, VD: 1450
  exercisesCount: number; // Tổng số bài tập
  imageUrl: string; // Ảnh thumbnail
  playsCount: number; // Dùng để chọn "Training of the day"
  rounds: IRound[];
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  duration: { type: String, default: '' },
  reps: { type: String, default: '' },
  videoUrl: { type: String },
  videoDuration: { type: String },
  fitMode: { type: String, enum: ['contain', 'cover'], default: 'contain' },
  description: { type: String },
});

const RoundSchema = new Schema<IRound>({
  roundName: { type: String, required: true },
  exercises: [ExerciseSchema],
});

const WorkoutSchema = new Schema<IWorkout>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'], 
      required: true 
    },
    duration: { type: Number, required: true },
    calories: { type: Number, required: true },
    exercisesCount: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true },
    playsCount: { type: Number, default: 0 },
    rounds: [RoundSchema],
  },
  { timestamps: true }
);

// Tự động tính tổng exercisesCount trước khi lưu nếu chưa có
WorkoutSchema.pre('save', function () {
  if (this.rounds && this.rounds.length > 0) {
    let total = 0;
    this.rounds.forEach(round => {
      total += round.exercises.length;
    });
    this.exercisesCount = total;
  }
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
