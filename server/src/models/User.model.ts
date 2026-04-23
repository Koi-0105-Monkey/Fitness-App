import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type FitnessGoal = 'lose_weight' | 'gain_weight' | 'muscle_mass' | 'shape_body';
export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'other';

export interface IUser extends Document {
  fullName: string;
  nickname?: string;
  email?: string; // Không bắt buộc nếu đăng ký bằng SDT
  mobileNumber?: string;
  password?: string; // Không bắt buộc nếu Social Login
  authProvider: 'local' | 'google' | 'facebook';
  providerId?: string; // ID trả về từ Google/Facebook
  dateOfBirth?: string;
  gender?: Gender;
  age?: number;
  weight?: number;
  height?: number;
  goal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  avatarUrl?: string;
  isSetupComplete: boolean;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    nickname: { type: String, trim: true },
    // email và mobileNumber dùng sparse: true để cho phép bỏ trống nhưng nếu có thì phải duy nhất
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    mobileNumber: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, select: false },
    authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    providerId: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    age: { type: Number },
    weight: { type: Number },    // kg
    height: { type: Number },    // cm
    goal: { type: String, enum: ['lose_weight', 'gain_weight', 'muscle_mass', 'shape_body'] },
    activityLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    avatarUrl: { type: String },
    isSetupComplete: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password trước khi save (Mongoose v6+ không cần next callback)
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method so sánh password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
