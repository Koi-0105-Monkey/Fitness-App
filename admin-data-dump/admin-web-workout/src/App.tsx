import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Image as ImageIcon, Video, 
  CheckCircle2, AlertCircle, Dumbbell, 
  ChevronRight, Save, Loader2, X, Edit2 
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// ─── Resource Constants ──────────────────────────────────────────────────────
const MUSCLE_GROUPS = [
  { value: 'abs',           label: 'Abs' },
  { value: 'chest',         label: 'Chest' },
  { value: 'back',          label: 'Back' },
  { value: 'legs',          label: 'Legs' },
  { value: 'glutes',        label: 'Glutes' },
  { value: 'biceps',        label: 'Biceps' },
  { value: 'triceps',       label: 'Triceps' },
  { value: 'front_deltoid', label: 'Front Deltoid' },
  { value: 'mid_deltoid',   label: 'Mid Deltoid' },
  { value: 'rear_deltoid',  label: 'Rear Deltoid' },
];

const EQUIPMENT_LIST = [
  { value: 'bodyweight',     label: 'Bodyweight' },
  { value: 'dumbbell',       label: 'Dumbbell' },
  { value: 'barbell',        label: 'Barbell' },
  { value: 'resistance_band',label: 'Resistance Band' },
  { value: 'gym_machine',    label: 'Gym Machine' },
];

const SPORTS = [
  { value: 'yoga',       label: 'Yoga' },
  { value: 'cardio',     label: 'Cardio' },
  { value: 'boxing',     label: 'Boxing' },
  { value: 'stretching', label: 'Stretching' },
];

interface Exercise {
  id: string;
  name: string;
  sets: number;
  duration: string;
  reps: string;
  videoUrl: string;
  videoDuration?: string;
  fitMode?: 'contain' | 'cover';
  description: string;
}

interface Round {
  roundName: string;
  exercises: Exercise[];
}

interface Workout {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  imageUrl: string;
  rounds: Round[];
}

const DEFAULT_WORKOUT: Workout = {
  title: '',
  description: '',
  level: 'beginner',
  duration: 0,
  calories: 300,
  imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  rounds: [
    {
      roundName: 'Round 1',
      exercises: [
        { id: Math.random().toString(), name: '', sets: 1, duration: '', reps: '', videoUrl: '', videoDuration: '', description: '' }
      ]
    }
  ]
};

