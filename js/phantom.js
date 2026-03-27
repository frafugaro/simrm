// 1. DATABASE TISSUTALE (Siemens Vida 3T)
// T1 [ms], T2 [ms], PD[0.0 - 1.0]
const tissueDatabase = {
    abdomen: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        liver: { t1: 810, t2: 45, pd: 0.75, isFat: false },
        spleen: { t1: 1100, t2: 80, pd: 0.85, isFat: false },
        kidney_cortex: { t1: 1150, t2: 90, pd: 0.85, isFat: false },
        kidney_medulla: { t1: 1500, t2: 140, pd: 0.90, isFat: false },
        fluids: { t1: 4000, t2: 2000, pd: 1.0, isFat: false }, // Bile / Ascite
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        spine: { t1: 300, t2: 0.5, pd: 0.1, isFat: false } // Corticale Ossea
    },
    pelvis: {
        prostate_pz: { t1: 1200, t2: 150, pd: 0.90, isFat: false },
        prostate_tz: { t1: 1100, t2: 80, pd: 0.80, isFat: false },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false }, // Corticale
        bladder: { t1: 4000, t2: 2000, pd: 1.0, isFat: false }, // Urina
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        rectum: { t1: 800, t2: 50, pd: 0.50, isFat: false } // Feci / Aria
    },
    thorax: {
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },
        muscle: { t1: 900, t2: 50, pd: 0.75, isFat: false },
        lung: { t1: 1200, t2: 30, pd: 0.20, isFat: false }, // Parenchima polmonare (Molto nero)
        heart: { t1: 900, t2: 50, pd: 0.80, isFat: false }, // Miocardio
        spine: { t1: 300, t2: 0.5, pd: 0.10, isFat: false }
    },
    head: {
        gm: { t1: 1300, t2: 110, pd: 0.85, isFat: false }, // Sostanza Grigia
        wm: { t1: 850, t2: 80, pd: 0.70, isFat: false },   // Sostanza Bianca
        csf: { t1: 4000, t2: 2000, pd: 1.0, isFat: false },// LCR / Ventricoli
        fat: { t1: 250, t2: 70, pd: 1.0, isFat: true },    // Sottocute
        bone: { t1: 300, t2: 0.5, pd: 0.10, isFat: false } // Calotta cranica
    }
};

// 2. MAPPATURA SCALA DI GRIGI (Grayscale Mapping)
function mapSignalToGrayscale(S) {
    if (S < 0.05) return '#0a0a0a'; // L0: Nero (Osso, Aria, Grasso in Fat Sat)
    if (S < 0.25) return '#3c3c3c'; // L1: Grigio Scuro (Es. Fegato in T2)
    if (S < 0.50) return '#787878'; // L2: Grigio Medio
    if (S < 0.75) return '#bebebe'; // L3: Grigio Chiaro (Es. Grasso in T2)
    return '#f5f5f5';               // L4: Bianco (Es. Liquidi in T2)
}

// 3. LOGICA DI CONTRASTO FISICO (Bloch SE)
window.getSignalIntensity = function(tissue) {
    const s = window.state;
    
    // Logica di Saturazione (Fat/Water Sat)
    if (s.saturation === 'Fat Sat' && tissue.isFat) return mapSignalToGrayscale(0);
    if (s.saturation === 'Water Sat' && !tissue.isFat) return mapSignalToGrayscale(0);

    const TR = Math.max(1, s.tr);
    const TE = Math.max(1, s.te);

    // Formula di Bloch per sequenza Spin Echo standard
    // S = PD * (1 - exp(-TR / T1)) * exp(-TE / T2)
    const signal = tissue.pd * (1 - Math.exp(-TR / tissue.t1)) * Math.exp(-TE / tissue.t2);
    
    return mapSignalToGrayscale(signal);
};

