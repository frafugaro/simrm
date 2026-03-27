// js/phantom.js

const db3T = {
    Abdomen: {
        fat: { t1: 250, t2: 70, pd: 1.0 },
        liver: { t1: 810, t2: 45, pd: 0.75 },
        spleen: { t1: 1100, t2: 80, pd: 0.85 },
        kidney: { t1: 1150, t2: 90, pd: 0.85 },
        fluids: { t1: 4000, t2: 2000, pd: 1.0 }
    },
    Pelvis: {
        fat: { t1: 250, t2: 70, pd: 1.0 },
        prostatePZ: { t1: 1200, t2: 150, pd: 0.9 },
        prostateTZ: { t1: 1100, t2: 80, pd: 0.8 },
        bladder: { t1: 4000, t2: 2000, pd: 1.0 },
        bone: { t1: 300, t2: 0.5, pd: 0.1 }
    },
    Skull: {
        fat: { t1: 250, t2: 70, pd: 1.0 },
        gm: { t1: 1300, t2: 110, pd: 0.85 },
        wm: { t1: 850, t2: 80, pd: 0.7 },
        csf: { t1: 4000, t2: 2000, pd: 1.0 },
        bone: { t1: 300, t2: 0.5, pd: 0.1 }
    },
    Thorax: {
        fat: { t1: 250, t2: 70, pd: 1.0 },
        heart: { t1: 900, t2: 50, pd: 0.8 },
        lung: { t1: 1200, t2: 30, pd: 0.2 }
    }
};

function mapToGrayscale(signal) {
    const s = signal * 4.0; // Diagnostic Gain
    if (s < 0.05) return '#0a0a0a'; // L0
    if (s < 0.25) return '#3c3c3c'; // L1
    if (s < 0.50) return '#787878'; // L2
    if (s < 0.75) return '#bebebe'; // L3
    return '#f5f5f5';               // L4
}

function calcBloch(tissueObj, tr, te, isFat, fatSat) {
    if (isFat && fatSat === 'Fat Sat') return '#0a0a0a';
    if (!isFat && fatSat === 'Water Sat') return '#0a0a0a';
    
    // S = PD * (1 - exp(-TR/T1)) * exp(-TE/T2)
    const s = tissueObj.pd * (1 - Math.exp(-tr / tissueObj.t1)) * Math.exp(-te / tissueObj.t2);
    return mapToGrayscale(s);
}

window.updatePhantom = function(snrFinal) {
    const s = window.state;
    const tr = parseFloat(s.tr) || 2500;
    const te = parseFloat(s.te) || 90;
    const fatSat = s.fatWater;
    const region = s.region;
    
    document.getElementById('phantom-title').innerText = `${s.orientation} ${region}`;
    const viewport = document.getElementById('mri-viewport');
    
    let svgContent = '';

    if (region === 'Abdomen') {
        const cFat = calcBloch(db3T.Abdomen.fat, tr, te, true, fatSat);
        const cLiver = calcBloch(db3T.Abdomen.liver, tr, te, false, fatSat);
        const cSpleen = calcBloch(db3T.Abdomen.spleen, tr, te, false, fatSat);
        const cKidney = calcBloch(db3T.Abdomen.kidney, tr, te, false, fatSat);
        
        svgContent = `
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-2xl">
            <ellipse cx="100" cy="100" rx="90" ry="70" fill="${cFat}" />
            <!-- Liver -->
            <path d="M 20 100 C 20 50, 80 40, 110 45 C 130 50, 110 80, 115 100 C 120 120, 90 140, 50 140 C 20 140, 20 120, 20 100 Z" fill="${cLiver}"/>
            <!-- Spleen -->
            <path d="M 140 60 C 170 65, 180 90, 170 110 C 160 130, 140 120, 135 90 C 130 60, 140 60, 140 60 Z" fill="${cSpleen}"/>
            <!-- Kidneys -->
            <ellipse cx="60" cy="130" rx="15" ry="20" transform="rotate(-20 60 130)" fill="${cKidney}"/>
            <ellipse cx="140" cy="130" rx="15" ry="20" transform="rotate(20 140 130)" fill="${cKidney}"/>
        </svg>`;
    } else if (region === 'Pelvis') {
        const cFat = calcBloch(db3T.Pelvis.fat, tr, te, true, fatSat);
        const cBladder = calcBloch(db3T.Pelvis.bladder, tr, te, false, fatSat);
        const cPZ = calcBloch(db3T.Pelvis.prostatePZ, tr, te, false, fatSat);
        const cTZ = calcBloch(db3T.Pelvis.prostateTZ, tr, te, false, fatSat);
        const cBone = calcBloch(db3T.Pelvis.bone, tr, te, false, fatSat);
        
        svgContent = `
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-2xl">
            <ellipse cx="100" cy="100" rx="90" ry="80" fill="${cFat}" />
            <circle cx="40" cy="110" r="20" fill="${cBone}" />
            <circle cx="160" cy="110" r="20" fill="${cBone}" />
            <ellipse cx="100" cy="60" rx="40" ry="30" fill="${cBladder}" />
            <path d="M 75 110 C 75 90, 125 90, 125 110 C 130 130, 115 140, 100 140 C 85 140, 70 130, 75 110 Z" fill="${cPZ}" />
            <ellipse cx="100" cy="115" rx="15" ry="10" fill="${cTZ}" />
        </svg>`;
    } else if (region === 'Skull') {
        const cFat = calcBloch(db3T.Skull.fat, tr, te, true, fatSat);
        const cBone = calcBloch(db3T.Skull.bone, tr, te, false, fatSat);
        const cGM = calcBloch(db3T.Skull.gm, tr, te, false, fatSat);
        const cWM = calcBloch(db3T.Skull.wm, tr, te, false, fatSat);
        const cCSF = calcBloch(db3T.Skull.csf, tr, te, false, fatSat);
        
        svgContent = `
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-2xl">
            <ellipse cx="100" cy="100" rx="75" ry="90" fill="${cFat}" />
            <ellipse cx="100" cy="100" rx="70" ry="85" fill="${cBone}" />
            <ellipse cx="100" cy="100" rx="65" ry="80" fill="${cCSF}" />
            <ellipse cx="100" cy="100" rx="60" ry="75" fill="${cGM}" />
            <path d="M 55 100 C 55 70, 80 45, 100 45 C 120 45, 145 70, 145 100 C 145 130, 120 155, 100 155 C 80 155, 55 130, 55 100 Z" fill="${cWM}" />
            <path d="M 85 90 Q 100 60 115 90 Q 120 120 100 130 Q 80 120 85 90 Z" fill="${cCSF}" />
        </svg>`;
    } else {
        svgContent = `<div class="text-slate-500 flex items-center justify-center h-full text-xs">Region Graphics N/A</div>`;
    }

    // Aggiungi rumore basato su SNR
    const noiseOpacity = Math.max(0, (1.0 - snrFinal)*0.3);
    const filterHTML = `
        <svg style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none; opacity:${noiseOpacity}; mix-blend-mode:screen;">
            <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
    `;

    viewport.innerHTML = svgContent + filterHTML;
    
    if (s.accelMode === 'CS') {
        viewport.style.filter = `blur(${(parseFloat(s.csFactor)-1)*0.4}px) contrast(110%) grayscale(100%)`;
    } else {
        viewport.style.filter = `grayscale(100%)`;
    }
};
