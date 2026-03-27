<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulatore di Sequenze RM</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .tab-btn.active { background-color: #1e293b; border-left-color: #3b82f6; color: #ffffff; }
        .texture-lung { filter: url(#texture-spongy); }
        .texture-brain { filter: url(#texture-parenchyma); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    </style>
</head>
<body class="h-screen bg-slate-900 text-slate-300 font-sans flex flex-col overflow-hidden text-sm select-none">

    <!-- Login Screen -->
    <div id="login-screen" class="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center transition-opacity duration-500">
        <div class="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl flex flex-col items-center gap-4 w-80">
            <div class="w-12 h-12 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg text-2xl mb-2">S</div>
            <h2 class="text-xl font-bold text-slate-100 text-center">SIMULATORE RM</h2>
            <p class="text-xs text-slate-400 text-center mb-4">Inserisci la password di accesso.</p>
            <input type="password" id="login-pwd" class="w-full bg-slate-950 border border-slate-600 rounded p-2 text-center text-slate-200 focus:border-blue-500 outline-none" placeholder="Password (simulatore)">
            <button id="login-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors uppercase tracking-wider text-xs">Accedi</button>
            <p id="login-err" class="text-red-400 text-xs hidden mt-2">⚠️ Password errata!</p>
        </div>
    </div>

    <!-- Header -->
    <header class="bg-slate-950 border-b border-slate-800 p-3 flex justify-between items-center shrink-0 relative z-40">
        <div class="flex items-center gap-4">
            <div class="w-7 h-7 bg-blue-600 text-white font-bold flex items-center justify-center rounded-sm">S</div>
            <div>
                <h1 class="text-base font-bold text-slate-100 tracking-wide">SIMULATORE DI SEQUENZE RM</h1>
                <p class="text-xs text-slate-500">Vida 3T Advanced Physics & Acceleration Engine</p>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div id="alert-banner" class="hidden bg-red-900/50 border border-red-500 text-red-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                Sotto-Soglia Diagnostica
            </div>
        </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative z-0">
        <!-- Sidebar -->
        <aside class="w-48 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto" id="sidebar-tabs">
            <!-- Tabs injected by JS -->
        </aside>

        <main class="flex-1 overflow-y-auto p-4 flex flex-col xl:flex-row gap-4 bg-slate-900">
            
            <!-- Parameters Area -->
            <div class="flex-1 bg-slate-800 border border-slate-700 rounded-md p-4 relative" id="parameters-container">
                <!-- Content injected by JS (zero innerHTML during typing) -->
            </div>

            <!-- Viewer & Setup Area -->
            <div class="w-full xl:w-80 flex flex-col gap-4 shrink-0">
                <div class="bg-slate-800 border border-slate-700 rounded-md p-4">
                    <h3 class="text-xs font-bold uppercase text-slate-400 mb-3 border-b border-slate-700 pb-1">Setup Paziente & Regione</h3>
                    <div class="mb-3">
                        <label class="block text-xs text-slate-500 mb-1">Distretto Anatomico</label>
                        <select id="pat-region" class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-slate-200 outline-none focus:border-blue-500 text-xs state-input" data-key="region">
                            <option value="abdomen">Addome Superiore</option>
                            <option value="pelvis">Pelvi / Prostata</option>
                            <option value="thorax">Torace</option>
                            <option value="head">Encefalo</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-slate-500 mb-1">Peso (kg)</label>
                            <input type="number" id="pat-weight" class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 outline-none focus:border-blue-500 state-input" data-key="weight">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-500 mb-1">Altezza (cm)</label>
                            <input type="number" id="pat-height" class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 outline-none focus:border-blue-500 state-input" data-key="height">
                        </div>
                    </div>
                </div>

                <div class="bg-black border border-slate-700 rounded-md p-4 flex flex-col items-center justify-center relative flex-1 min-h-[300px]">
                    <span id="phantom-title" class="absolute top-2 left-2 text-[10px] text-slate-500 uppercase tracking-widest z-10">Axial Abdomen</span>
                    
                    <div id="phantom-wrapper" class="relative w-full aspect-square border border-slate-800 bg-black transition-all duration-300">
                        <svg viewBox="0 0 200 200" class="w-full h-full preserve-3d">
                            <defs>
                                <filter id="mri-noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0" /></filter>
                                <mask id="gfactor-mask">
                                    <radialGradient id="gfactor-grad" cx="50%" cy="50%" r="45%">
                                        <stop offset="0%" stop-color="white" stop-opacity="1" />
                                        <stop offset="100%" stop-color="white" stop-opacity="0" />
                                    </radialGradient>
                                    <rect x="0" y="0" width="200" height="200" fill="url(#gfactor-grad)" />
                                </mask>
                                <filter id="texture-spongy"><feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" result="noise"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" in2="SourceGraphic" operator="in"/></filter>
                                <filter id="texture-parenchyma"><feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="noise"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0" in2="SourceGraphic" operator="in"/></filter>
                            </defs>
                            
                            <!-- ABDOMEN AXIAL -->
                            <g id="ph-group-abdomen-axial" class="hidden">
                                <ellipse id="ph-abd-ax-fat" cx="100" cy="100" rx="95" ry="75" class="transition-colors duration-300"/>
                                <ellipse id="ph-abd-ax-muscle" cx="100" cy="100" rx="88" ry="68" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-abd-ax-liver" d="M 15 100 C 15 45, 75 35, 105 40 C 120 42, 125 55, 115 75 C 105 95, 85 130, 45 135 C 20 138, 15 120, 15 100 Z" class="transition-colors duration-300 transform-water texture-parenchyma"/>
                                <path id="ph-abd-ax-spleen" d="M 150 55 C 175 60, 185 85, 175 105 C 165 125, 145 115, 140 90 C 135 65, 140 50, 150 55 Z" class="transition-colors duration-300 transform-water texture-parenchyma"/>
                                <g class="transform-water">
                                    <ellipse id="ph-abd-ax-kidney-cortex" cx="50" cy="125" rx="16" ry="22" transform="rotate(-25 50 125)" class="transition-colors duration-300"/>
                                    <ellipse id="ph-abd-ax-kidney-medulla" cx="52" cy="123" rx="8" ry="12" transform="rotate(-25 52 123)" class="transition-colors duration-300"/>
                                    <ellipse id="ph-abd-ax-kidney-cortex-l" cx="150" cy="125" rx="16" ry="22" transform="rotate(25 150 125)" class="transition-colors duration-300"/>
                                    <ellipse id="ph-abd-ax-kidney-medulla-l" cx="148" cy="123" rx="8" ry="12" transform="rotate(25 148 123)" class="transition-colors duration-300"/>
                                </g>
                                <circle id="ph-abd-ax-spine" cx="100" cy="150" r="12" class="transition-colors duration-300 transform-water"/>
                            </g>

                            <!-- PELVIS AXIAL -->
                            <g id="ph-group-pelvis-axial" class="hidden">
                                <path id="ph-pelvis-ax-fat" d="M 20 100 C 20 20, 180 20, 180 100 C 180 180, 20 180, 20 100 Z" class="transition-colors duration-300"/>
                                <path id="ph-pelvis-ax-muscle" d="M 30 120 Q 50 160 100 160 Q 150 160 170 120 L 150 100 Q 100 130 50 100 Z" class="transition-colors duration-300 transform-water texture-parenchyma"/>
                                <circle id="ph-pelvis-ax-bone-l" cx="40" cy="110" r="24" class="transition-colors duration-300 transform-water"/>
                                <circle id="ph-pelvis-ax-bone-r" cx="160" cy="110" r="24" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-pelvis-ax-rectum" d="M 85 140 C 85 130, 115 130, 115 140 C 115 155, 85 155, 85 140 Z" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-pelvis-ax-bladder" d="M 70 55 C 70 35, 130 35, 130 55 C 135 75, 120 90, 100 90 C 80 90, 65 75, 70 55 Z" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-pelvis-ax-prostate-pz" d="M 80 105 C 80 90, 120 90, 120 105 C 125 125, 115 130, 100 130 C 85 130, 75 125, 80 105 Z" class="transition-colors duration-300 transform-water texture-parenchyma"/>
                                <ellipse id="ph-pelvis-ax-prostate-tz" cx="100" cy="108" rx="12" ry="8" class="transition-colors duration-300 transform-water texture-parenchyma"/>
                            </g>

                            <!-- THORAX AXIAL -->
                            <g id="ph-group-thorax-axial" class="hidden">
                                <ellipse id="ph-tho-ax-fat" cx="100" cy="100" rx="95" ry="75" class="transition-colors duration-300"/>
                                <ellipse id="ph-tho-ax-muscle" cx="100" cy="100" rx="88" ry="68" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-tho-ax-lung-r" d="M 15 100 C 15 60, 45 40, 80 45 C 80 80, 70 130, 80 150 C 45 145, 15 130, 15 100 Z" class="transition-colors duration-300 transform-water texture-lung"/>
                                <path id="ph-tho-ax-lung-l" d="M 185 100 C 185 60, 155 40, 120 45 C 120 80, 130 130, 120 150 C 155 145, 185 130, 185 100 Z" class="transition-colors duration-300 transform-water texture-lung"/>
                                <circle id="ph-tho-ax-heart" cx="100" cy="85" r="28" class="transition-colors duration-300 transform-water"/>
                                <circle id="ph-tho-ax-spine" cx="100" cy="150" r="12" class="transition-colors duration-300 transform-water"/>
                            </g>

                            <!-- HEAD AXIAL -->
                            <g id="ph-group-head-axial" class="hidden">
                                <ellipse id="ph-hd-ax-fat" cx="100" cy="100" rx="75" ry="90" class="transition-colors duration-300"/>
                                <ellipse id="ph-hd-ax-bone" cx="100" cy="100" rx="70" ry="85" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-hd-ax-csf" d="M 35 100 C 35 60, 65 20, 100 20 C 135 20, 165 60, 165 100 C 165 140, 135 175, 100 175 C 65 175, 35 140, 35 100 Z" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-hd-ax-gm" d="M 40 100 C 40 65, 68 28, 100 28 C 132 28, 160 65, 160 100 C 160 135, 132 168, 100 168 C 68 168, 40 135, 40 100 Z" class="transition-colors duration-300 transform-water texture-brain"/>
                                <path id="ph-hd-ax-wm" d="M 50 100 C 50 75, 75 45, 100 45 C 125 45, 150 75, 150 100 C 150 125, 125 155, 100 155 C 75 155, 50 125, 50 100 Z" class="transition-colors duration-300 transform-water"/>
                                <path id="ph-hd-ax-ventricle" d="M 90 90 Q 100 50 110 90 Q 120 120 100 130 Q 80 120 90 90 Z" class="transition-colors duration-300 transform-water"/>
                            </g>
                            
                            <!-- Livelli di Rumore Overlay -->
                            <rect id="ph-noise" x="0" y="0" width="200" height="200" filter="url(#mri-noise)" opacity="0" style="mix-blend-mode: screen; pointer-events: none; transition: opacity 0.3s;" />
                            <rect id="ph-noise-gfactor" x="0" y="0" width="200" height="200" filter="url(#mri-noise)" mask="url(#gfactor-mask)" opacity="0" style="mix-blend-mode: screen; pointer-events: none; transition: opacity 0.3s;" />
                        </svg>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- BOTTOM DASHBOARD -->
    <footer class="bg-slate-950 border-t border-slate-800 p-3 shrink-0 relative z-10">
        <div class="flex flex-wrap md:flex-nowrap gap-2 max-w-full justify-between items-center text-center">
            <div class="bg-slate-900 border border-slate-700 px-3 py-2 rounded flex-1">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Acq. Time (TA)</div>
                <div id="out-ta" class="font-mono text-lg text-slate-200">0:00</div>
            </div>
            <div class="bg-slate-900 border border-slate-700 px-3 py-2 rounded flex-1">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">ETL / Shots</div>
                <div id="out-etl" class="font-mono text-sm text-slate-200">-</div>
            </div>
            <div class="bg-slate-900 border border-slate-700 px-3 py-2 rounded flex-1">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SAR (W/kg)</div>
                <div id="out-sar" class="font-mono text-sm text-slate-200 border-b border-transparent transition-colors">0.0</div>
            </div>
            <div class="bg-slate-900 border border-slate-700 px-3 py-2 rounded flex-[2]">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                    <span>Res (dx × dy × dz)</span>
                    <span id="out-iso" class="font-bold text-slate-400">STATUS</span>
                </div>
                <div id="out-res" class="font-mono text-sm text-blue-300">0.0 × 0.0 × 0.0 mm</div>
            </div>
            <div class="bg-slate-900 border border-slate-700 px-3 py-2 rounded flex-1">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">SNR Base</div>
                <div id="out-snr-base" class="font-mono text-lg text-slate-400">0.00</div>
            </div>
            <div id="box-snr-final" class="border border-blue-500 bg-blue-900/20 px-4 py-2 rounded flex-1 transition-colors relative">
                <div class="text-[10px] text-blue-300 uppercase tracking-widest mb-1">SNR Final</div>
                <div id="out-snr-final" class="font-mono text-xl font-bold text-blue-400">0.00</div>
                <div id="out-bw-real" class="absolute bottom-1 right-2 text-[9px] text-slate-400 opacity-70">BW: 0 Hz/Px</div>
            </div>
        </div>
    </footer>

    <!-- JS Scripts in order -->
    <script src="js/config.js"></script>
    <script src="js/physics.js"></script>
    <script src="js/phantom.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
