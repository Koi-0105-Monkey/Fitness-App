import { Request, Response } from 'express';
import Workout from '../models/Workout.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Lấy danh sách Workout (Có hỗ trợ lọc theo level)
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.query;
  const filter: any = {};

  if (level) {
    filter.level = level;
  }

  let workouts = await Workout.find(filter);
  
  // Shuffle ngẫu nhiên bài tập (tạm thời theo ý bạn)
  workouts = workouts.sort(() => Math.random() - 0.5);

  sendSuccess(res, workouts, 'Lấy danh sách bài tập thành công');
});

// @desc    Lấy bài tập Training of the day (Bài tập mới nhất hoặc ngẫu nhiên từ DB)
// @route   GET /api/workouts/training-of-day
// @access  Private
export const getTrainingOfDay = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.query;
  const filter: any = {};
  if (level) {
    filter.level = level;
  }

  // Ưu tiên lấy những bài tập mới được thêm vào (mới nhất) theo level
  const recentWorkouts = await Workout.find(filter).sort({ createdAt: -1 }).limit(10);
  
  if (recentWorkouts.length === 0) {
    return sendError(res, 'Không có bài tập nào', 404);
  }

  // Tạo một seed dựa trên ngày hiện tại (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }

  // Chọn bài tập dựa trên seed để mỗi ngày đổi 1 bài trong top 10 bài mới nhất
  const index = seed % recentWorkouts.length;
  const trainingOfDay = recentWorkouts[index];

  sendSuccess(res, trainingOfDay, 'Lấy Training of the day thành công');
});

// @desc    Lấy chi tiết 1 Khoá tập
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkoutById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const workout = await Workout.findById(id);
  if (!workout) {
    return sendError(res, 'Không tìm thấy bài tập', 404);
  }

  sendSuccess(res, workout, 'Lấy chi tiết bài tập thành công');
});

// @desc    API ẩn để tạo dữ liệu giả (Seed Data) test UI
// @route   POST /api/workouts/seed
// @access  Private
// @desc    Tạo bài tập mới
// @route   POST /api/workouts
// @access  Private (Admin)
export const createWorkout = asyncHandler(async (req: Request, res: Response) => {
  const workoutData = req.body;
  
  // Mongoose middleware sẽ tự động tính exercisesCount nếu ta truyền rounds
  const newWorkout = new Workout(workoutData);
  await newWorkout.save();
  
  sendSuccess(res, newWorkout, 'Tạo bài tập mới thành công', 201);
});

export const seedWorkouts = asyncHandler(async (req: Request, res: Response) => {
  await Workout.deleteMany(); // Xoá data cũ
  
  const dummyWorkouts = [
    {
      title: "Functional Training",
      description: "A complete functional training program to improve mobility and strength.",
      level: "beginner",
      duration: 45,
      calories: 450,
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      playsCount: 1500,
      rounds: [
        {
          roundName: "Round 1",
          exercises: [
            { name: "Dumbbell Rows", duration: "00:30", reps: "repetition 3x", description: "Target your back muscles with controlled rows.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Russian Twists", duration: "00:15", reps: "repetition 2x", description: "Core rotation exercise for obliques.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Squats", duration: "00:30", reps: "repetition 3x", description: "Basic squat to build lower body strength.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        },
        {
          roundName: "Round 2",
          exercises: [
            { name: "Tabata Intervals", duration: "00:10", reps: "repetition 2x", description: "High intensity interval training.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Bicycle Crunches", duration: "00:10", reps: "repetition 4x", description: "Classic ab exercise for a strong core.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    },
    {
      title: "Upper Body Power",
      description: "Intense upper body workout for strength and hypertrophy.",
      level: "advanced",
      duration: 60,
      calories: 800,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      playsCount: 2200,
      rounds: [
        {
          roundName: "Strength Phase",
          exercises: [
            { name: "Push Ups", duration: "01:00", reps: "30 reps", description: "Standard push ups for chest and triceps.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Diamond Push Ups", duration: "00:45", reps: "15 reps", description: "Close grip for tricep focus.", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    },
    {
      title: "Glutes & Abs",
      description: "Target your core and lower body with specific movements.",
      level: "intermediate",
      duration: 25,
      calories: 320,
      imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c64b52d3?w=800&q=80",
      playsCount: 950,
      rounds: [
        {
          roundName: "Core Focus",
          exercises: [
            { name: "Glute Bridges", duration: "00:45", reps: "repetition 3x", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Plank", duration: "01:00", reps: "1x", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    },
    {
      title: "Full Body Stretching",
      description: "Relax your muscles and improve flexibility after a long day.",
      level: "beginner",
      duration: 15,
      calories: 120,
      imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80",
      playsCount: 3100,
      rounds: [
        {
          roundName: "Warm Up",
          exercises: [
            { name: "Neck Rolls", duration: "00:30", reps: "5x each side", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Arm Circles", duration: "00:30", reps: "10x each way", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    },
    {
      title: "HIIT Cardio",
      description: "High Intensity Interval Training to burn maximum calories.",
      level: "advanced",
      duration: 30,
      calories: 600,
      imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831da60a?w=800&q=80",
      playsCount: 1800,
      rounds: [
        {
          roundName: "Intense Bursts",
          exercises: [
            { name: "Mountain Climbers", duration: "00:45", reps: "3x", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
            { name: "Burpees", duration: "00:30", reps: "3x", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    },
    {
      title: "Morning Yoga",
      description: "Start your day with energy and mindfulness.",
      level: "beginner",
      duration: 20,
      calories: 150,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
      playsCount: 2500,
      rounds: [
        {
          roundName: "Flow",
          exercises: [
            { name: "Sun Salutation", duration: "05:00", reps: "5x", videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }
          ]
        }
      ]
    }
  ];

  await Workout.insertMany(dummyWorkouts);
  sendSuccess(res, null, 'Đã bơm dữ liệu mẫu Workout (Real Images & Videos) thành công!');
});