// 4. INTERAZIONE PHANTOM-FISICA (Rendering)
window.updatePhantomGraphics = function(phys) {
    const s = window.state;

    // A. Nascondi tutti i gruppi anatomici e mostra solo quello selezionato
    document.querySelectorAll('g[id^="ph-group-"]').forEach(el => el.classList.add('hidden'));
    let viewId = `${s.region}-axial`; // La simulazione vettoriale si concentra sull'assiale
    const activeGroup = document.getElementById(`ph-group-${viewId}`);
    if(activeGroup) activeGroup.classList.remove('hidden');

    // Funzione helper per iniettare il colore
    const setFill = (id, tissueCode, region) => {
        const el = document.getElementById(id);
        if(el && tissueDatabase[region] && tissueDatabase[region][tissueCode]) {
            el.setAttribute('fill', window.getSignalIntensity(tissueDatabase[region][tissueCode]));
        }
    };

    // B. Applica il contrasto tissutale agli SVG ID (da index.html)
    if (s.region === 'abdomen') {
        setFill('ph-abd-ax-fat', 'fat', 'abdomen');
        setFill('ph-abd-ax-muscle', 'muscle', 'abdomen');
        setFill('ph-abd-ax-liver', 'liver', 'abdomen');
        setFill('ph-abd-ax-spleen', 'spleen', 'abdomen');
        setFill('ph-abd-ax-kidney-cortex', 'kidney_cortex', 'abdomen');
        setFill('ph-abd-ax-kidney-medulla', 'kidney_medulla', 'abdomen');
        setFill('ph-abd-ax-kidney-cortex-l', 'kidney_cortex', 'abdomen');
        setFill('ph-abd-ax-kidney-medulla-l', 'kidney_medulla', 'abdomen');
        setFill('ph-abd-ax-spine', 'spine', 'abdomen');
    } else if (s.region === 'pelvis') {
        setFill('ph-pelvis-ax-fat', 'fat', 'pelvis');
        setFill('ph-pelvis-ax-muscle', 'muscle', 'pelvis');
        setFill('ph-pelvis-ax-prostate-pz', 'prostate_pz', 'pelvis');
        setFill('ph-pelvis-ax-prostate-tz', 'prostate_tz', 'pelvis');
        setFill('ph-pelvis-ax-bladder', 'bladder', 'pelvis');
        setFill('ph-pelvis-ax-rectum', 'rectum', 'pelvis');
        setFill('ph-pelvis-ax-bone-l', 'bone', 'pelvis');
        setFill('ph-pelvis-ax-bone-r', 'bone', 'pelvis');
    } else if (s.region === 'thorax') {
        setFill('ph-tho-ax-fat', 'fat', 'thorax');
        setFill('ph-tho-ax-muscle', 'muscle', 'thorax');
        setFill('ph-tho-ax-lung-r', 'lung', 'thorax');
        setFill('ph-tho-ax-lung-l', 'lung', 'thorax');
        setFill('ph-tho-ax-heart', 'heart', 'thorax');
        setFill('ph-tho-ax-spine', 'spine', 'thorax');
    } else if (s.region === 'head') {
        setFill('ph-hd-ax-fat', 'fat', 'head');
        setFill('ph-hd-ax-bone', 'bone', 'head');
        setFill('ph-hd-ax-csf', 'csf', 'head');
        setFill('ph-hd-ax-gm', 'gm', 'head');
        setFill('ph-hd-ax-wm', 'wm', 'head');
        setFill('ph-hd-ax-ventricle', 'csf', 'head');
    }

    // C. Applicazione Rumore in base all'SNR e penalità g-Factor
    let baseNoiseOpacity = Math.max(0, (1.0 - (phys.snrFinal || 1.0)) * 0.3);
    let gFactorOpacity = (s.accelType === 'GRAPPA' && s.accelR > 2.0) ? (s.accelR - 2.0) * 0.15 * s.gFactor : 0;
    
    document.getElementById('ph-noise').setAttribute('opacity', baseNoiseOpacity);
    document.getElementById('ph-noise-gfactor').setAttribute('opacity', gFactorOpacity);

    // D. Compressed Sensing Denoising
    let currentFilter = 'grayscale(100%)';
    if (s.accelType === 'CS') {
        const blurAmount = (s.csFactor - 1) * 0.3; // Emulazione Denoising Iterativo
        currentFilter += ` blur(${blurAmount}px) contrast(110%)`;
    }
    document.getElementById('phantom-wrapper').style.filter = currentFilter;

    // E. Artefatto da Chemical Shift (Shift spaziale su asse X lungo direzione di lettura/fase)
    let shiftPx = 0;
    let dropShadow = 'none';
    if (phys.bwHzPx < 100) { shiftPx = 3; dropShadow = 'drop-shadow(-3px 0px 0px rgba(0,0,0,1))'; }
    else if (phys.bwHzPx <= 250) { shiftPx = 1; dropShadow = 'drop-shadow(-1px 0px 0px rgba(0,0,0,0.8))'; }
    
    document.querySelectorAll('.transform-water').forEach(el => {
        el.style.transform = `translateX(${shiftPx}px)`;
        el.style.filter = shiftPx > 0 ? dropShadow : '';
        el.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s';
    });
};
