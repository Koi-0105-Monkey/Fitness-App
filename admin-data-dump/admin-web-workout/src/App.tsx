import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Image as ImageIcon, Video, 
  CheckCircle2, AlertCircle, Dumbbell, 
  ChevronRight, Save, Loader2, X 
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

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
      const cleanWorkout = {
        ...workout,
        rounds: workout.rounds.map(r => ({
          ...r,
          exercises: r.exercises
            .filter(ex => ex.name.trim() !== '')
            .map(ex => ({
              ...ex,
              sets: Number(ex.sets) || 1,
              reps: ex.reps.trim(),
              duration: ex.duration.trim(),
              videoDuration: ex.videoDuration,
              fitMode: ex.fitMode || 'contain'
            }))
        })).filter(r => r.exercises.length > 0)
      };

      if (cleanWorkout.rounds.length === 0) {
        throw new Error('Cần ít nhất 1 bài tập hợp lệ');
      }

      if (editingId) {
        await axios.put(`${API_BASE}/workouts/${editingId}`, cleanWorkout);
        setMessage({ type: 'success', text: 'Đã cập nhật bài tập thành công!' });
      } else {
        await axios.post(`${API_BASE}/workouts`, cleanWorkout);
        setMessage({ type: 'success', text: 'Đã lưu bài tập thành công!' });
      }
      
      resetForm();
      fetchWorkouts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Lỗi khi lưu bài tập' });
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
                            {resourceLibrary.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                              <div className="search-empty">No matching resources found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ flex: 0.5 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Sets</label>
                      <input 
                        className="input" style={{ padding: '8px 12px' }} type="number"
                        placeholder="1" value={ex.sets}
                        onChange={(e) => {
                          const nextR = [...workout.rounds];
                          nextR[rIdx].exercises[eIdx].sets = parseInt(e.target.value) || 1;
                          setWorkout({ ...workout, rounds: nextR });
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Reps (Lần)</label>
                      <input 
                        className="input" style={{ padding: '8px 12px' }} 
                        placeholder="VD: 12x" value={ex.reps}
                        onChange={(e) => {
                          const nextR = [...workout.rounds];
                          nextR[rIdx].exercises[eIdx].reps = e.target.value;
                          if (e.target.value) {
                            nextR[rIdx].exercises[eIdx].duration = ''; 
                          }
                          setWorkout({ ...workout, rounds: nextR });
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>Thời gian</label>
                      <input 
                        className="input" style={{ padding: '8px 12px' }} 
                        placeholder="VD: 00:30" value={ex.duration} 
                        onChange={(e) => {
                          const nextR = [...workout.rounds];
                          nextR[rIdx].exercises[eIdx].duration = e.target.value;
                          if (e.target.value) {
                            nextR[rIdx].exercises[eIdx].reps = ''; 
                          }
                          const nextW = { ...workout, rounds: nextR };
                          nextW.duration = calculateStats(nextW);
                          setWorkout(nextW);
                        }}
                      />
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
                <button onClick={() => handleEditWorkout(w)} title="Edit"><Plus size={16} style={{transform: 'rotate(45deg)'}} /></button>
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
                          <p className="mobile-ex-dur">{ex.duration}</p>
                        </div>
                        <div className="mobile-ex-reps">{ex.reps}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewVideo && (
            <div className="video-preview-overlay" onClick={() => setPreviewVideo(null)}>
              <button className="close-video" onClick={() => setPreviewVideo(null)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
              <video src={previewVideo} autoPlay controls className="preview-video-player" onClick={e => e.stopPropagation()} />
            </div>
          )}
        </div>
      </div>

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
      `}</style>
    </div>
  );
}

export default App;
