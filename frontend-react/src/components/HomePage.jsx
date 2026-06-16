import { useRef, useMemo, useEffect } from "react";
// import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[2.2, 128, 128]}
        position={[2.5, 0, -1]}
        scale={1.1}
      >
        <MeshDistortMaterial
          color="#ffffff"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.5}
          transparent={true}
          opacity={0.25}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }

    return pos;
  }, []);

  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.5;
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [positions]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#9DFF13"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Homepage() {
  //   useEffect(() => {
  //   const socket = io("http://localhost:5000", {
  //     withCredentials: true,
  //   });

  //   socket.on("connect", () => {
  //     console.log("✅ Socket connected:", socket.id);
  //   });

  //   socket.on("connect_error", (err) => {
  //     console.log("❌ Error:", err.message);
  //   });

  //   return () => socket.disconnect();
  // }, []);
  return (
    // Changed to min-h-screen and overflow-x-hidden to allow vertical scrolling on mobile
    <div className="relative min-h-screen w-full bg-[#050505] font-sans antialiased overflow-x-hidden text-white selection:bg-[#9DFF13]/30">
      {/* 3D Background - Changed to fixed so it stays behind content when scrolling */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.5} />

          <directionalLight
            position={[5, 10, 5]}
            intensity={4}
            color="#9DFF13"
          />

          <pointLight position={[-10, -5, -5]} intensity={2} color="#ffffff" />

          <AnimatedSphere />
          <ParticleField />
        </Canvas>
      </div>

      {/* Overlay - Changed to fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] opacity-80"></div>

      {/* Main UI */}
      <div className="relative z-10 min-h-screen w-full flex flex-col justify-between pt-6 md:pt-10">
        {/* Navbar */}
        <nav className="flex justify-between px-6 md:px-16 items-center pointer-events-auto">
          <div className="font-bold text-xl md:text-2xl tracking-tight text-white flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#9DFF13] rounded-xl text-[#050505] font-black text-lg md:text-xl shadow-[0_0_15px_rgba(157,255,19,0.3)]">
              C
            </div>
            CampusOS.
          </div>

          <div className="hidden lg:flex gap-8 items-center bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full">
            <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Features
            </button>
            <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              AI Engine
            </button>
            <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Opportunities
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-white hover:text-[#9DFF13] transition-colors hidden md:block px-4">
              Sign In
            </button>
            <button className="bg-white text-[#050505] hover:bg-[#9DFF13] px-5 py-2.5 md:px-7 md:py-3 text-sm font-bold transition-all duration-300 rounded-full hover:shadow-[0_0_20px_rgba(157,255,19,0.3)]">
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col md:flex-row justify-between items-center px-6 md:px-16 pointer-events-none w-full my-12 md:my-0">
          {/* Left Content */}
          <div className="w-full md:w-[55%] pt-12 md:pt-0">
            <div className="inline-flex mt-2 items-center gap-3 mb-6 pointer-events-auto bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-xl">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9DFF13] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9DFF13]"></span>
              </span>
              <span className="text-xs font-semibold text-white/90 tracking-wide">
                AI Career Intelligence System Live
              </span>
            </div>

            <h1 className="text-[2.75rem] sm:text-[3.5rem] md:text-[5.5rem] font-bold tracking-tighter leading-[1.1] md:leading-[1] text-white mb-6">
              Your AI <br className="hidden md:block" />
              <span className="text-[#9DFF13]">Career Operating System.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-lg font-light leading-relaxed">
              Transform resumes, skills, and academic potential into real career
              opportunities with intelligent insights built for modern students.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8 md:mt-10 pointer-events-auto">
              <Link to="/profile" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto group px-6 py-3 md:px-8 md:py-4 bg-[#9DFF13] text-[#050505] font-bold text-sm md:text-base hover:bg-white transition-all duration-300 rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(157,255,19,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1">
                  <span>Start Building</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>

              <button className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-transparent text-white font-semibold text-sm md:text-base hover:bg-white/5 border border-white/20 transition-all duration-300 rounded-full">
                Explore Platform
              </button>
            </div>
          </div>

          {/* Right Card - Made visible and stackable on mobile */}
          {/* Right Card - Platform Preview Mockup */}
          <div className="w-full md:w-[420px] mt-16 md:mt-0 relative pointer-events-auto">
            {/* Glow */}
            <div className="absolute -top-12 -right-12 w-60 h-60 bg-[#9DFF13] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />

            {/* Outer wrapper */}
            <div className="backdrop-blur-3xl bg-white/[0.02] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden group hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2">
              {/* Top label */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#9DFF13] animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Platform Preview
                  </span>
                </div>
                <span className="bg-[#9DFF13]/10 text-[#9DFF13] text-[10px] font-bold px-3 py-1 rounded-full">
                  AI Powered
                </span>
              </div>

              {/* Two column grid */}
              <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
                {/* LEFT — Leaderboard */}
                <div className="bg-[#050505] p-4">
                  {/* Mini browser bar */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="flex-1 bg-white/[0.05] rounded-sm px-2 py-0.5 ml-1">
                      <span className="text-[8px] text-white/20">
                        /leaderboard
                      </span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF13]" />
                    <span className="text-[8px] text-[#9DFF13] font-bold tracking-widest">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-white mb-3 leading-tight">
                    Talent <span className="text-[#9DFF13]">Leaderboard</span>
                  </p>

                  {/* Candidate 1 */}
                  <div className="bg-white/[0.03] border border-[#9DFF13]/20 rounded-xl p-2.5 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black italic text-[#9DFF13]/30">
                        01
                      </span>
                      <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center text-[7px] font-bold text-[#9DFF13] flex-shrink-0">
                        CH
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-white truncate">
                          Ayan★
                        </p>
                        <p className="text-[8px] text-white/30 truncate">
                          Backend Dev
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[13px] font-black text-[#9DFF13] leading-none">
                          63<span className="text-[8px] opacity-50">%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate 2 */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black italic text-white/10">
                        02
                      </span>
                      <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center text-[7px] font-bold text-[#9DFF13] flex-shrink-0">
                        SA
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-white truncate">
                          Harry
                        </p>
                        <p className="text-[8px] text-white/30 truncate">
                          Full Stack Dev
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[13px] font-black text-white leading-none">
                          14<span className="text-[8px] opacity-50">%</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT — Job Dashboard */}
                <div className="bg-[#050505] p-4">
                  {/* Mini browser bar */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="flex-1 bg-white/[0.05] rounded-sm px-2 py-0.5 ml-1">
                      <span className="text-[8px] text-white/20">/jobs</span>
                    </div>
                  </div>

                  {/* Job card */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-[8px] font-black text-black flex-shrink-0">
                        PC
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-white leading-tight truncate">
                          Node Js Backend
                        </p>
                        <p className="text-[8px] text-white/30 truncate">
                          Pashvi • Mumbai
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#9DFF13] rounded-md px-2 py-1 text-center">
                      <span className="text-[8px] font-black text-black">
                        Apply Now
                      </span>
                    </div>
                  </div>

                  {/* Match stat */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2 text-center">
                      <p className="text-[7px] text-white/30 mb-1">MATCH</p>
                      <p className="text-[16px] font-black text-red-400 leading-none">
                        25<span className="text-[8px]">%</span>
                      </p>
                      <p className="text-[7px] text-red-400/60 mt-0.5">
                        Weak Fit
                      </p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2">
                      <p className="text-[7px] text-[#9DFF13] font-bold mb-1.5">
                        Tech Stack
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-[#9DFF13]/10 border border-[#9DFF13]/20 rounded px-1 py-0.5 text-[7px] text-[#9DFF13]">
                          mongo
                        </span>
                        <span className="bg-[#9DFF13]/10 border border-[#9DFF13]/20 rounded px-1 py-0.5 text-[7px] text-[#9DFF13]">
                          node
                        </span>
                        <span className="bg-white/[0.04] rounded px-1 py-0.5 text-[7px] text-white/20">
                          redis
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {["bg-violet-500", "bg-blue-500", "bg-emerald-500"].map(
                    (c, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${c} border-2 border-[#050505]`}
                      />
                    ),
                  )}
                </div>
                <span className="text-[10px] text-white/30 font-medium">
                  Personalized for every student
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 md:px-16 pb-8 pointer-events-auto z-20 mt-12 md:mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-xs md:text-sm font-medium text-white/40 mb-1 md:mb-2">
                Student Profiles
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                12.4k<span className="text-[#9DFF13]">+</span>
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm font-medium text-white/40 mb-1 md:mb-2">
                AI Skill Matches
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                84k<span className="text-[#9DFF13]">+</span>
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm font-medium text-white/40 mb-1 md:mb-2">
                Hiring Partners
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                450<span className="text-[#9DFF13]">+</span>
              </p>
            </div>

            <div className="flex items-end justify-start md:justify-end">
              <span className="text-xs md:text-sm font-medium text-white/40 flex items-center gap-2">
                Career Network Active
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
