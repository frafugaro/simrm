// ==========================================================
// 1. DATABASE TISSUTALE (Siemens Vida 3T)
// ==========================================================
const tissueDatabase = {
    abdomen: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true, isSolid: false },
        liver: { t1: 810, t2: 45, pd: 0.75, isFat: false, isSolid: true },
        spleen: { t1: 1100, t2: 80, pd: 0.85, isFat: false, isSolid: true },
        kidney_cortex: { t1: 1150, t2: 90, pd: 0.85, isFat: false, isSolid: true },
        kidney_medulla: { t1: 1500, t2: 140, pd: 0.90, isFat: false, isSolid: true },
        fluids: { t1: 4000, t2: 2000, pd: 1.0, isFat: false, isSolid: false },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false, isSolid: true },
        spine: { t1: 300, t2: 0.5, pd: 0.1, isFat: false, isSolid: false }
    },
    pelvis: {
        prostate_pz: { t1: 1200, t2: 150, pd: 0.90, isFat: false, isSolid: true },
        prostate_tz: { t1: 1100, t2: 80, pd: 0.80, isFat: false, isSolid: true },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false, isSolid: true },
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false, isSolid: false },
        bladder: { t1: 4000, t2: 2000, pd: 1.0, isFat: false, isSolid: false },
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true, isSolid: false },
        rectum: { t1: 800, t2: 50, pd: 0.50, isFat: false, isSolid: true }
    },
    thorax: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true, isSolid: false },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false, isSolid: true },
        lung: { t1: 1200, t2: 30, pd: 0.20, isFat: false, isSolid: true },
        heart: { t1: 900, t2: 50, pd: 0.80, isFat: false, isSolid: true },
        spine: { t1: 300, t2: 0.5, pd: 0.10, isFat: false, isSolid: false }
    },
    head: {
        gm: { t1: 1300, t2: 110, pd: 0.85, isFat: false, isSolid: true },
        wm: { t1: 850, t2: 80, pd: 0.70, isFat: false, isSolid: true },
        csf: { t1: 4000, t2: 2000, pd: 1.0, isFat: false, isSolid: false },
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true, isSolid: false },
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false, isSolid: false }
    }
};

// ==========================================================
// 2. LOGICA DI NORMALIZZAZIONE E CONTRASTO (Bloch)
// ==========================================================
function signalToColor(signal, isSolidTissue) {
    // Guadagno dinamico: eleva il segnale di base per evitare parenchimi troppo neri
    const gain = 4.0; 
    let gray = Math.round(signal * gain * 255);
    
    // Offset di salvataggio diagnostico (assicura persistenza visiva parenchimi in T2/T1)
    if (isSolidTissue && signal > 0.02) {
        gray = Math.max(45, gray);
    }
    
    // Clamping dei valori a range validi RGB
    gray = Math.min(255, Math.max(0, gray));
    return `rgb(${gray}, ${gray}, ${gray})`;
}

window.getSignalIntensity = function(tissue) {
    const s = window.state;
    
    // Sostituzione segnale su Fat/Water Sat
    if (s.saturation === 'Fat Sat' && tissue.isFat) return signalToColor(0, false);
    if (s.saturation === 'Water Sat' && !tissue.isFat) return signalToColor(0, false);

    const TR = Math.max(1, s.tr);
    const TE = Math.max(1, s.te);

    // Formula di Bloch - Spin Echo
    const signal = tissue.pd * (1 - Math.exp(-TR / tissue.t1)) * Math.exp(-TE / tissue.t2);
    
    return signalToColor(signal, tissue.isSolid);
};

// ==========================================================
// 3. FUNZIONI HELPER DI DISEGNO VETTORIALE
// ==========================================================
function drawPath(d, fill, id, className = "") {
    return `<path id="${id}" d="${d}" fill="${fill}" class="${className}" />`;
}

function drawEllipse(cx, cy, rx, ry, fill, id, transform = "", className = "") {
    return `<ellipse id="${id}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="${transform}" class="${className}" />`;
}

function drawCircle(cx, cy, r, fill, id, className = "") {
    return `<circle id="${id}" cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" class="${className}" />`;
}

