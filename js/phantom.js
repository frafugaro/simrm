// Database Tissutale a 3T (PD, T1 ms, T2 ms)
const TISSUE_DB = {
    Abdomen: {
        Liver:  { PD: 0.80, T1: 800, T2: 40 },
        Spleen: { PD: 0.85, T1: 1100, T2: 80 },
        Kidney: { PD: 0.80, T1: 1000, T2: 70 }
    },
    Pelvis: {
        Bladder: { PD: 1.00, T1: 3000, T2: 1500 },
        Prostate:{ PD: 0.80, T1: 1200, T2: 80 }
    },
    Thorax: {
        Lung:  { PD: 0.30, T1: 1200, T2: 30 },
        Heart: { PD: 0.75, T1: 1100, T2: 45 }
    },
    Skull: {
        WM:  { PD: 0.70, T1: 830, T2: 70 },
        GM:  { PD: 0.80, T1: 1330, T2: 100 },
        CSF: { PD: 1.00, T1: 4000, T2: 2000 }
    }
};

// Mappatura Colori (Livelli L0-L4)
function getContrastLevel(S) {
    if (S < 0.10) return '#0a0a0a'; // L0: Molto Ipointenso
    if (S < 0.35) return '#3c3c3c'; // L1: Ipointenso
    if (S < 0.60) return '#787878'; // L2: Isointenso
    if (S < 0.85) return '#bebebe'; // L3: Iperintenso
    return '#f5f5f5';               // L4: Molto Iperintenso
}

// Equazione di Bloch semplificata (Spin Echo / FSE)
function calcSignal(tissue) {
    const TR = window.state.TR;
    const TE = window.state.TEeff;
    if (TR <= 0) return 0;
    // S = PD * (1 - e^(-TR/T1)) * e^(-TE/T2)
    const S = tissue.PD * (1 - Math.exp(-TR / tissue.T1)) * Math.exp(-TE / tissue.T2);
    return S;
}

// Generatore SVG in base alla regione
function getPhantomSVG(region) {
    let svgs = {
        Abdomen: () => {
            const l = calcSignal(TISSUE_DB.Abdomen.Liver);
            const s = calcSignal(TISSUE_DB.Abdomen.Spleen);
            const k = calcSignal(TISSUE_DB.Abdomen.Kidney);
            return `
                <svg viewBox="0 0 200 200" class="w-full h-full max-h-96 drop-shadow-2xl">
                    <!-- Body Contour -->
                    <ellipse cx="100" cy="100" rx="90" ry="60" fill="#111" stroke="#333" stroke-width="2"/>
                    <!-- Liver -->
                    <path d="M 30 100 Q 30 60 90 70 Q 110 75 120 100 Q 110 130 60 120 Q 30 115 30 100 Z" fill="${getContrastLevel(l)}"/>
                    <!-- Spleen -->
                    <path d="M 140 90 Q 160 85 170 100 Q 175 110 160 115 Q 145 120 140 90 Z" fill="${getContrastLevel(s)}"/>
                    <!-- Kidneys -->
                    <ellipse cx="70" cy="130" rx="15" ry="10" transform="rotate(-20 70 130)" fill="${getContrastLevel(k)}"/>
                    <ellipse cx="130" cy="130" rx="15" ry="10" transform="rotate(20 130 130)" fill="${getContrastLevel(k)}"/>
                </svg>`;
        },
        Pelvis: () => {
            const b = calcSignal(TISSUE_DB.Pelvis.Bladder);
            const p = calcSignal(TISSUE_DB.Pelvis.Prostate);
            return `
                <svg viewBox="0 0 200 200" class="w-full h-full max-h-96 drop-shadow-2xl">
                    <ellipse cx="100" cy="100" rx="80" ry="70" fill="#111" stroke="#333" stroke-width="2"/>
                    <!-- Bladder -->
                    <ellipse cx="100" cy="90" rx="35" ry="25" fill="${getContrastLevel(b)}"/>
                    <!-- Prostate -->
                    <ellipse cx="100" cy="130" rx="15" ry="12" fill="${getContrastLevel(p)}"/>
                </svg>`;
        },
        Thorax: () => {
            const lu = calcSignal(TISSUE_DB.Thorax.Lung);
            const h = calcSignal(TISSUE_DB.Thorax.Heart);
            return `
                <svg viewBox="0 0 200 200" class="w-full h-full max-h-96 drop-shadow-2xl">
                    <ellipse cx="100" cy="100" rx="85" ry="65" fill="#111" stroke="#333" stroke-width="2"/>
                    <!-- Right Lung -->
                    <path d="M 35 100 C 30 60 70 50 85 90 C 90 120 70 140 45 130 Z" fill="${getContrastLevel(lu)}"/>
                    <!-- Left Lung -->
                    <path d="M 165 100 C 170 60 130 50 115 90 C 110 120 130 140 155 130 Z" fill="${getContrastLevel(lu)}"/>
                    <!-- Heart -->
                    <circle cx="100" cy="110" r="25" fill="${getContrastLevel(h)}"/>
                </svg>`;
        },
        Skull: () => {
            const wm = calcSignal(TISSUE_DB.Skull.WM);
            const gm = calcSignal(TISSUE_DB.Skull.GM);
            const csf = calcSignal(TISSUE_DB.Skull.CSF);
            return `
                <svg viewBox="0 0 200 200" class="w-full h-full max-h-96 drop-shadow-2xl">
                    <!-- Scalp/Bone -->
                    <ellipse cx="100" cy="100" rx="70" ry="85" fill="#000" stroke="#fff" stroke-width="2"/>
                    <!-- GM -->
                    <ellipse cx="100" cy="100" rx="64" ry="79" fill="${getContrastLevel(gm)}"/>
                    <!-- WM -->
                    <ellipse cx="100" cy="100" rx="54" ry="69" fill="${getContrastLevel(wm)}"/>
                    <!-- Ventricles (CSF) -->
                    <path d="M 85 80 Q 95 60 100 85 Q 105 60 115 80 Q 120 110 105 120 Q 100 130 95 120 Q 80 110 85 80 Z" fill="${getContrastLevel(csf)}"/>
                </svg>`;
        }
    };
    
    return svgs[region] ? svgs[region]() : svgs['Abdomen']();
}

// Funzione di rendering grafico (chiamata dal main.js)
function renderPhantom() {
    const container = document.getElementById('phantom-container');
    container.innerHTML = getPhantomSVG(window.state.Region);
}