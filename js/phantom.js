const tissueDB = {
    Abdomen: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        liver: { t1: 810, t2: 45, pd: 0.75, isFat: false },
        spleen: { t1: 1100, t2: 80, pd: 0.85, isFat: false },
        kidneys: { t1: 1150, t2: 90, pd: 0.85, isFat: false },
        fluids: { t1: 4000, t2: 2000, pd: 1.0, isFat: false }
    },
    Pelvis: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        pz: { t1: 1200, t2: 150, pd: 0.9, isFat: false },
        tz: { t1: 1100, t2: 80, pd: 0.8, isFat: false },
        bladder: { t1: 4000, t2: 2000, pd: 1.0, isFat: false },
        bone: { t1: 300, t2: 0.5, pd: 0.1, isFat: false },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false }
    },
    Skull: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        gm: { t1: 1300, t2: 110, pd: 0.85, isFat: false },
        wm: { t1: 850, t2: 80, pd: 0.7, isFat: false },
        csf: { t1: 4000, t2: 2000, pd: 1.0, isFat: false },
        bone: { t1: 300, t2: 0.5, pd: 0.1, isFat: false }
    },
    Thorax: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        lung: { t1: 1200, t2: 30, pd: 0.2, isFat: false },
        heart: { t1: 900, t2: 50, pd: 0.8, isFat: false }
    }
};

function mapToGrayscale(S) {
    const gain = 5.0; S = S * gain;
    if (S < 0.05) return '#0a0a0a'; // L0: Black
    if (S < 0.25) return '#3c3c3c'; // L1: Dark Gray
    if (S < 0.50) return '#787878'; // L2: Mid Gray
    if (S < 0.75) return '#bebebe'; // L3: Light Gray
    return '#f5f5f5';               // L4: White
}

function calcBloch(tissue) {
    const TR = Math.max(1, parseFloat(window.state.tr));
    const TE = Math.max(1, parseFloat(window.state.te));
    const fw = window.state.fwContrast;
    
    if (fw === 'Fat Sat' && tissue.isFat) return mapToGrayscale(0);
    if (fw === 'Water Sat' && !tissue.isFat) return mapToGrayscale(0);

    const S = tissue.pd * (1 - Math.exp(-TR/tissue.t1)) * Math.exp(-TE/tissue.t2);
    return mapToGrayscale(S);
}

window.renderPhantom = function(snr) {
    const region = window.state.region;
    const db = tissueDB[region] || tissueDB.Abdomen;
    
    let svgContent = '';
    
    if (region === 'Abdomen') {
        const cFat = calcBloch(db.fat);
        const cLiv = calcBloch(db.liver);
        const cSpl = calcBloch(db.spleen);
        const cKid = calcBloch(db.kidneys);
        svgContent = `
            <ellipse cx="100" cy="100" rx="90" ry="70" fill="${cFat}"/>
            <path d="M 20 100 C 20 50, 80 40, 110 50 C 120 70, 110 90, 120 120 C 100 140, 30 140, 20 100 Z" fill="${cLiv}"/>
            <path d="M 140 60 C 160 50, 180 70, 175 90 C 165 110, 140 100, 140 60 Z" fill="${cSpl}"/>
            <ellipse cx="60" cy="130" rx="15" ry="20" transform="rotate(-30 60 130)" fill="${cKid}"/>
            <ellipse cx="140" cy="130" rx="15" ry="20" transform="rotate(30 140 130)" fill="${cKid}"/>
        `;
    } else if (region === 'Pelvis') {
        const cFat = calcBloch(db.fat);
        const cMus = calcBloch(db.muscle);
        const cPZ = calcBloch(db.pz);
        const cTZ = calcBloch(db.tz);
        const cBla = calcBloch(db.bladder);
        svgContent = `
            <path d="M 20 100 C 20 20, 180 20, 180 100 C 180 180, 20 180, 20 100 Z" fill="${cFat}"/>
            <path d="M 30 120 Q 100 160 170 120 L 150 100 Q 100 130 50 100 Z" fill="${cMus}"/>
            <path d="M 70 60 C 70 30, 130 30, 130 60 C 130 80, 100 90, 70 60 Z" fill="${cBla}"/>
            <path d="M 80 105 C 80 90, 120 90, 120 105 C 125 125, 115 130, 100 130 C 85 130, 75 125, 80 105 Z" fill="${cPZ}"/>
            <ellipse cx="100" cy="108" rx="12" ry="8" fill="${cTZ}"/>
        `;
    } else if (region === 'Skull') {
        const cFat = calcBloch(db.fat);
        const cBone = calcBloch(db.bone);
        const cGM = calcBloch(db.gm);
        const cWM = calcBloch(db.wm);
        const cCSF = calcBloch(db.csf);
        svgContent = `
            <ellipse cx="100" cy="100" rx="75" ry="90" fill="${cFat}"/>
            <ellipse cx="100" cy="100" rx="70" ry="85" fill="${cBone}"/>
            <path d="M 40 100 C 40 65, 68 28, 100 28 C 132 28, 160 65, 160 100 C 160 135, 132 168, 100 168 C 68 168, 40 135, 40 100 Z" fill="${cGM}"/>
            <path d="M 50 100 C 50 75, 75 45, 100 45 C 125 45, 150 75, 150 100 C 150 125, 125 155, 100 155 C 75 155, 50 125, 50 100 Z" fill="${cWM}"/>
            <path d="M 90 90 Q 100 50 110 90 Q 120 120 100 130 Q 80 120 90 90 Z" fill="${cCSF}"/>
        `;
    } else {
        const cFat = calcBloch(db.fat);
        const cLung = calcBloch(db.lung);
        const cHeart = calcBloch(db.heart);
        svgContent = `
            <ellipse cx="100" cy="100" rx="90" ry="70" fill="${cFat}"/>
            <path d="M 15 100 C 15 60, 45 40, 80 45 C 80 80, 70 130, 80 150 C 45 145, 15 130, 15 100 Z" fill="${cLung}"/>
            <path d="M 185 100 C 185 60, 155 40, 120 45 C 120 80, 130 130, 120 150 C 155 145, 185 130, 185 100 Z" fill="${cLung}"/>
            <circle cx="100" cy="85" r="28" fill="${cHeart}"/>
        `;
    }

    const noiseOpacity = Math.max(0, (1.0 - (snr || 1.0)) * 0.3);
    const filter = window.state.accelMode === 'CS' ? 'blur(1px)' : 'none';

    document.getElementById('mri-viewport').innerHTML = `
        <svg viewBox="0 0 200 200" class="w-full h-full" style="filter: ${filter}">
            <defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/></filter></defs>
            ${svgContent}
            <rect x="0" y="0" width="200" height="200" filter="url(#noise)" opacity="${noiseOpacity}" style="mix-blend-mode: screen; pointer-events: none;"/>
        </svg>
    `;
};
