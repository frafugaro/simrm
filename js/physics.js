// Motore Fisico-Matematico per la simulazione MR
function formatTime(seconds) {
    if(!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function calculatePhysics() {
    const s = window.state;
    
    // 1. Matrice Effettiva
    const Ny_eff = s.Nx * (s.FOV_Phase / 100) * (s.Phase_Res / 100) * (1 + s.Phase_OS / 100) * (s.Phase_Partial / 100);
    const is3D = s.Slabs > 0;
    const Nz_eff = is3D ? (s.Slices * s.Slabs) * (1 + s.Slice_OS / 100) * (s.Slice_Partial / 100) : 1;
    
    // 2. Fattore di Accelerazione (R)
    let R = 1;
    if (s.Accel_Mode === 'GRAPPA' || s.Accel_Mode === 'CAIPIRINHA') {
        R = s.Accel_PE * s.Accel_3D;
    } else if (s.Accel_Mode === 'CS') {
        R = s.CS_Factor;
    }

    // Protezione divisione per zero
    const ETL = Math.max(1, s.Turbo_Factor);
    const validR = Math.max(1, R);

    // 3. Tempo di Acquisizione (TA) in secondi
    let TA = 0;
    if (is3D) {
        TA = (Ny_eff * Nz_eff * s.NEX * s.TR) / (ETL * validR * 1000);
    } else {
        // Calcolo dei pacchetti multi-slice per 2D
        const sliceTime = (s.Echo_Spacing * ETL + 50);
        const slicesPerTR = Math.max(1, s.TR / sliceTime);
        const packages = Math.ceil(s.Slices / slicesPerTR);
        TA = (Ny_eff * s.NEX * s.TR * packages * s.Concatenations) / (ETL * validR * 1000);
    }

    // 4. Volume Voxel (mm^3)
    const dx = s.FOV_Read / s.Nx;
    const dy = (s.FOV_Read * (s.FOV_Phase / 100)) / (s.Nx * (s.Phase_Res / 100));
    const Voxel_Volume = dx * dy * s.Slice_Thick;

    // 5. Calcolo SNR (Signal to Noise Ratio)
    let SNR_base = (Voxel_Volume / 0.64) * Math.sqrt((Ny_eff * Nz_eff * s.NEX) / (s.BW * validR)) * Math.exp(-s.TEeff / 85);
    
    // Calcolo g-factor in base alla tecnica di accelerazione
    let g_factor = 1.0;
    if (s.Accel_Mode === 'GRAPPA') g_factor = 1 + (validR - 1) * 0.15;
    if (s.Accel_Mode === 'CAIPIRINHA') g_factor = 1 + (validR - 1) * 0.05;
    
    let SNR_final = SNR_base / g_factor;

    // Modifica CS per Compressed Sensing
    if (s.Accel_Mode === 'CS') {
        SNR_final = SNR_base * (1.2 / Math.sqrt(validR));
    }

    // Ritorna i risultati
    return {
        Ny_eff: Math.round(Ny_eff),
        Nz_eff: is3D ? Math.round(Nz_eff) : 1, // Nz è 1 in planare
        TA_sec: TA,
        TA_str: formatTime(TA),
        SNR: SNR_final > 0 ? SNR_final.toFixed(2) : "0.00"
    };
}