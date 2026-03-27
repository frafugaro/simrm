// js/phantom.js - Grafica e Contrasto Diagnostico 3T

// 1. DATABASE TISSUTALE (Siemens Vida 3T)
const tissueDatabase = {
    abdomen: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        liver: { t1: 810, t2: 45, pd: 0.75, isFat: false },
        spleen: { t1: 1100, t2: 80, pd: 0.85, isFat: false },
        kidney: { t1: 1150, t2: 90, pd: 0.85, isFat: false },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        spine: { t1: 300, t2: 0.5, pd: 0.1, isFat: false }
    },
    pelvis: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        prostate_pz: { t1: 1200, t2: 150, pd: 0.90, isFat: false },
        prostate_tz: { t1: 1100, t2: 80, pd: 0.80, isFat: false },
        bladder: { t1: 4000, t2: 2000, pd: 1.0, isFat: false },
        rectum: { t1: 800, t2: 50, pd: 0.50, isFat: false },
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false }
    },
    thorax: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        lung: { t1: 1200, t2: 30, pd: 0.20, isFat: false },
        heart: { t1: 900, t2: 50, pd: 0.80, isFat: false }
    },
    head: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        gm: { t1: 1300, t2: 110, pd: 0.85, isFat: false },
        wm: { t1: 850, t2: 80, pd: 0.70, isFat: false },
        csf: { t1: 4000, t2: 2000, pd: 1.0, isFat: false },
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false }
    }
};

// 2. MAPPATURA SCALA DI GRIGI CON GUADAGNO (Gain: 5.0)
function mapSignalToGrayscale(S) {
    const diagnosticGain = 5.0;
    const S_g = S * diagnosticGain; 
    
    // Threshold clinico per non azzerare i parenchimi
    if (S_g < 0.05) return '#0a0a0a'; // L0: Nero assoluto (Osso, Aria, FatSat)
    if (S_g < 0.25) return '#3c3c3c'; // L1: Grigio Scuro (Fegato T2)
    if (S_g < 0.50) return '#787878'; // L2: Grigio Medio
    if (S_g < 0.75) return '#bebebe'; // L3: Grigio Chiaro (Grasso T2)
    return '#f5f5f5';                 // L4: Bianco iperintenso (Liquidi T2 / Grasso T1)
}

function getSignalIntensity(tissue, TR, TE, saturation) {
    if (saturation === 'Fat Sat' && tissue.isFat) return mapSignalToGrayscale(0);
    if (saturation === 'Water Sat' && !tissue.isFat) return mapSignalToGrayscale(0);

    // Formula di Bloch (Spin Echo)
    const signal = tissue.pd * (1 - Math.exp(-TR / tissue.t1)) * Math.exp(-TE / tissue.t2);
    return mapSignalToGrayscale(signal);
}

// 3. INIEZIONE DINAMICA SVG SE MANCANTE
function injectSVG() {
    return `
    <svg viewBox="0 0 200 200" class="w-full h-full preserve-3d">
        <defs>
            <filter id="mri-noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0" /></filter>
        </defs>
        
        <!-- ABDOMEN AXIAL -->
        <g id="ph-group-abdomen" class="hidden">
            <ellipse id="ph-abd-fat" cx="100" cy="100" rx="95" ry="75" />
            <ellipse id="ph-abd-muscle" cx="100" cy="100" rx="88" ry="68" class="transform-water" />
            <path id="ph-abd-liver" d="M 15 100 C 15 45, 75 35, 105 40 C 120 42, 125 55, 115 75 C 105 95, 85 130, 45 135 C 20 138, 15 120, 15 100 Z" class="transform-water" />
            <path id="ph-abd-spleen" d="M 150 55 C 175 60, 185 85, 175 105 C 165 125, 145 115, 140 90 C 135 65, 140 50, 150 55 Z" class="transform-water" />
            <g class="transform-water">
                <ellipse id="ph-abd-kidney-r" cx="50" cy="125" rx="16" ry="22" transform="rotate(-25 50 125)" />
                <ellipse id="ph-abd-kidney-l" cx="150" cy="125" rx="16" ry="22" transform="rotate(25 150 125)" />
            </g>
            <circle id="ph-abd-spine" cx="100" cy="150" r="12" class="transform-water" />
        </g>

        <!-- PELVIS AXIAL -->
        <g id="ph-group-pelvis" class="hidden">
            <path id="ph-pel-fat" d="M 20 100 C 20 20, 180 20, 180 100 C 180 180, 20 180, 20 100 Z" />
            <path id="ph-pel-muscle" d="M 30 120 Q 50 160 100 160 Q 150 160 170 120 L 150 100 Q 100 130 50 100 Z" class="transform-water" />
            <circle id="ph-pel-bone-l" cx="40" cy="110" r="24" class="transform-water" />
            <circle id="ph-pel-bone-r" cx="160" cy="110" r="24" class="transform-water" />
            <path id="ph-pel-rectum" d="M 85 140 C 85 130, 115 130, 115 140 C 115 155, 85 155, 85 140 Z" class="transform-water" />
            <path id="ph-pel-bladder" d="M 70 55 C 70 35, 130 35, 130 55 C 135 75, 120 90, 100 90 C 80 90, 65 75, 70 55 Z" class="transform-water" />
            <path id="ph-pel-pz" d="M 80 105 C 80 90, 120 90, 120 105 C 125 125, 115 130, 100 130 C 85 130, 75 125, 80 105 Z" class="transform-water" />
            <ellipse id="ph-pel-tz" cx="100" cy="108" rx="12" ry="8" class="transform-water" />
        </g>

        <!-- HEAD AXIAL -->
        <g id="ph-group-head" class="hidden">
            <ellipse id="ph-hd-fat" cx="100" cy="100" rx="75" ry="90" />
            <ellipse id="ph-hd-bone" cx="100" cy="100" rx="70" ry="85" class="transform-water" />
            <path id="ph-hd-gm" d="M 40 100 C 40 65, 68 28, 100 28 C 132 28, 160 65, 160 100 C 160 135, 132 168, 100 168 C 68 168, 40 135, 40 100 Z" class="transform-water" />
            <path id="ph-hd-wm" d="M 50 100 C 50 75, 75 45, 100 45 C 125 45, 150 75, 150 100 C 150 125, 125 155, 100 155 C 75 155, 50 125, 50 100 Z" class="transform-water" />
            <path id="ph-hd-csf" d="M 90 90 Q 100 50 110 90 Q 120 120 100 130 Q 80 120 90 90 Z" class="transform-water" />
        </g>

        <rect id="ph-noise" x="0" y="0" width="200" height="200" filter="url(#mri-noise)" opacity="0" style="mix-blend-mode: screen; pointer-events: none; transition: opacity 0.3s;" />
    </svg>`;
}

