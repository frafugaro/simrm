// js/physics.js

window.calculatePhysics = function() {
    const s = window.state;

    // Parsing Numerico per sicurezza
    const nx = Math.max(1, parseFloat(s.nx));
    const phaseRes = parseFloat(s.phaseRes);
    const fovPhase = parseFloat(s.fovPhase);
    const phaseOS = parseFloat(s.phaseOS);
    const slices = Math.max(1, parseFloat(s.slices));
    const sliceOS = parseFloat(s.sliceOS);
    const tr = Math.max(1, parseFloat(s.tr));
    const te = Math.max(1, parseFloat(s.te));
    const nex = parseFloat(s.nex);
    const etl = Math.max(1, parseFloat(s.etl));
    const echoSpacing = parseFloat(s.echoSpacing);
    const conc = Math.max(1, parseFloat(s.conc));
    const csFactor = Math.max(1, parseFloat(s.csFactor));
    const fovRead = parseFloat(s.fovRead);
    const sliceThick = parseFloat(s.sliceThick);
    const weight = parseFloat(s.weight);
    const height = parseFloat(s.height);

    // 1. Matrici Effettive
    // effNy = Nx * (PhaseRes/100) * (FOVPhase/100) * (1 + PhaseOS/100)
    const effNy = nx * (phaseRes / 100) * (fovPhase / 100) * (1 + phaseOS / 100);
    // effNz = Slices * (1 + SliceOS/100) (solo se 3D)
    const effNz = s.dimension === '3D' ? slices * (1 + sliceOS / 100) : 1;

    // Fattore Accelerazione (R)
    let R = 1;
    let gFactor = 1.0;
    if (s.accelMode === 'GRAPPA') { R = parseFloat(s.accelPE); gFactor = 1.15; }
    else if (s.accelMode === 'CAIPIRINHA') { R = parseFloat(s.accelPE); gFactor = 1.05; }
    R = Math.max(1, R);

    // 2. Tempo di Acquisizione (TA)
    let TA = 0;
    let maxSlices = 1;
    
    if (s.dimension === '3D') {
        // TA 3D = (effNy * effNz * NEX * TR) / (ETL * R * 1000)
        TA = (effNy * effNz * nex * tr) / (etl * R * 1000);
    } else {
        // TA 2D
        maxSlices = tr / (echoSpacing * etl + 50);
        const limitSlices = Math.max(1, maxSlices);
        // TA = (effNy * NEX * TR * Math.ceil(Slices / maxSlices) * Conc) / (ETL * R * 1000)
        TA = (effNy * nex * tr * Math.ceil(slices / limitSlices) * conc) / (etl * R * 1000);
    }

    // 3. Risoluzione Spaziale (Voxel Volume)
    const dx = fovRead / nx;
    const dy = (fovRead * (fovPhase / 100)) / (nx * (phaseRes / 100) || 1);
    const dz = sliceThick;
    const voxelVol = dx * dy * dz;

    // 4. SAR Emulazione (W/kg)
    const bmi = weight / Math.pow(height / 100, 2);
    const sar = (0.002 * etl * bmi / (tr / 1000));

    // 5. SNR Calcoli
    // Base SNR: dipendente dal volume e parametri base di acquisizione
    let snrBase = (voxelVol / 0.64) * Math.sqrt((effNy * effNz * nex) / 100) * Math.exp(-te / 85);
    
    let snrFinal = snrBase;
    
    if (s.accelMode === 'CS') {
        // SNR CS = SNR_base * (1.2 / sqrt(CS_Factor))
        snrFinal = snrBase * (1.2 / Math.sqrt(csFactor));
        TA = TA / csFactor; // Applica riduzione tempo per CS
    } else if (s.accelMode === 'GRAPPA' || s.accelMode === 'CAIPIRINHA') {
        // SNR PI = SNR_base / (g * sqrt(R))
        snrFinal = snrBase / (gFactor * Math.sqrt(R));
    }

    // UPDATE DOM
    const taMin = Math.floor(TA / 60);
    const taSec = Math.floor(TA % 60).toString().padStart(2, '0');
    
    document.getElementById('out-ta').innerText = `${taMin}:${taSec}`;
    document.getElementById('out-etl').innerText = `${etl} / ${Math.ceil((effNy * effNz) / (etl * R))}`;
    document.getElementById('out-sar').innerText = isNaN(sar) ? "0.0" : sar.toFixed(2);
    document.getElementById('out-res').innerText = `${dx.toFixed(2)} × ${dy.toFixed(2)} × ${dz.toFixed(2)} mm`;
    document.getElementById('out-snr-base').innerText = isNaN(snrBase) ? "0.00" : snrBase.toFixed(2);
    document.getElementById('out-snr-final').innerText = isNaN(snrFinal) ? "0.00" : snrFinal.toFixed(2);

    // Call Phantom Graphics Update
    if(window.updatePhantom) window.updatePhantom(snrFinal);
};

window.runAutoIso = function() {
    const s = window.state;
    const dx = parseFloat(s.fovRead) / parseFloat(s.nx);
    window.updateStateDirectly('sliceThick', dx.toFixed(2));
    window.updateStateDirectly('phaseRes', 100);
    window.updateStateDirectly('fovPhase', 100);
};
