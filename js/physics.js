// js/physics.js - Motore Fisico 3T Siemens Vida
window.calculatePhysics = function() {
    const s = window.state || {};
    
    // 1. PARSING RIGOROSO DEI PARAMETRI (Evita concatenazioni di stringhe e NaN)
    const dimension = s.dimension || '3D';
    const accelType = s.accelType || 'GRAPPA';
    const accelR = Math.max(1, parseFloat(s.accelR) || 1);
    const baseRes = Math.max(1, parseFloat(s.baseRes) || 320);
    const fovPhasePct = parseFloat(s.fovPhasePct) || 100;
    const phaseResPct = parseFloat(s.phaseResPct) || 100;
    const sliceOS = parseFloat(s.sliceOS) || 0;
    const slicePartial = parseFloat(s.slicePartial) || 100;
    const sliceResPct = parseFloat(s.sliceResPct) || 100;
    const slices = Math.max(1, parseFloat(s.slices) || 60);
    const fovRead = parseFloat(s.fovRead) || 220;
    const sliceThick = parseFloat(s.sliceThick) || 1.0;
    const interp = parseFloat(s.interp) || 0;
    const phaseOS = parseFloat(s.phaseOS) || 0;
    const phasePartial = parseFloat(s.phasePartial) || 100;
    const nex = parseFloat(s.nex) || 1.0;
    const tr = Math.max(1, parseFloat(s.tr) || 2200);
    const turboFactor = Math.max(1, parseFloat(s.turboFactor) || 64);
    const echoSpacing = parseFloat(s.echoSpacing) || 4.4;
    const conc = Math.max(1, parseFloat(s.conc) || 1);
    const csFactor = Math.max(1, parseFloat(s.csFactor) || 1.0);
    const weight = Math.max(1, parseFloat(s.weight) || 75);
    const height = Math.max(1, parseFloat(s.height) || 175);
    const flipAngle = parseFloat(s.flipAngle) || 90;
    const bw = Math.max(1, parseFloat(s.bw) || 521);
    const te = parseFloat(s.te) || 105;
    const gFactorBase = parseFloat(s.gFactor) || 1.0;

    // Status derivati
    const is3D = dimension === '3D';
    const isCS = accelType === 'CS';
    const effR = isCS ? 1.0 : accelR;

    // 2. MATRICI EFFETTIVE
    const N_y = Math.max(1, Math.round(baseRes * (fovPhasePct / 100) * (phaseResPct / 100)));
    const actualSliceOS = is3D ? sliceOS : 0;
    const actualSlicePartial = is3D ? slicePartial : 100;
    const actualSliceResPct = is3D ? sliceResPct : 100;
    let N_z = is3D ? Math.max(1, Math.round(slices * (actualSliceResPct / 100))) : 1;

    // 3. RISOLUZIONE VOXEL
    const dx = fovRead / baseRes;
    let dy = (fovRead * (fovPhasePct / 100)) / N_y;
    if (fovPhasePct === 100 && phaseResPct === 100) dy = dx; 
    
    let dz = sliceThick;
    if (is3D) {
        const slabThickness = slices * sliceThick;
        dz = slabThickness / N_z;
    }

    const v_dx = interp == 1 ? dx/2 : dx;
    const v_dy = interp == 1 ? dy/2 : dy;
    const v_dz = (interp == 1 && is3D) ? dz/2 : dz;
    const V_voxel = dx * dy * dz;
    const isIsotropic = (Math.max(v_dx, v_dy, v_dz) - Math.min(v_dx, v_dy, v_dz)) <= 0.01;

    // 4. TEMPO DI ACQUISIZIONE (TA)
    const phaseOS_factor = (1 + phaseOS / 100);
    const phasePartial_factor = (phasePartial / 100);
    const effNy = N_y * phaseOS_factor * phasePartial_factor;
    
    let taSeconds = 0;
    let displayedShots = 0;
    let totalLines = 0;

    if (is3D) {
        const effNz = N_z * (1 + actualSliceOS / 100) * (actualSlicePartial / 100);
        totalLines = effNy * effNz;
        taSeconds = (totalLines * nex * tr) / (turboFactor * effR * 1000);
        displayedShots = totalLines / (turboFactor * effR);
    } else {
        totalLines = effNy * slices;
        const sliceTime = (echoSpacing * turboFactor + 10);
        const fettePerTR = Math.max(1, Math.floor(tr / sliceTime));
        taSeconds = (totalLines * nex) / (turboFactor * effR * fettePerTR) * (tr / 1000) * conc;
        displayedShots = totalLines / (turboFactor * effR);
    }

    if (isCS) {
        taSeconds /= csFactor;
        displayedShots /= csFactor;
    }

    // 5. CALCOLO SAR
    const bmi = weight / Math.pow(height/100, 2);
    const trSec = Math.max(0.01, tr / 1000);
    const flipAngleFactor = Math.pow(flipAngle / 180, 2);
    const sar = (0.002 * turboFactor * bmi / trSec) * flipAngleFactor;

    // 6. CALCOLO SNR 
    const bwHzPx = bw / N_y; 
    const bwRoot = Math.sqrt(521 / bw); 
    const t2Decay = Math.exp(-te / 85); 
    const acqTerm = is3D ? (nex * N_y * N_z) / 14500 : (nex * N_y) / 14500;
    
    let snrBase = (V_voxel / 0.64) * Math.sqrt(acqTerm) * bwRoot * t2Decay * 3.5;

    let bwMultiplier = 1.0;
    if (bwHzPx < 100) bwMultiplier = 1.15; 
    else if (bwHzPx > 250) bwMultiplier = 0.60; 
    let snrFinal = snrBase * bwMultiplier;

    let g_eff = gFactorBase;
    if (accelType === 'CAIPIRINHA') g_eff = Math.max(1.0, gFactorBase - 0.3);
    else if (accelType === 'GRAPPA') g_eff = gFactorBase;

    if (isCS) {
        let samplingRate = 1.0 / csFactor;
        let denoisingBoost = Math.sqrt(csFactor) * 0.9; 
        snrFinal = snrFinal * Math.sqrt(samplingRate) * denoisingBoost;
    } else {
        snrFinal = snrFinal * (1 / (g_eff * Math.sqrt(effR)));
    }

    // Protezione Finale NaN
    let snrFinalNaN = isNaN(snrFinal) ? 0.0 : snrFinal;
    let taMins = Math.floor((isNaN(taSeconds) ? 0 : taSeconds) / 60);
    let taSecs = Math.round((isNaN(taSeconds) ? 0 : taSeconds) % 60);

    // 7. SCRITTURA NEL DOM
    const setDOM = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    
    setDOM('out-ta', `${taMins}:${taSecs.toString().padStart(2, '0')}`);
    setDOM('out-etl', `${turboFactor} / ${Math.ceil(displayedShots || 0)}`);
    setDOM('out-sar', isNaN(sar) ? "0.0" : sar.toFixed(2));
    setDOM('out-res', `${(v_dx||0).toFixed(2)} × ${(v_dy||0).toFixed(2)} × ${(v_dz||0).toFixed(2)} mm`);
    setDOM('out-snr-base', isNaN(snrBase) ? "0.00" : snrBase.toFixed(2));
    setDOM('out-snr-final', snrFinalNaN.toFixed(2));
    setDOM('out-bw-real', `BW Reale: ${(bwHzPx||0).toFixed(1)} Hz/Px`);
    
    const isoEl = document.getElementById('out-iso');
    if(isoEl) {
        isoEl.innerText = isIsotropic ? 'ISO ✅' : 'ANISO';
        isoEl.className = `font-bold text-[10px] ${isIsotropic ? 'text-green-500' : 'text-yellow-600'}`;
    }

    const sarEl = document.getElementById('out-sar');
    if(sarEl) sarEl.className = sar > 3.2 ? 'font-mono text-sm text-red-400 font-bold border-b border-red-500 animate-pulse' : 'font-mono text-sm text-slate-200 border-b border-transparent';

    const snrFinalEl = document.getElementById('out-snr-final');
    const snrBoxEl = document.getElementById('box-snr-final');
    if(snrFinalEl && snrBoxEl) {
        if (snrFinalNaN < 0.8) { 
            snrBoxEl.className = "border border-red-500 bg-red-900/30 px-4 py-2 rounded flex-1 transition-colors relative";
            snrFinalEl.className = "font-mono text-xl font-bold text-red-400";
        } else {
            snrBoxEl.className = "border border-blue-500 bg-blue-900/20 px-4 py-2 rounded flex-1 transition-colors relative";
            snrFinalEl.className = "font-mono text-xl font-bold text-blue-400";
        }
    }

    // 8. TRIGGER GRAFICO OBBLIGATORIO
    if (typeof window.renderPhantom === 'function') {
        window.renderPhantom(snrFinalNaN);
    }
};