// 4. MAIN RENDER FUNCTION (Chiamata da physics.js)
window.renderPhantom = function(snrFinal) {
    const s = window.state || {};
    const region = s.region || 'abdomen';
    const TR = Math.max(1, parseFloat(s.tr) || 2200);
    const TE = Math.max(1, parseFloat(s.te) || 105);
    const saturation = s.saturation || 'Nessuna';

    // A. Controlla e Inietta SVG se il contenitore Ã¨ vuoto o mancano gli ID essenziali
    const wrapper = document.getElementById('phantom-wrapper') || document.getElementById('phantom-container');
    if (wrapper) {
        if (wrapper.innerHTML.trim() === '' || !document.getElementById('ph-noise')) {
            wrapper.innerHTML = injectSVG();
        }
    }

    // B. Applica i colori calcolati
    const setFill = (id, tissueCode, anatRegion) => {
        const el = document.getElementById(id);
        if(el && tissueDatabase[anatRegion] && tissueDatabase[anatRegion][tissueCode]) {
            el.setAttribute('fill', getSignalIntensity(tissueDatabase[anatRegion][tissueCode], TR, TE, saturation));
            el.style.transition = "fill 0.4s ease-in-out";
        }
    };

    // Mapping Addome
    setFill('ph-abd-fat', 'fat', 'abdomen');
    setFill('ph-abd-muscle', 'muscle', 'abdomen');
    setFill('ph-abd-liver', 'liver', 'abdomen');
    setFill('ph-abd-spleen', 'spleen', 'abdomen');
    setFill('ph-abd-kidney-r', 'kidney', 'abdomen');
    setFill('ph-abd-kidney-l', 'kidney', 'abdomen');
    setFill('ph-abd-spine', 'spine', 'abdomen');

    // Mapping Pelvi
    setFill('ph-pel-fat', 'fat', 'pelvis');
    setFill('ph-pel-muscle', 'muscle', 'pelvis');
    setFill('ph-pel-pz', 'prostate_pz', 'pelvis');
    setFill('ph-pel-tz', 'prostate_tz', 'pelvis');
    setFill('ph-pel-bladder', 'bladder', 'pelvis');
    setFill('ph-pel-rectum', 'rectum', 'pelvis');
    setFill('ph-pel-bone-l', 'bone', 'pelvis');
    setFill('ph-pel-bone-r', 'bone', 'pelvis');

    // Mapping Cranio
    setFill('ph-hd-fat', 'fat', 'head');
    setFill('ph-hd-bone', 'bone', 'head');
    setFill('ph-hd-gm', 'gm', 'head');
    setFill('ph-hd-wm', 'wm', 'head');
    setFill('ph-hd-csf', 'csf', 'head');

    // C. Mostra solo la regione attiva
    document.querySelectorAll('g[id^="ph-group-"]').forEach(el => el.classList.add('hidden'));
    const activeGroup = document.getElementById(`ph-group-${region}`);
    if(activeGroup) activeGroup.classList.remove('hidden');

    // D. Applica Noise in base a SNR Final
    const noiseRect = document.getElementById('ph-noise');
    if (noiseRect) {
        let baseNoiseOpacity = Math.max(0, (1.0 - (snrFinal || 1.0)) * 0.3);
        noiseRect.setAttribute('opacity', baseNoiseOpacity);
    }

    // E. Effetto Compressed Sensing (Blur / Sharpening)
    if (wrapper) {
        let currentFilter = 'grayscale(100%)';
        if (s.accelType === 'CS') {
            const blurAmount = (Math.max(1, parseFloat(s.csFactor)) - 1) * 0.3;
            currentFilter += ` blur(${blurAmount}px) contrast(110%)`;
        }
        wrapper.style.filter = currentFilter;
    }

    // F. Artefatto da Chemical Shift (Shift geometrico orizzontale dei tessuti ricchi d'acqua)
    const bw = Math.max(1, parseFloat(s.bw) || 521);
    const N_y = Math.max(1, Math.round(parseFloat(s.baseRes || 320) * (parseFloat(s.fovPhasePct || 100) / 100)));
    const bwHzPx = bw / N_y;
    
    let shiftPx = 0;
    if (bwHzPx < 100) shiftPx = 3; 
    else if (bwHzPx <= 250) shiftPx = 1; 
    
    document.querySelectorAll('.transform-water').forEach(el => {
        el.style.transform = `translateX(${shiftPx}px)`;
    });
};
