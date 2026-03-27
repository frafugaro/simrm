window.calculatePhysics = function() {
    const s = window.state;
    
    // Status
    const is3D = s.dimension === '3D';
    const isCS = s.accelType === 'CS';
    const effR = isCS ? 1.0 : s.accelR;

    // Effective Matrices
    const N_x = s.baseRes;
    const N_y = Math.round(s.baseRes * (s.fovPhasePct / 100) * (s.phaseResPct / 100));
    const actualSliceOS = is3D ? s.sliceOS : 0;
    const actualSlicePartial = is3D ? s.slicePartial : 100;
    const actualSliceResPct = is3D ? s.sliceResPct : 100;
    let N_z = is3D ? Math.round(s.slices * (actualSliceResPct / 100)) : 1;

    // Voxel Resolution Calculations
    const dx = s.fovRead / N_x;
    let dy = (s.fovRead * (s.fovPhasePct / 100)) / N_y;
    if (s.fovPhasePct === 100 && s.phaseResPct === 100) dy = dx; 
    
    let dz = s.sliceThick;
    if (is3D) {
        const slabThickness = s.slices * s.sliceThick;
        dz = slabThickness / N_z;
    }

    // Interpolation handling
    const v_dx = s.interp == 1 ? dx/2 : dx;
    const v_dy = s.interp == 1 ? dy/2 : dy;
    const v_dz = (s.interp == 1 && is3D) ? dz/2 : dz;
    const V_voxel = dx * dy * dz;

    const maxDim = Math.max(v_dx, v_dy, v_dz);
    const minDim = Math.min(v_dx, v_dy, v_dz);
    const isIsotropic = (maxDim - minDim) <= 0.01;

    // Acquisition Time (TA)
    const phaseOS_factor = (1 + s.phaseOS / 100);
    const phasePartial_factor = (s.phasePartial / 100);
    const effNy = N_y * phaseOS_factor * phasePartial_factor;
    
    let taSeconds = 0;
    let displayedShots = 0;
    let totalLines = 0;

    const turbo = Math.max(1, s.turboFactor); // Prevent div by 0

    if (is3D) {
        const effNz = N_z * (1 + actualSliceOS / 100) * (actualSlicePartial / 100);
        totalLines = effNy * effNz;
        taSeconds = (totalLines * s.nex * s.tr) / (turbo * effR * 1000);
        displayedShots = totalLines / (turbo * effR);
    } else {
        totalLines = effNy * s.slices;
        const sliceTime = (s.echoSpacing * turbo + 10);
        const fettePerTR = Math.max(1, Math.floor(s.tr / sliceTime));
        taSeconds = (totalLines * s.nex) / (turbo * effR * fettePerTR) * (s.tr / 1000) * s.conc;
        displayedShots = totalLines / (turbo * effR);
    }

    if (isCS) {
        taSeconds /= s.csFactor;
        displayedShots /= s.csFactor;
    }

    // SAR Calculation
    const bmi = s.weight / Math.pow(s.height/100, 2);
    const trSec = Math.max(0.1, s.tr / 1000);
    const flipAngleFactor = Math.pow(s.flipAngle / 180, 2);
    const sar = (0.002 * turbo * bmi / trSec) * flipAngleFactor;

    // Base SNR
    const bwHzPx = s.bw / Math.max(1, N_y); 
    const bwRoot = Math.sqrt(521 / s.bw); 
    const t2Decay = Math.exp(-s.te / 85);
    const acqTerm = is3D ? (s.nex * N_y * N_z) / 14500 : (s.nex * N_y) / 14500;
    
    let snrBase = (V_voxel / 0.64) * Math.sqrt(acqTerm) * bwRoot * t2Decay * 3.5;

    // Chemical Shift / BW constraints on SNR
    let bwMultiplier = 1.0;
    if (bwHzPx < 100) bwMultiplier = 1.15; 
    else if (bwHzPx > 250) bwMultiplier = 0.60; 
    let snrFinal = snrBase * bwMultiplier;

    // Acceleration g-factor penalties
    let g_eff = s.gFactor;
    if (s.accelType === 'CAIPIRINHA') g_eff = Math.max(1.0, s.gFactor - 0.3);
    else if (s.accelType === 'GRAPPA') g_eff = s.gFactor;

    if (isCS) {
        let samplingRate = 1.0 / s.csFactor;
        let denoisingBoost = Math.sqrt(s.csFactor) * 0.9; 
        snrFinal = snrFinal * Math.sqrt(samplingRate) * denoisingBoost;
    } else {
        snrFinal = snrFinal * (1 / (g_eff * Math.sqrt(effR)));
    }

    return {
        taSeconds,
        displayedShots,
        sar,
        v_dx, v_dy, v_dz,
        isIsotropic,
        snrBase,
        snrFinal,
        bwHzPx
    };
};
