import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Image as ImageIcon, Video, Save, Loader2, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// ─── Constants ───────────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  muscleGroups: string[];
  equipment: string[];
  sport: string[];
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
}

interface FormData {
  title: string;
  description: string;
  type: 'video' | 'article';
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  muscleGroups: string[];
  equipment: string[];
  sport: string[];
}

const DEFAULT_FORM: FormData = {
  title: '',
  description: '',
  type: 'video',
  thumbnailUrl: '',
  videoUrl: '',
  duration: 0,
  muscleGroups: [],
  equipment: [],
  sport: [],
};

// ─── Helper: Generate Thumbnail from Video URL ───────────────────────────────
const generateAutoThumbnail = (videoUrl: string) => {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) return '';
  // Transform: .../video/upload/v123/... -> .../video/upload/so_2/v123/... + .jpg
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_2/') // Lấy frame ở giây thứ 2
    .replace(/\.[^/.]+$/, '.jpg'); // Đổi đuôi thành jpg
};

// ─── Multi-select Checkbox Group ──────────────────────────────────────────────
function CheckGroup({
  label, options, selected, onChange
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  };
  return (
    <div className="check-group">
      <label className="form-label">{label}</label>
      <div className="check-grid">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`check-chip ${selected.includes(opt.value) ? 'active' : ''}`}
            onClick={() => toggle(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, onDelete, onEdit }: { resource: Resource; onDelete: () => void, onEdit: () => void }) {
  return (
    <div className="resource-card">
      <div className="resource-card-img">
        {resource.thumbnailUrl
          ? <img src={resource.thumbnailUrl} alt={resource.title} />
          : <div className="img-placeholder"><ImageIcon size={32} /></div>}
        {resource.type === 'video' && resource.videoUrl && (
          <a href={resource.videoUrl} target="_blank" rel="noreferrer" className="play-badge">
            <Video size={14} /> Video
          </a>
        )}
        {resource.type === 'article' && (
          <div className="play-badge article">Article</div>
        )}
      </div>
      <div className="resource-card-body">
        <p className="resource-title">{resource.title}</p>
        <p className="resource-desc">{resource.description}</p>
        <div className="resource-tags">
          {resource.type === 'video' && resource.duration > 0 && <span className="tag">{(resource.duration < 60) ? `${resource.duration}s` : `${Math.round(resource.duration/60)}m`}</span>}
          {resource.muscleGroups.map(m => <span key={m} className="tag muscle">{m}</span>)}
          {resource.equipment.map(e => <span key={e} className="tag equip">{e}</span>)}
          {resource.sport.map(s => <span key={s} className="tag sport">{s}</span>)}
        </div>
        <div className="resource-meta">
          <span>👁 {resource.viewsCount}</span>
          <span>⭐ {resource.favoritesCount}</span>
        </div>
      </div>
      <div className="card-actions">
        <button className="action-btn edit" onClick={onEdit} title="Edit"><Plus size={16} style={{transform: 'rotate(45deg)'}} /></button>
        <button className="action-btn delete" onClick={onDelete} title="Delete"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState<'thumbnail' | 'video' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter state
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [filterSport, setFilterSport] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchResources = async () => {
    setFetching(true);
    try {
      const { data } = await axios.get(`${API_BASE}/resources`);
      setResources(data.data || []);
    } catch {
      setResources([]);
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async (file: File, fieldType: 'thumbnail' | 'video') => {
    setUploading(fieldType);
    setMessage(null);
    
    let localDuration = form.duration;
    if (fieldType === 'video') {
      try {
        localDuration = await new Promise((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(Math.round(video.duration)); // Giữ nguyên giây
          };
          video.src = URL.createObjectURL(file);
        });
      } catch (e) {
        console.error('Could not get video duration', e);
      }
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      
      console.log(`Starting upload for ${fieldType}...`, file.name);
      const { data } = await axios.post(`${API_BASE}/upload`, fd);

      console.log('Server response:', data);
      const url = data.data?.url || data.url;
      
      if (!url) {
        throw new Error('Server successfully processed but returned no URL.');
      }

      const finalDuration = data.data?.duration 
        ? Math.round(data.data.duration / 60) 
        : localDuration;
      
      setForm(prev => {
        const isVideo = fieldType === 'video';
        return {
          ...prev,
          [isVideo ? 'videoUrl' : 'thumbnailUrl']: url,
          // Nếu up video, tự động tạo thumbnailUrl từ giây thứ 2
          thumbnailUrl: isVideo ? generateAutoThumbnail(url) : (fieldType === 'thumbnail' ? url : prev.thumbnailUrl),
          duration: isVideo ? finalDuration : prev.duration
        };
      });
      
      setMessage({ type: 'success', text: `Uploaded ${fieldType} successfully!` });
    } catch (err: any) {
      console.error('Upload Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      setMessage({ type: 'error', text: `Upload failed: ${errorMsg}` });
    } finally {
      setUploading(null);
    }
  };

  const handleEdit = (res: Resource) => {
    setEditingId(res._id);
    setForm({
      title: res.title,
      description: res.description,
      type: res.type,
      thumbnailUrl: res.thumbnailUrl,
      videoUrl: res.videoUrl || '',
      duration: res.duration || 0,
      muscleGroups: res.muscleGroups,
      equipment: res.equipment,
      sport: res.sport,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required!' });
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/resources/${editingId}`, form);
        setMessage({ type: 'success', text: 'Resource updated successfully!' });
      } else {
        await axios.post(`${API_BASE}/resources`, form);
        setMessage({ type: 'success', text: 'Resource saved successfully!' });
      }
      resetForm();
      fetchResources();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error saving' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`${API_BASE}/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
      setMessage({ type: 'success', text: 'Deleted!' });
    } catch {
      setMessage({ type: 'error', text: 'Error deleting' });
    }
  };

  const filteredResources = resources.filter(r => {
    if (filterMuscle && !r.muscleGroups.includes(filterMuscle)) return false;
    if (filterEquip  && !r.equipment.includes(filterEquip))    return false;
    if (filterSport  && !r.sport.includes(filterSport))        return false;
    return true;
  });

  return (
    <div className="app-root">
      {/* Toast */}
      {message && (
        <div className={`toast ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X size={14} /></button>
        </div>
      )}

      <div className="app-grid">
        {/* ── LEFT: FORM ── */}
        <div className="form-panel">
          <div className="panel-header">
            <div className="logo-box"><Video size={20} color="white" /></div>
            <div>
              <h1>Resources Admin</h1>
              <p>Add videos & articles to the library</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-card">
            {/* Basic info */}
            <div className="section-block">
              <h3 className="section-label">📝 Basic Info</h3>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Dumbbell Squats"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Short description..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-input" 
                    value={form.type} 
                    onChange={e => setForm(p => ({ ...p, type: e.target.value as any, duration: 0, thumbnailUrl: '', videoUrl: '' }))}
                  >
                    <option value="video">🎬 Video</option>
                    <option value="article">📄 Article</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="section-block">
              <h3 className="section-label">🖼 Media</h3>

              {/* Thumbnail (Manual for Article only) */}
              {form.type === 'article' && (
                <div className="form-group">
                  <label className="form-label">Thumbnail Image (Manual)</label>
                  <div className="upload-row">
                    <div className="input-with-upload" onClick={() => document.getElementById('thumbnail-file')?.click()}>
                      <input
                        className="form-input"
                        placeholder="Click to upload thumbnail for article"
                        value={form.thumbnailUrl}
                        readOnly={uploading === 'thumbnail'}
                        onChange={e => { e.stopPropagation(); setForm(p => ({ ...p, thumbnailUrl: e.target.value })); }}
                      />
                      <div className="input-upload-icon">
                        {uploading === 'thumbnail' ? <Loader2 size={16} className="spin" /> : <ImageIcon size={16} />}
                      </div>
                    </div>
                    <input 
                      type="file" id="thumbnail-file" accept="image/*" hidden 
                      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'thumbnail')} 
                    />
                  </div>
                  {uploading === 'thumbnail' && (
                    <div className="media-preview-box uploading">
                      <Loader2 size={24} className="spin" />
                      <span>Uploading Image...</span>
                    </div>
                  )}
                  {form.thumbnailUrl && uploading !== 'thumbnail' && (
                    <div className="media-preview-box">
                      <img src={form.thumbnailUrl} alt="" className="preview-img" />
                      <div className="preview-status"><CheckCircle2 size={12} /> Ready</div>
                    </div>
                  )}
                </div>
              )}

              {/* Video & Auto Thumbnail */}
              {form.type === 'video' && (
                <div className="form-group">
                  <label className="form-label">Video Content</label>
                  <div className="upload-row">
                    <div className="input-with-upload" onClick={() => document.getElementById('video-file')?.click()}>
                      <input
                        className="form-input"
                        placeholder="Click to upload video"
                        value={form.videoUrl}
                        readOnly={uploading === 'video'}
                        onChange={e => { e.stopPropagation(); setForm(p => ({ ...p, videoUrl: e.target.value })); }}
                      />
                      <div className="input-upload-icon">
                        {uploading === 'video' ? <Loader2 size={16} className="spin" /> : <Video size={16} />}
                      </div>
                    </div>
                    <input 
                      type="file" id="video-file" accept="video/*" hidden 
                      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'video')} 
                    />
                    {form.videoUrl && (
                      <a href={form.videoUrl} target="_blank" rel="noreferrer" className="upload-btn">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>

                  {uploading === 'video' && (
                    <div className="media-preview-box uploading">
                      <Loader2 size={24} className="spin" />
                      <span>Uploading Video & Auto-capturing Thumbnail...</span>
                    </div>
                  )}

                  {form.videoUrl && uploading !== 'video' && (
                    <div className="media-row-preview">
                      <div className="media-preview-box">
                        <p className="p-label">🎬 Video Preview</p>
                        <video src={form.videoUrl} className="preview-video" controls />
                      </div>
                      <div className="media-preview-box">
                        <p className="p-label">🖼 Auto Thumbnail (at 2s)</p>
                        <img src={form.thumbnailUrl} alt="" className="preview-img" />
                        <div className="preview-status"><CheckCircle2 size={12} /> Auto-Captured</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="section-block">
              <h3 className="section-label">🏷 Categorization</h3>
              <CheckGroup label="Muscle Group" options={MUSCLE_GROUPS} selected={form.muscleGroups} onChange={v => setForm(p => ({ ...p, muscleGroups: v }))} />
              <CheckGroup label="Equipment" options={EQUIPMENT_LIST} selected={form.equipment} onChange={v => setForm(p => ({ ...p, equipment: v }))} />
              <CheckGroup label="Discipline" options={SPORTS} selected={form.sport} onChange={v => setForm(p => ({ ...p, sport: v }))} />
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Resource'}
            </button>
          </form>
        </div>

        {/* ── RIGHT: LIST ── */}
        <div className="list-panel">
          <div className="list-header">
            <h2>Resource List <span className="count-badge">{filteredResources.length}</span></h2>
            <button className="refresh-btn" onClick={fetchResources}>Refresh</button>
          </div>

          {/* Filters */}
          <div className="filter-row">
            <select className="filter-select" value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
              <option value="">All Muscles</option>
              {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="filter-select" value={filterEquip} onChange={e => setFilterEquip(e.target.value)}>
              <option value="">All Equipment</option>
              {EQUIPMENT_LIST.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select className="filter-select" value={filterSport} onChange={e => setFilterSport(e.target.value)}>
              <option value="">All Disciplines</option>
              {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {(filterMuscle || filterEquip || filterSport) && (
              <button className="clear-filter" onClick={() => { setFilterMuscle(''); setFilterEquip(''); setFilterSport(''); }}>
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {fetching ? (
            <div className="loading-state"><Loader2 size={32} className="spin" /></div>
          ) : filteredResources.length === 0 ? (
            <div className="empty-state">
              <Video size={48} opacity={0.3} />
              <p>No resources yet. Add some from the left form!</p>
            </div>
          ) : (
            <div className="resource-list">
              {filteredResources.map(r => (
                <ResourceCard key={r._id} resource={r} onDelete={() => handleDelete(r._id)} onEdit={() => handleEdit(r)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