// ==========================================================
// 4. RENDERING E SINCRONIZZAZIONE MODULARE
// ==========================================================
window.renderPhantom = function(phys) {
    // Inizializza regione predefinita se mancante
    window.state.region = window.state.region || 'abdomen';
    const s = window.state;
    const region = s.region;

    // Definizioni Filtri
    const defs = `<defs>
        <filter id="mri-noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0" /></filter>
        <mask id="gfactor-mask">
            <radialGradient id="gfactor-grad" cx="50%" cy="50%" r="45%">
                <stop offset="0%" stop-color="white" stop-opacity="1" />
                <stop offset="100%" stop-color="white" stop-opacity="0" />
            </radialGradient>
            <rect x="0" y="0" width="200" height="200" fill="url(#gfactor-grad)" />
        </mask>
        <filter id="texture-parenchyma"><feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="noise"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0" in2="SourceGraphic" operator="in"/></filter>
    </defs>`;

    let svgContent = '';

    // ==========================================================
    // ANATOMIA: ADDOME (Radiological View)
    // ==========================================================
    if (region === 'abdomen') {
        const cFat = getSignalIntensity(tissueDatabase.abdomen.fat);
        const cMuscle = getSignalIntensity(tissueDatabase.abdomen.muscle);
        const cLiver = getSignalIntensity(tissueDatabase.abdomen.liver);
        const cSpleen = getSignalIntensity(tissueDatabase.abdomen.spleen);
        const cKCor = getSignalIntensity(tissueDatabase.abdomen.kidney_cortex);
        const cKMed = getSignalIntensity(tissueDatabase.abdomen.kidney_medulla);
        const cSpine = getSignalIntensity(tissueDatabase.abdomen.spine);

        svgContent = `
            <g id="ph-group-abdomen-axial">
                ${drawEllipse(100, 100, 95, 75, cFat, "ph-abd-fat", "", "transition-colors duration-300")}
                ${drawEllipse(100, 100, 88, 68, cMuscle, "ph-abd-muscle", "", "transition-colors duration-300 transform-water")}
                
                <!-- Fegato: Path organico a Destra paziente (Sinistra schermo / SVG) -->
                ${drawPath("M 15 100 C 15 40, 75 30, 105 40 C 125 45, 130 65, 115 85 C 105 100, 85 130, 45 135 C 20 138, 15 120, 15 100 Z", cLiver, "ph-abd-liver", "transition-colors duration-300 transform-water texture-parenchyma")}
                
                <!-- Milza: Ellisse ruotata a Sinistra paziente (Destra schermo / SVG) -->
                ${drawEllipse(165, 75, 18, 35, cSpleen, "ph-abd-spleen", "rotate(30 165 75)", "transition-colors duration-300 transform-water texture-parenchyma")}
                
                <!-- Reni: Ingranditi e definiti Corticale/Midollare -->
                <g class="transform-water">
                    <!-- Rene Dx (SVG sx) -->
                    ${drawEllipse(45, 135, 18, 25, cKCor, "ph-abd-kidney-r", "rotate(-25 45 135)", "transition-colors duration-300")}
                    ${drawEllipse(47, 133, 10, 15, cKMed, "ph-abd-kidney-r-med", "rotate(-25 47 133)", "transition-colors duration-300")}
                    <!-- Rene Sx (SVG dx) -->
                    ${drawEllipse(155, 135, 18, 25, cKCor, "ph-abd-kidney-l", "rotate(25 155 135)", "transition-colors duration-300")}
                    ${drawEllipse(153, 133, 10, 15, cKMed, "ph-abd-kidney-l-med", "rotate(25 153 133)", "transition-colors duration-300")}
                </g>
                
                <!-- Colonna -->
                ${drawCircle(100, 150, 12, cSpine, "ph-abd-spine", "transition-colors duration-300 transform-water")}
            </g>
        `;
    } 
    // Fallback visivi temporanei per salvaguardare switch su altre regioni
    else {
        const cFat = getSignalIntensity(tissueDatabase[region]?.fat || tissueDatabase.abdomen.fat);
        const cMuscle = getSignalIntensity(tissueDatabase[region]?.muscle || tissueDatabase.abdomen.muscle);
        svgContent = `
            <g id="ph-group-generic-axial">
                ${drawEllipse(100, 100, 95, 75, cFat, "ph-gen-fat", "", "transition-colors duration-300")}
                ${drawEllipse(100, 100, 85, 65, cMuscle, "ph-gen-muscle", "", "transition-colors duration-300 transform-water")}
            </g>
        `;
    }

    // Costruzione Finale SVG nel wrapper
    const wrapper = document.getElementById('phantom-wrapper');
    if (wrapper) {
        wrapper.innerHTML = `
        <svg viewBox="0 0 200 200" class="w-full h-full preserve-3d">
            ${defs}
            ${svgContent}
            <!-- Overlay Rumore (calcolato su phys) -->
            <rect id="ph-noise" x="0" y="0" width="200" height="200" filter="url(#mri-noise)" opacity="0" style="mix-blend-mode: screen; pointer-events: none; transition: opacity 0.3s;" />
            <rect id="ph-noise-gfactor" x="0" y="0" width="200" height="200" filter="url(#mri-noise)" mask="url(#gfactor-mask)" opacity="0" style="mix-blend-mode: screen; pointer-events: none; transition: opacity 0.3s;" />
        </svg>`;
    }

    // Applicazione Artefatti e Parametri Fisici
    if (phys) {
        let baseNoiseOpacity = Math.max(0, (1.0 - (phys.snrFinal || 1.0)) * 0.3);
        let gFactorOpacity = (s.accelType === 'GRAPPA' && s.accelR > 2.0) ? (s.accelR - 2.0) * 0.15 * s.gFactor : 0;
        
        const noiseEl = document.getElementById('ph-noise');
        const gNoiseEl = document.getElementById('ph-noise-gfactor');
        if(noiseEl) noiseEl.setAttribute('opacity', baseNoiseOpacity);
        if(gNoiseEl) gNoiseEl.setAttribute('opacity', gFactorOpacity);

        let currentFilter = 'grayscale(100%)';
        if (s.accelType === 'CS') {
            const blurAmount = (s.csFactor - 1) * 0.3; 
            currentFilter += ` blur(${blurAmount}px) contrast(110%)`;
        }
        if (wrapper) wrapper.style.filter = currentFilter;

        let shiftPx = 0;
        let dropShadow = 'none';
        if (phys.bwHzPx < 100) { shiftPx = 3; dropShadow = 'drop-shadow(-3px 0px 0px rgba(0,0,0,1))'; }
        else if (phys.bwHzPx <= 250) { shiftPx = 1; dropShadow = 'drop-shadow(-1px 0px 0px rgba(0,0,0,0.8))'; }
        
        document.querySelectorAll('.transform-water').forEach(el => {
            el.style.transform = `translateX(${shiftPx}px)`;
            el.style.filter = shiftPx > 0 ? dropShadow : '';
            el.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s';
        });
    }
};
