import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Grid, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Cloud, Settings, History, 
  ChevronRight, Play, CheckCircle, AlertTriangle,
  Cpu, Database, Shield, Globe, Box, Eye, EyeOff,
  Sliders, Layers, Activity
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

function ModelPreview({ url, wireframe }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!url) return;
    new STLLoader().load(url, setGeometry);
  }, [url]);

  if (!geometry) return null;

  return (
    <Canvas camera={{ position: [100, 100, 150], fov: 45 }} shadows>
      <ambientLight intensity={0.5} />
      <spotLight position={[100, 100, 100]} angle={0.15} penumbra={1} castShadow />
      <pointLight position={[-100, -100, -100]} />
      
      <Suspense fallback={null}>
        <Stage adjustCamera intensity={0.5} environment="city">
          <Center>
            <mesh geometry={geometry} castShadow receiveShadow>
              <meshStandardMaterial 
                color="#ff6b35" 
                metalness={0.7} 
                roughness={0.3} 
                wireframe={wireframe}
              />
            </mesh>
          </Center>
        </Stage>
        <Grid infiniteGrid fadeDistance={500} sectionSize={10} sectionColor="#333" />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

const ControlSlider = ({ label, value, unit, min, max, step, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-medium">
      <span className="text-slate-400">{label}</span>
      <span className="text-orange-500">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-orange-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isApiEnabled, setIsApiEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  
  // Slicing Params
  const [layerHeight, setLayerHeight] = useState(0.2);
  const [infill, setInfill] = useState(20);
  const [speed, setSpeed] = useState(60);

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
    <div className="flex h-screen w-full bg-grid overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 glass border-r-0 m-4 rounded-3xl p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">CloudSlicer</span>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem icon={Cloud} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={History} label="Job History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        {/* Print Parameters (Advanced Panel) */}
        <div className="mt-4 pt-6 border-t border-white/5 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Sliders size={14} /> Print Parameters
          </h3>
          
          <ControlSlider label="Layer Height" value={layerHeight} unit="mm" min={0.1} max={0.3} step={0.05} onChange={setLayerHeight} />
          <ControlSlider label="Infill Density" value={infill} unit="%" min={0} max={100} step={5} onChange={setInfill} />
          <ControlSlider label="Print Speed" value={speed} unit="mm/s" min={30} max={120} step={10} onChange={setSpeed} />
        </div>

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
      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tighter">PREMIUM SLICING STUDIO</h1>
            <p className="text-slate-400 text-sm">Industrial grade slicing at your fingertips.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-3 glass px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                showPreview ? 'text-white border-orange-500/40 bg-orange-500/10' : 'text-slate-400'
              }`}
            >
              {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
              {showPreview ? 'Viewer Active' : 'Viewer Paused'}
            </button>
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
              <span className="text-xs font-bold text-slate-500">API</span>
              <button 
                onClick={() => setIsApiEnabled(!isApiEnabled)}
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${
                  isApiEnabled ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                  isApiEnabled ? 'left-5' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6 flex-1">
            {/* Main Stage */}
            <div className="col-span-12 xl:col-span-9 space-y-6 flex flex-col">
              <AnimatePresence mode="wait">
                {showPreview && previewUrl ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex-1 min-h-[500px]"
                  >
                    <GlassCard className="h-full !p-0 overflow-hidden relative shadow-2xl border-white/10 group">
                      <ModelPreview url={previewUrl} wireframe={wireframe} />
                      
                      {/* Floating Overlay Controls */}
                      <div className="absolute top-6 right-6 flex flex-col gap-2">
                        <button 
                          onClick={() => setWireframe(!wireframe)}
                          className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                            wireframe ? 'bg-orange-500 text-white border-orange-400' : 'bg-black/40 text-slate-300 border-white/10'
                          }`}
                          title="Toggle Wireframe"
                        >
                          <Layers size={20} />
                        </button>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <Box size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-lg leading-none mb-1">{file?.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 uppercase tracking-widest font-bold">
                              {(file?.size / 1024 / 1024).toFixed(2)} MB • STL Format
                            </p>
                          </div>
                        </div>
                        <button className="btn-primary flex items-center gap-3 h-12 px-8">
                          <Play size={18} fill="currentColor" />
                          SLICE MODEL
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex"
                  >
                    <GlassCard className="flex-1 flex flex-col items-center justify-center relative overflow-hidden group border-dashed">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                      <div className="p-8 bg-orange-500/10 rounded-full text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Upload size={48} />
                      </div>
                      <div className="text-center space-y-2 relative">
                        <h2 className="text-2xl font-bold">Initiate New Slicing Job</h2>
                        <p className="text-slate-500 max-w-xs mx-auto">Upload your STL geometry to begin the cloud-assisted slicing process.</p>
                      </div>
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <div className="mt-8 px-6 py-2 rounded-full border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Support for .STL files up to 50MB
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Side Panel: Active Jobs & Stats */}
            <div className="col-span-12 xl:col-span-3 space-y-6">
              <GlassCard>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <History size={18} className="text-orange-500" />
                    Live Activity
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer group">
                      <div className={`p-2.5 rounded-xl ${
                        job.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500 animate-pulse'
                      }`}>
                        {job.status === 'completed' ? <CheckCircle size={18} /> : <Activity size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{job.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{job.status}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-indigo-400" />
                  Efficiency
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Avg Pulse</p>
                    <p className="text-2xl font-bold mt-1">1.4s</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Uptime</p>
                    <p className="text-2xl font-bold mt-1">99.9%</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
          <p className="text-[11px] font-medium tracking-wide">
            CLOUD SLICER ENGINE V2.0 • MIT LICENSED • SECURE CLOUD COMUTE
          </p>
          <div className="flex gap-8 items-center">
            <Shield size={16} />
            <Globe size={16} />
            <Box size={16} />
          </div>
        </footer>
      </main>
    </div>
  );
}
