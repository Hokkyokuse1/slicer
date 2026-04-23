import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Gltf, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Cloud, Settings, History, 
  ChevronRight, Play, CheckCircle, AlertTriangle,
  Cpu, Database, Shield, Globe
} from 'lucide-react';

// --- Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active ? 'bg-orange-500/20 text-orange-500' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="font-semibold">{label}</span>
  </div>
);

function ModelPreview({ url }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!url) return;
    new STLLoader().load(url, setGeometry);
  }, [url]);

  if (!geometry) return null;

  return (
    <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[100, 100, 100]} />
      <Center>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#ff6b35" metalness={0.6} roughness={0.4} />
        </mesh>
      </Center>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isApiEnabled, setIsApiEnabled] = useState(true);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [jobs, setJobs] = useState([
    { id: '1', name: 'Bracket_V2.stl', status: 'completed', time: '12m 30s', weight: '45g' },
    { id: '2', name: 'Gear_Module.stl', status: 'slicing', time: '-', weight: '-' },
  ]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-grid">
      {/* Sidebar */}
      <aside className="w-64 glass border-r-0 m-4 rounded-3xl p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">CloudSlicer</span>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            icon={Cloud} label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={History} label="Job History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <SidebarItem 
            icon={Settings} label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="mt-auto">
          <GlassCard className="!p-4 bg-orange-500/10 border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-orange-500" />
              <span className="text-xs font-bold uppercase text-orange-500">Free Tier Plan</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full w-1/3" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">2 of 10 daily slices used</p>
          </GlassCard>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, User</h1>
            <p className="text-slate-400">Ready to slice some models today?</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
              <span className="text-sm font-medium">API Status</span>
              <button 
                onClick={() => setIsApiEnabled(!isApiEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                  isApiEnabled ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                  isApiEnabled ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10" />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Upload Section */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Upload size={120} />
                </div>
                
                <h2 className="text-xl font-bold mb-4">New Project</h2>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center gap-4 transition-colors hover:border-orange-500/50">
                  <div className="p-4 bg-orange-500/10 rounded-full text-orange-500">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">STL files only (Max. 50MB)</p>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </GlassCard>

              {previewUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="h-[400px] !p-0 overflow-hidden relative">
                    <ModelPreview url={previewUrl} />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div>
                        <p className="font-bold">{file?.name}</p>
                        <p className="text-xs text-slate-400">Ready for slicing</p>
                      </div>
                      <button className="btn-primary flex items-center gap-2">
                        <Play size={16} />
                        Slice Now
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar Stats/Jobs */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <GlassCard>
                <h3 className="font-bold flex items-center gap-2 mb-6">
                  <Cpu size={18} className="text-orange-500" />
                  Active Instances
                </h3>
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className={`p-2 rounded-lg ${
                        job.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500 animate-pulse'
                      }`}>
                        {job.status === 'completed' ? <CheckCircle size={16} /> : <Play size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{job.name}</p>
                        <p className="text-[10px] text-slate-500">{job.status.toUpperCase()}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Database size={18} className="text-indigo-400" />
                  System Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400">Avg. Time</p>
                    <p className="text-lg font-bold">1.4m</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400">Success Rate</p>
                    <p className="text-lg font-bold">99.2%</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Footer/Meta */}
        <footer className="mt-20 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2024 CloudSlicer. MIT Licensed Project. Ready for Tech Interview.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Globe size={18} /></a>
          </div>
        </footer>
      </main>
    </div>
  );
}