function App() {
  const [workout, setWorkout] = useState<Workout>(DEFAULT_WORKOUT);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [mockupScreen, setMockupScreen] = useState<'home' | 'detail'>('detail');
  
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [resourceLibrary, setResourceLibrary] = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<{ rIdx: number, eIdx: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Resource Form State
  const [showResourceForm, setShowResourceForm] = useState<{ rIdx: number, eIdx: number } | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'article',
    thumbnailUrl: '',
    videoUrl: '',
    duration: 0,
    muscleGroups: [] as string[],
    equipment: [] as string[],
    sport: [] as string[],
  });

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchResourceLibrary();
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${API_BASE}/workouts`);
      setWorkouts(data.data || []);
    } catch (e) {
      console.error('Error fetching workouts', e);
    } finally {
      setFetching(false);
    }
  };

  const handleEditWorkout = (w: any) => {
    setEditingId(w._id);
    setWorkout({
      title: w.title,
      description: w.description,
      level: w.level,
      duration: w.duration,
      calories: w.calories,
      imageUrl: w.imageUrl,
      rounds: w.rounds.map((r: any) => ({
        ...r,
        exercises: r.exercises.map((ex: any) => ({
          ...ex,
          id: ex._id || Math.random().toString()
        }))
      }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await axios.delete(`${API_BASE}/workouts/${id}`);
      fetchWorkouts();
      setMessage({ type: 'success', text: 'Workout deleted!' });
    } catch {
      setMessage({ type: 'error', text: 'Error deleting workout' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setWorkout(DEFAULT_WORKOUT);
  };

  const fetchResourceLibrary = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/resources`);
      setResourceLibrary(data.data || []);
    } catch (e) {
      console.error('Error fetching resource library', e);
    }
  };

  const handleSelectResource = (res: any, rIdx: number, eIdx: number) => {
    setWorkout(prev => {
      const nextW = { ...prev };
      nextW.rounds = [...prev.rounds];
      nextW.rounds[rIdx].exercises = [...prev.rounds[rIdx].exercises];
      
      const formatSecs = (sec: number) => {
        if (!sec) return '00:00';
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      nextW.rounds[rIdx].exercises[eIdx] = {
        ...nextW.rounds[rIdx].exercises[eIdx],
        name: res.title,
        videoUrl: res.videoUrl,
        videoDuration: formatSecs(res.duration),
        description: res.description
      };
      return nextW;
    });
    setActiveSearch(null);
    setSearchTerm('');
  };

  const calculateStats = (w: Workout) => {
    let totalSecs = 0;
    w.rounds.forEach(r => r.exercises.forEach(ex => {
      const parts = ex.duration.split(':');
      const sets = Number(ex.sets) || 1;
      if (parts.length === 2) {
        totalSecs += ((parseInt(parts[0]) * 60) + parseInt(parts[1])) * sets;
      }
    }));
    return Math.ceil(totalSecs / 60) || 1;
  };

  const handleCreateResource = async () => {
    if (!showResourceForm) return;
    if (!resourceForm.title) return setMessage({ type: 'error', text: 'Resource title is required' });
    
    try {
      setLoading(true);
      console.log('Creating resource with payload:', resourceForm);
      const { data } = await axios.post(`${API_BASE}/resources`, resourceForm);
      const newRes = data.data;
      console.log('Resource created successfully:', newRes);
      
      handleSelectResource(newRes, showResourceForm.rIdx, showResourceForm.eIdx);
      setShowResourceForm(null);
      setResourceForm({
        title: '', description: '', type: 'video', thumbnailUrl: '', videoUrl: '', duration: 0,
        muscleGroups: [], equipment: [], sport: [],
      });
      fetchResourceLibrary();
      setMessage({ type: 'success', text: 'Resource created and added to exercise!' });
    } catch (err: any) {
      console.error('Error creating resource:', err.response?.data || err.message);
      setMessage({ type: 'error', text: `Error: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, rIdx: number | null, eIdx: number | null) => {
    const uploadId = rIdx !== null && eIdx !== null ? `ex-${rIdx}-${eIdx}` : 'main';
    try {
      setUploading(uploadId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { url, duration } = response.data.data;
        
        setWorkout(prev => {
          const nextW = { ...prev };
          nextW.rounds = [...prev.rounds];

          if (rIdx !== null && eIdx !== null) {
            nextW.rounds[rIdx] = { ...prev.rounds[rIdx] };
            nextW.rounds[rIdx].exercises = [...prev.rounds[rIdx].exercises];
            nextW.rounds[rIdx].exercises[eIdx] = { 
              ...prev.rounds[rIdx].exercises[eIdx], 
              videoUrl: url 
            };
            
            if (duration) {
              const mins = Math.floor(duration / 60);
              const secs = Math.floor(duration % 60);
              nextW.rounds[rIdx].exercises[eIdx].videoDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
          } else {
            nextW.imageUrl = url;
          }

          nextW.duration = calculateStats(nextW);
          return nextW;
        });

        setMessage({ type: 'success', text: 'Upload thành công!' });
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setMessage({ type: 'error', text: 'Lỗi khi upload file. Kiểm tra lại Server và CORS.' });
    } finally {
      setUploading(null);
    }
  };

  const addRound = () => {
    setWorkout({
      ...workout,
      rounds: [...workout.rounds, {
        roundName: `Round ${workout.rounds.length + 1}`,
        exercises: [{ id: Math.random().toString(), name: '', sets: 1, duration: '', reps: '', videoUrl: '', videoDuration: '', fitMode: 'contain', description: '' }]
      }]
    });
  };

  const removeRound = (idx: number) => {
    if (workout.rounds.length <= 1) return;
    const nextRounds = workout.rounds.filter((_, i) => i !== idx);
    const nextW = { ...workout, rounds: nextRounds };
    setWorkout(nextW);
  };

  const addExercise = (rIdx: number) => {
    const nextRounds = [...workout.rounds];
    nextRounds[rIdx].exercises.push({
      id: Math.random().toString(),
      name: '', sets: 1, duration: '', reps: '', videoUrl: '', videoDuration: '', fitMode: 'contain', description: ''
    });
    setWorkout({ ...workout, rounds: nextRounds });
  };

  const removeExercise = (rIdx: number, eIdx: number) => {
    const nextRounds = [...workout.rounds];
    nextRounds[rIdx].exercises.splice(eIdx, 1);
    const nextW = { ...workout, rounds: nextRounds };
    setWorkout(nextW);
  };

  const handleSave = async () => {
    if (!workout.title) return setMessage({ type: 'error', text: 'Vui lòng nhập tên bài tập' });
    if (!workout.description) return setMessage({ type: 'error', text: 'Vui lòng nhập mô tả bài tập' });
    
    try {
      setLoading(true);
      
      // Tính toán lại tổng số bài tập để đảm bảo đồng bộ với DB
      let totalExercises = 0;
      const cleanRounds = workout.rounds.map(r => {
        const cleanExs = r.exercises
          .filter(ex => ex.name.trim() !== '')
          .map(ex => ({
            name: ex.name.trim(),
            sets: Number(ex.sets) || 1,
            reps: ex.reps.trim(),
            duration: ex.duration.trim(),
            videoUrl: ex.videoUrl,
            videoDuration: ex.videoDuration,
            fitMode: ex.fitMode || 'contain',
            description: ex.description
          }));
        totalExercises += cleanExs.length;
        return {
          roundName: r.roundName,
          exercises: cleanExs
        };
      }).filter(r => r.exercises.length > 0);

      if (cleanRounds.length === 0) {
        throw new Error('Cần ít nhất 1 bài tập hợp lệ');
      }

      const finalPayload = {
        ...workout,
        rounds: cleanRounds,
        exercisesCount: totalExercises
      };

      if (editingId) {
        await axios.put(`${API_BASE}/workouts/${editingId}`, finalPayload);
        setMessage({ type: 'success', text: 'Đã cập nhật bài tập thành công!' });
      } else {
        await axios.post(`${API_BASE}/workouts`, finalPayload);
        setMessage({ type: 'success', text: 'Đã lưu bài tập mới thành công!' });
      }
      
      resetForm();
      fetchWorkouts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Lỗi khi lưu bài tập' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ marginTop: 20, color: 'var(--primary)', fontWeight: 600 }}>Đang lưu bài tập...</p>
        </div>
      )}

      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div className="logo-box"><Dumbbell color="black" /></div>
          <h1>{editingId ? 'EDIT WORKOUT' : 'FITBODY ADMIN'}</h1>
          {editingId && <button className="btn-add" style={{width: 'auto', margin: 0, padding: '4px 12px', fontSize: '0.8rem'}} onClick={resetForm}>Create New</button>}
        </div>
        <button className="btn-save" style={{ width: 'auto', padding: '12px 30px' }} onClick={handleSave}>
          <Save size={20} style={{ marginRight: 10 }} />
          {editingId ? 'CẬP NHẬT' : 'LƯU BÀI TẬP'}
        </button>
      </div>

      <div className="main-content">
        <section className="section-card">
          <h2 className="section-title"><ImageIcon size={20} /> Thông tin chung</h2>
          
          <div className="image-picker" onClick={() => document.getElementById('main-file')?.click()}>
            <input 
              type="file" id="main-file" hidden 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], null, null)} 
            />
            {uploading === 'main' ? (
              <Loader2 className="spinner" />
            ) : (
              <>
                <img src={workout.imageUrl} alt="Preview" className="image-preview" />
                <div className="image-overlay">
                  <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Thay đổi ảnh đại diện</p>
                </div>
              </>
            )}
          </div>

          <div className="form-group" style={{ marginTop: 25 }}>
            <label className="label">Tên bài tập</label>
            <input 
              className="input" placeholder="VD: Full Body Workout" 
              value={workout.title} onChange={(e) => setWorkout({ ...workout, title: e.target.value })}
            />
          </div>

          <div className="row">
            <div className="form-group">
              <label className="label">Cấp độ</label>
              <div className="level-selector">
                {['beginner', 'intermediate', 'advanced'].map(l => (
                  <button 
                    key={l}
                    className={`level-btn ${workout.level === l ? 'active' : ''}`}
                    onClick={() => setWorkout({ ...workout, level: l as any })}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Thời lượng (Phút)</label>
              <input 
                className="input" type="number" 
                value={workout.duration} onChange={(e) => setWorkout({ ...workout, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label className="label">Calories (Kcal)</label>
              <input 
                className="input" type="number" 
                value={workout.calories} onChange={(e) => setWorkout({ ...workout, calories: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Mô tả</label>
            <textarea 
              className="textarea" rows={4} placeholder="Nhập mô tả chi tiết..."
              value={workout.description} onChange={(e) => setWorkout({ ...workout, description: e.target.value })}
            />
          </div>
        </section>

        {workout.rounds.map((round, rIdx) => (
          <div key={rIdx} className="round-item animate-fade-in">
            <div className="round-header">
              <input 
                className="round-name-input" value={round.roundName}
                onChange={(e) => {
                  const nextR = [...workout.rounds];
                  nextR[rIdx].roundName = e.target.value;
                  setWorkout({ ...workout, rounds: nextR });
                }}
              />
              <button className="btn-delete" onClick={() => removeRound(rIdx)}><Trash2 size={18} /></button>
            </div>

            {round.exercises.map((ex, eIdx) => (
              <div key={ex.id} className="exercise-card">
                <div className="exercise-media" onClick={() => document.getElementById(`ex-file-${rIdx}-${eIdx}`)?.click()}>
                  <input 
                    type="file" id={`ex-file-${rIdx}-${eIdx}`} hidden 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], rIdx, eIdx)} 
                  />
                  {uploading === `ex-${rIdx}-${eIdx}` ? (
                    <Loader2 className="spinner" size={24} />
                  ) : ex.videoUrl ? (
                    <video src={ex.videoUrl} />
                  ) : (
                    <Video size={24} color="var(--text-dim)" />
                  )}
                </div>

                <div className="exercise-info">
                  <div className="row" style={{ marginBottom: 10, gap: 10, position: 'relative' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        className="input" style={{ padding: '8px 12px' }} 
                        placeholder="Tên động tác (hoặc tìm trong thư viện)" value={ex.name}
                        onFocus={() => setActiveSearch({ rIdx, eIdx })}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          const nextR = [...workout.rounds];
                          nextR[rIdx].exercises[eIdx].name = e.target.value;
                          setWorkout({ ...workout, rounds: nextR });
                        }}
                      />
                      {activeSearch?.rIdx === rIdx && activeSearch?.eIdx === eIdx && (
                        <div className="search-dropdown animate-fade-in">
                          <div className="search-header">
                            <span>Library Suggestions</span>
                            <button onClick={() => setActiveSearch(null)}><X size={14} /></button>
                          </div>
                          <div className="search-results">
                            {resourceLibrary
                              .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
                              .slice(0, 5)
                              .map(res => (
                                <div key={res._id} className="search-item" onClick={() => handleSelectResource(res, rIdx, eIdx)}>
                                  <img src={res.thumbnailUrl} alt="" />
                                  <div>
                                    <p className="s-title">{res.title}</p>
                                    <p className="s-meta">{res.type} • {Math.round(res.duration)}s</p>
                                  </div>
                                </div>
                              ))}
                            <div className="search-footer">
                              <button 
                                className="btn-create-new-res"
                                onClick={() => {
                                  setResourceForm(prev => ({ ...prev, title: searchTerm }));
                                  setShowResourceForm({ rIdx, eIdx });
                                  setActiveSearch(null);
                                }}
                              >
                                <Plus size={14} /> Can't find it? Create New Resource
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ flex: 0.5 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Sets</label>
                      <input 
                        className="input" style={{ padding: '8px 12px' }} type="text"
                        placeholder="1" value={ex.sets || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const nextR = [...workout.rounds];
                          nextR[rIdx].exercises[eIdx].sets = val ? parseInt(val) : 0;
                          setWorkout({ ...workout, rounds: nextR });
                        }}
                      />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Cường độ (Reps / Time)</label>
                      <div className="intensity-controls">
                        <div className="type-toggle">
                          <button 
                            className={!ex.reps.includes('s') && !ex.reps.includes('m') ? 'active' : ''}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            onClick={() => {
                              const nextR = [...workout.rounds];
                              const val = nextR[rIdx].exercises[eIdx].reps.replace(/[^0-9]/g, '') || '12';
                              nextR[rIdx].exercises[eIdx].reps = val + ' reps';
                              setWorkout({ ...workout, rounds: nextR });
                            }}
                          >Reps</button>
                          <button 
                            className={ex.reps.includes('s') || ex.reps.includes('m') ? 'active' : ''}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            onClick={() => {
                              const nextR = [...workout.rounds];
                              const val = nextR[rIdx].exercises[eIdx].reps.replace(/[^0-9]/g, '') || '30';
                              nextR[rIdx].exercises[eIdx].reps = val + 's';
                              setWorkout({ ...workout, rounds: nextR });
                            }}
                          >Time</button>
                        </div>
                        
                        <div className="value-input-group">
                          <input 
                            className="input mini-input" type="number"
                            style={{ width: '70px', padding: '8px' }}
                            value={ex.reps.replace(/[^0-9]/g, '')}
                            placeholder="0"
                            onChange={(e) => {
                              const val = e.target.value;
                              const nextR = [...workout.rounds];
                              const current = nextR[rIdx].exercises[eIdx].reps;
                              if (current.includes('s')) nextR[rIdx].exercises[eIdx].reps = val + 's';
                              else if (current.includes('m')) nextR[rIdx].exercises[eIdx].reps = val + 'm';
                              else nextR[rIdx].exercises[eIdx].reps = val + ' reps';
                              setWorkout({ ...workout, rounds: nextR });
                            }}
                          />
                          {(ex.reps.includes('s') || ex.reps.includes('m')) ? (
                            <select 
                              className="unit-select"
                              style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}
                              value={ex.reps.includes('m') ? 'm' : 's'}
                              onChange={(e) => {
                                const unit = e.target.value;
                                const val = ex.reps.replace(/[^0-9]/g, '');
                                const nextR = [...workout.rounds];
                                nextR[rIdx].exercises[eIdx].reps = val + unit;
                                setWorkout({ ...workout, rounds: nextR });
                              }}
                            >
                              <option value="s">sec</option>
                              <option value="m">min</option>
                            </select>
                          ) : (
                            <span className="unit-label" style={{ fontSize: '0.9rem' }}>reps</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Chế độ hiển thị</label>
                      <div className="level-selector">
                        {[
                          { id: 'contain', label: 'Xem toàn bộ' },
                          { id: 'cover', label: 'Lấp đầy khung' }
                        ].map(f => (
                          <button 
                            key={f.id}
                            className={`level-btn ${ex.fitMode === f.id ? 'active' : ''}`}
                            style={{ fontSize: '0.7rem', padding: '6px' }}
                            onClick={() => {
                              const nextR = [...workout.rounds];
                              nextR[rIdx].exercises[eIdx].fitMode = f.id as any;
                              setWorkout({ ...workout, rounds: nextR });
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea 
                    className="textarea" style={{ marginTop: 10, padding: '8px 12px', fontSize: '0.85rem' }} 
                    placeholder="Mô tả động tác..." rows={2}
                    value={ex.description}
                    onChange={(e) => {
                      const nextR = [...workout.rounds];
                      nextR[rIdx].exercises[eIdx].description = e.target.value;
                      setWorkout({ ...workout, rounds: nextR });
                    }}
                  />
                </div>

                <button className="btn-delete" onClick={() => removeExercise(rIdx, eIdx)}><Trash2 size={18} /></button>
              </div>
            ))}

            <button className="btn-add" onClick={() => addExercise(rIdx)}>+ THÊM ĐỘNG TÁC</button>
          </div>
        ))}

        <button className="btn-add" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', padding: 20 }} onClick={addRound}>
          + THÊM ROUND MỚI
        </button>
      </div>

      <div className="preview-sidebar">
        <h2 className="section-title">MANAGE WORKOUTS</h2>
        <div className="workout-manager-list" style={{ marginBottom: 20 }}>
          {fetching ? <Loader2 className="spin" /> : workouts.map(w => (
            <div key={w._id} className={`mini-workout-card ${editingId === w._id ? 'active' : ''}`}>
              <img src={w.imageUrl} alt="" />
              <div className="mini-info">
                <p className="mini-title">{w.title}</p>
                <p className="mini-meta">{w.level} • {w.rounds.length} rounds</p>
              </div>
              <div className="mini-actions">
                <button onClick={() => handleEditWorkout(w)} title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDeleteWorkout(w._id)} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {!fetching && workouts.length === 0 && <p style={{color: 'var(--text-dim)', fontSize: '0.8rem', textAlign: 'center'}}>No workouts found.</p>}
        </div>

        <h2 className="section-title">MOBILE REAL-TIME MOCKUP</h2>
        
        <div className="mobile-frame">
          {/* Status Bar */}
          <div className="status-bar">
            <span>16:04</span>
            <div className="status-icons">
              <div className="i-signal"></div>
              <div className="i-wifi"></div>
              <div className="i-battery"></div>
            </div>
          </div>

          <div className="mobile-scroll">
            {mockupScreen === 'home' ? (
              <div className="mock-home animate-fade-in">
                <div className="mock-nav">
                  <ChevronRight size={20} style={{ transform: 'rotate(180deg)', color: '#896CFE' }} />
                  <span className="mock-nav-title">Workout</span>
                  <div className="mock-nav-icons">
                    <div className="mock-icon-dot"></div>
                    <div className="mock-icon-dot"></div>
                    <div className="mock-icon-dot profile"></div>
                  </div>
                </div>

                <div className="mock-filters">
                  <div className={`mock-filter ${workout.level === 'beginner' ? 'active' : ''}`}>Beginner</div>
                  <div className={`mock-filter ${workout.level === 'intermediate' ? 'active' : ''}`}>Intermediate</div>
                  <div className={`mock-filter ${workout.level === 'advanced' ? 'active' : ''}`}>Advanced</div>
                </div>

                <div className="mock-hero-card" onClick={() => setMockupScreen('detail')}>
                  <img src={workout.imageUrl} alt="" />
                  <div className="mock-hero-tag">Training Of The Day</div>
                  <div className="mock-hero-info">
                    <h3>{workout.title || 'Your Workout'}</h3>
                    <p>● {workout.duration} Mins  ● {workout.calories} Kcal  ● {workout.rounds.reduce((acc, r) => acc + r.exercises.length, 0)} Exercises</p>
                  </div>
                  <div className="mock-hero-star">★</div>
                </div>

                <div className="mock-list-section">
                  <h4>Let's Go {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}</h4>
                  <p>Explore Different Workout Styles</p>
                  
                  <div className="mock-list-item">
                    <div className="mock-item-text">
                      <h5>{workout.title || 'Your Workout'}</h5>
                      <span>● {workout.duration} Mins ● {workout.calories} Kcal</span>
                      <span>● {workout.rounds.reduce((acc, r) => acc + r.exercises.length, 0)} Exercises</span>
                    </div>
                    <img src={workout.imageUrl} alt="" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mock-detail animate-fade-in">
                <div className="mobile-header">
                  <img src={workout.imageUrl} className="mobile-header-img" alt="" />
                  <div className="mock-back-btn" onClick={() => setMockupScreen('home')}>
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div className="mobile-stats-overlay">
                    <h2 className="mobile-title">{workout.title || 'Workout Title'}</h2>
                    <div className="mobile-stats-row">
                      <span>{workout.duration} Mins</span>
                      <div className="dot" style={{ background: 'white' }}></div>
                      <span>{workout.calories} Kcal</span>
                      <div className="dot" style={{ background: 'white' }}></div>
                      <span style={{ textTransform: 'capitalize' }}>{workout.level}</span>
                    </div>
                  </div>
                </div>

                <div className="mobile-description" style={{ padding: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {workout.description || 'No description provided.'}
                </div>

                {workout.rounds.map((round, rIdx) => (
                  <div key={rIdx} className="mobile-round-block">
                    <h3 className="mobile-round-title">{round.roundName}</h3>
                    {round.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="mobile-exercise-card" onClick={() => ex.videoUrl && setPreviewVideo(ex.videoUrl)}>
                        <div className="mobile-play-btn">
                          <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid white', marginLeft: 4 }}></div>
                        </div>
                        <div className="mobile-ex-info">
                          <p className="mobile-ex-name">{ex.name || 'Name'}</p>
                          <p className="mobile-ex-dur">{ex.videoDuration || '00:00'}</p>
                        </div>
                        <div className="mobile-ex-reps">
                          {ex.sets > 1 ? `${ex.reps} x ${ex.sets} sets` : ex.reps}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewVideo && (
            <div className="video-preview-overlay" onClick={() => setPreviewVideo(null)}>
              <button className="close-video" onClick={() => setPreviewVideo(null)}><X size={24} /></button>
              <video 
                src={previewVideo} autoPlay controls 
                className="preview-video-player" 
                style={{ objectFit: workout.rounds.some(r => r.exercises.some(ex => ex.videoUrl === previewVideo && ex.fitMode === 'cover')) ? 'cover' : 'contain' }}
                onClick={e => e.stopPropagation()} 
              />
            </div>
          )}
        </div>
      </div>

      {/* ── RESOURCE FORM MODAL ── */}
      {showResourceForm && (
        <div className="res-modal-overlay">
          <div className="res-modal-card animate-scale-up">
            <div className="modal-header">
              <h3>Create New Resource</h3>
              <button onClick={() => setShowResourceForm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Title *</label>
                <input 
                  className="input" value={resourceForm.title} 
                  onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea 
                  className="textarea" rows={3} value={resourceForm.description}
                  onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="form-group">
                  <label className="label">Type</label>
                  <select 
                    className="input" value={resourceForm.type}
                    onChange={e => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                  >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                  </select>
                </div>
              </div>

              {/* Resource Media Upload & Thumbnail Picker */}
              <div className="form-group">
                <label className="label">Video minh họa</label>
                {!resourceForm.videoUrl ? (
                  <div className="upload-placeholder" onClick={() => document.getElementById('modal-upload-file')?.click()}>
                    {uploading === 'modal' ? <Loader2 className="spin" /> : <Video size={32} />}
                    <p>Nhấn để tải video lên</p>
                    <input 
                      type="file" id="modal-upload-file" hidden accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploading('modal');
                          const fd = new FormData();
                          fd.append('file', file);
                          const { data } = await axios.post(`${API_BASE}/upload`, fd);
                          const url = data.data.url;
                          const duration = data.data.duration;
                          
                          // Initial thumb at 1s
                          let thumb = url;
                          if (url.includes('cloudinary.com')) {
                            thumb = url.replace('/video/upload/', '/video/upload/so_1/').replace(/\.[^/.]+$/, '.jpg');
                          }

                          setResourceForm(prev => ({ 
                            ...prev, 
                            videoUrl: url, 
                            thumbnailUrl: thumb,
                            duration: duration ? Math.round(duration) : prev.duration
                          }));
                        } finally { setUploading(null); }
                      }}
                    />
                  </div>
                ) : (
                  <div className="video-picker-container">
                    <video 
                      id="thumb-picker-video"
                      src={resourceForm.videoUrl} 
                      controls 
                      className="picker-video"
                    />
                    <div className="picker-overlay">
                      <button 
                        className="btn-capture"
                        onClick={() => {
                          const v = document.getElementById('thumb-picker-video') as HTMLVideoElement;
                          if (v && resourceForm.videoUrl.includes('cloudinary.com')) {
                            const time = v.currentTime.toFixed(1);
                            const newThumb = resourceForm.videoUrl
                              .replace(/\/so_[0-9.]+\//, '/') // Remove old offset if exists
                              .replace('/video/upload/', `/video/upload/so_${time}/`)
                              .replace(/\.[^/.]+$/, '.jpg');
                            setResourceForm(prev => ({ ...prev, thumbnailUrl: newThumb }));
                            setMessage({ type: 'success', text: `Đã chọn khung hình tại ${time}s làm ảnh bìa!` });
                          }
                        }}
                      >
                        <ImageIcon size={16} /> Chọn khung hình này làm ảnh bìa
                      </button>
                      <button className="btn-change-video" onClick={() => setResourceForm(prev => ({ ...prev, videoUrl: '', thumbnailUrl: '' }))}>
                        Đổi video khác
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label">Ảnh đại diện đang chọn (Preview)</label>
                <div className="thumb-preview-box">
                  {resourceForm.thumbnailUrl ? (
                    <img src={resourceForm.thumbnailUrl} alt="Thumbnail Preview" />
                  ) : (
                    <div className="no-thumb">Chưa có ảnh bìa</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Thumbnail URL (Ảnh đại diện)</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    className="input" value={resourceForm.thumbnailUrl} 
                    placeholder="Link ảnh .jpg"
                    onChange={e => setResourceForm({ ...resourceForm, thumbnailUrl: e.target.value })} 
                  />
                  <button className="btn-add" style={{width: 'auto', margin: 0, padding: '0 15px'}} onClick={() => document.getElementById('thumb-upload')?.click()}>Upload</button>
                  <input 
                    type="file" id="thumb-upload" hidden accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploading('thumb');
                        const fd = new FormData();
                        fd.append('file', file);
                        const { data } = await axios.post(`${API_BASE}/upload`, fd);
                        setResourceForm(prev => ({ ...prev, thumbnailUrl: data.data.url }));
                      } finally { setUploading(null); }
                    }}
                  />
                </div>
                <p style={{fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 5}}>
                  Tip: Nếu dùng Cloudinary, bạn có thể đổi đuôi .mp4 thành .jpg và thêm /so_5/ (giây thứ 5) vào link video để lấy frame làm ảnh bìa.
                </p>
              </div>
              <div className="form-group">
                <label className="label">Muscle Groups</label>
                <div className="tag-cloud">
                  {MUSCLE_GROUPS.map(m => (
                    <button 
                      key={m.value}
                      className={`tag-chip ${resourceForm.muscleGroups.includes(m.value) ? 'active' : ''}`}
                      onClick={() => setResourceForm(prev => ({
                        ...prev,
                        muscleGroups: prev.muscleGroups.includes(m.value) ? prev.muscleGroups.filter(x => x !== m.value) : [...prev.muscleGroups, m.value]
                      }))}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Equipment</label>
                <div className="tag-cloud">
                  {EQUIPMENT_LIST.map(e => (
                    <button 
                      key={e.value}
                      className={`tag-chip ${resourceForm.equipment.includes(e.value) ? 'active' : ''}`}
                      onClick={() => setResourceForm(prev => ({
                        ...prev,
                        equipment: prev.equipment.includes(e.value) ? prev.equipment.filter(x => x !== e.value) : [...prev.equipment, e.value]
                      }))}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Sport</label>
                <div className="tag-cloud">
                  {SPORTS.map(s => (
                    <button 
                      key={s.value}
                      className={`tag-chip ${resourceForm.sport.includes(s.value) ? 'active' : ''}`}
                      onClick={() => setResourceForm(prev => ({
                        ...prev,
                        sport: prev.sport.includes(s.value) ? prev.sport.filter(x => x !== s.value) : [...prev.sport, s.value]
                      }))}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowResourceForm(null)}>Cancel</button>
              <button className="btn-save-resource" onClick={handleCreateResource} disabled={loading}>
                {loading ? <Loader2 className="spin" /> : <Save size={16} />}
                Save & Use
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .workout-manager-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 5px;
        }
        .mini-workout-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--input-bg);
          padding: 10px;
          border-radius: 12px;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .mini-workout-card.active { border-color: var(--primary); background: rgba(226, 241, 99, 0.05); }
        .mini-workout-card img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
        .mini-info { flex: 1; min-width: 0; }
        .mini-title { color: white; font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mini-meta { color: var(--text-dim); font-size: 0.7rem; text-transform: capitalize; }
        .mini-actions { display: flex; gap: 4px; }
        .mini-actions button { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; border-radius: 4px; }
        .mini-actions button:hover { color: var(--primary); background: rgba(255,255,255,0.05); }
        .mini-actions button[title="Delete"]:hover { color: var(--error); }
        .message-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1100;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideDown 0.3s ease-out;
        }
        .message-toast.success { background: var(--success); color: white; }
        .message-toast.error { background: var(--error); color: white; }
        @keyframes slideDown {
          from { top: -50px; opacity: 0; }
          to { top: 20px; opacity: 1; }
        }

        .search-footer { padding: 8px; border-top: 1px solid var(--border); background: rgba(255,255,255,0.02); }
        .mobile-play-btn { 
          width: 40px; height: 40px; background: #896CFE; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .mobile-play-btn video { width: 100%; height: 100%; object-fit: cover; }
        
        .video-preview-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.9); z-index: 3000; display: flex; align-items: center; justify-content: center;
        }
        .preview-video-player { width: 90%; max-height: 80%; border-radius: 12px; background: black; }
        .close-video { position: absolute; top: 30px; right: 30px; background: none; border: none; color: white; cursor: pointer; }
        .btn-create-new-res { 
          width: 100%; padding: 8px; border: 1px dashed var(--primary); 
          background: none; color: var(--primary); border-radius: 8px; 
          cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-create-new-res:hover { background: rgba(226, 241, 99, 0.1); }

        /* Resource Modal Unique Styles */
        .res-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.9); backdrop-filter: blur(15px);
          z-index: 10000; display: flex; justify-content: center; align-items: center; padding: 20px;
          overflow-y: auto;
        }
        .res-modal-card {
          background: #121212; width: 100%; max-width: 850px; 
          margin: auto; /* Dùng margin auto kết hợp flex center để căn giữa chuẩn hơn */
          border-radius: 32px; border: 1px solid rgba(255,255,255,0.15); 
          display: flex; flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9);
          max-height: 90vh; /* Giới hạn chiều cao để không bị tràn */
        }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { font-size: 1.2rem; color: white; margin: 0; }
        .modal-header button { background: none; border: none; color: var(--text-dim); cursor: pointer; }
        .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
        
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-chip { 
          padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border); 
          background: var(--input-bg); color: var(--text-dim); font-size: 0.75rem; cursor: pointer;
        }
        .tag-chip.active { background: var(--primary); color: black; border-color: var(--primary); font-weight: 600; }
        
        .upload-placeholder {
          border: 2px dashed var(--border); border-radius: 12px; padding: 30px;
          display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; color: var(--text-dim);
        }
        .upload-placeholder:hover { border-color: var(--primary); color: var(--primary); }
        
        .btn-cancel { background: none; border: 1px solid var(--border); color: white; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
        .btn-save-resource { 
          background: var(--primary); color: black; border: none; padding: 10px 20px; 
          border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px;
        }
        
        .animate-scale-up { animation: scaleUp 0.3s ease-out; }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .intensity-controls { display: flex; gap: 8px; align-items: center; }
        .type-toggle { display: flex; background: var(--input-bg); border-radius: 8px; padding: 2px; border: 1px solid var(--border); }
        .type-toggle button { 
          background: none; border: none; color: var(--text-dim); padding: 4px 8px; 
          font-size: 0.7rem; cursor: pointer; border-radius: 6px; transition: all 0.2s;
        }
        .type-toggle button.active { background: var(--primary); color: black; font-weight: 700; }
        
        .value-input-group { display: flex; align-items: center; gap: 4px; flex: 1; }
        .mini-input { padding: 8px !important; min-width: 80px !important; text-align: center; font-size: 1rem !important; }
        .unit-select { background: none; border: none; color: var(--primary); font-size: 0.9rem; cursor: pointer; outline: none; font-weight: 700; }
        .video-picker-container { position: relative; border-radius: 16px; overflow: hidden; background: black; border: 1px solid var(--border); }
        .picker-video { width: 100%; max-height: 300px; display: block; }
        .picker-overlay { padding: 12px; display: flex; gap: 10px; background: rgba(0,0,0,0.5); }
        .btn-capture { 
          flex: 1; background: var(--primary); color: black; border: none; padding: 10px; 
          border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-change-video { background: none; border: 1px solid var(--error); color: var(--error); padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; }
        
        .thumb-preview-box { width: 150px; height: 100px; border-radius: 12px; overflow: hidden; background: var(--input-bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .thumb-preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .no-thumb { font-size: 0.7rem; color: var(--text-dim); }
      `}</style>
    </div>
  );
}

export default App;
