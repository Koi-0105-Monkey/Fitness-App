import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in environment variables');

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas connected');

    // Dọn dẹp index cũ cho Favorite collection
    try {
      const Favorite = mongoose.connection.collection('favorites');
      await Favorite.dropIndexes();
      console.log('🧹 Old Favorite indexes cleaned up');
    } catch (e) {
      // Bỏ qua nếu collection chưa tồn tại
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
