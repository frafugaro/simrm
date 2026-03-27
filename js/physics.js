window.calculatePhysics = function() {
    const s = window.state;
    
    // Parsing sicuro numerico
    const Nx = Math.max(1, parseFloat(s.nx));
    const PhaseRes = parseFloat(s.phaseResPct);
    const FOVPhase = parseFloat(s.fovPhasePct);
    const PhaseOS = parseFloat(s.phaseOS);
    const Slices = Math.max(1, parseFloat(s.slices));
    const SliceOS = parseFloat(s.sliceOS);
    const FOVRead = parseFloat(s.fovRead);
    const SliceThick = parseFloat(s.sliceThick);
    
    const is3D = s.dimension === '3D';
    const accelMode = s.accelMode;
    const accelPE = Math.max(1, parseFloat(s.accelPE));
    const accel3D = Math.max(1, parseFloat(s.accel3D));
    const csFactor = Math.max(1, parseFloat(s.csFactor));
    
    const TR = Math.max(1, parseFloat(s.tr));
    const TE = parseFloat(s.te);
    const NEX = parseFloat(s.nex);
    const ETL = Math.max(1, parseFloat(s.etl));
    const EchoSpacing = parseFloat(s.echoSpacing);
    const Conc = Math.max(1, parseFloat(s.conc));
    const BW = Math.max(1, parseFloat(s.bw));

    // 1. Matrici Effettive
    const effNy = Nx * (PhaseRes/100) * (FOVPhase/100) * (1 + PhaseOS/100);
    const effNz = is3D ? Slices * (1 + SliceOS/100) : 1;

    // 2. Voxel Resolution
    const dx = FOVRead / Nx;
    const dy = (FOVRead * (FOVPhase/100)) / (Nx * (PhaseRes/100));
    const dz = is3D ? (Slices * SliceThick) / effNz : SliceThick;
    const voxelVol = dx * dy * dz;

    // 3. Accelerazione Totale (R) e fattore G
    let R = 1;
    let g = 1.0;
    if (accelMode === 'GRAPPA') { R = accelPE * (is3D ? accel3D : 1); g = 1.15; }
    if (accelMode === 'CAIPIRINHA') { R = accelPE * (is3D ? accel3D : 1); g = 1.05; }
    if (accelMode === 'CS') { R = csFactor; }

    // 4. Tempo di Acquisizione (TA)
    let taSec = 0;
    let shots = 0;
    if (is3D) {
        taSec = (effNy * effNz * NEX * TR) / (ETL * R * 1000);
        shots = (effNy * effNz) / (ETL * R);
    } else {
        const maxSlices = Math.max(1, TR / (EchoSpacing * ETL + 50));
        const packages = Math.ceil(Slices / maxSlices);
        taSec = (effNy * NEX * TR * packages * Conc) / (ETL * R * 1000);
        shots = effNy / (ETL * R);
    }
    
    // 5. SAR (Stima)
    const weight = Math.max(1, parseFloat(s.weight));
    const height = Math.max(1, parseFloat(s.height));
    const bmi = weight / Math.pow(height/100, 2);
    const sar = (0.002 * ETL * bmi / (TR/1000)) * Math.pow(parseFloat(s.flipAngle)/180, 2);

    // 6. Signal to Noise Ratio (SNR)
    const acqTerm = (effNy * effNz * NEX) / 14500;
    let snrBase = (voxelVol / 0.64) * Math.sqrt(acqTerm) * Math.sqrt(521/BW) * Math.exp(-TE/85) * 4.0;
    
    let snrFinal = snrBase;
    if (accelMode === 'CS') {
        snrFinal = snrBase * (1.2 / Math.sqrt(csFactor));
    } else if (accelMode !== 'None') {
        snrFinal = snrBase / (g * Math.sqrt(R));
    }

    // Update DOM sicuri
    const m = Math.floor(taSec / 60) || 0;
    const sec = Math.round(taSec % 60) || 0;
    document.getElementById('out-ta').innerText = `${m}:${sec.toString().padStart(2,'0')}`;
    document.getElementById('out-etl').innerText = `${ETL} / ${Math.ceil(shots||0)}`;
    document.getElementById('out-sar').innerText = (sar||0).toFixed(2);
    document.getElementById('out-res').innerText = `${(dx||0).toFixed(1)} x ${(dy||0).toFixed(1)} x ${(dz||0).toFixed(1)}`;
    document.getElementById('out-snr-base').innerText = (snrBase||0).toFixed(2);
    document.getElementById('out-snr-final').innerText = (snrFinal||0).toFixed(2);
    
    const snrBox = document.getElementById('box-snr-final');
    if (snrFinal < 0.8) {
        snrBox.className = "bg-red-900/30 border border-red-500 p-2 rounded transition-colors";
        document.getElementById('out-snr-final').className = "font-mono text-xl font-bold text-red-400";
    } else {
        snrBox.className = "bg-blue-900/20 border border-blue-500 p-2 rounded transition-colors";
        document.getElementById('out-snr-final').className = "font-mono text-xl font-bold text-blue-400";
    }

    // Trigger Rendering Grafico
    if(window.renderPhantom) window.renderPhantom(snrFinal);
};
