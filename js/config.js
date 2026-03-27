// Data State Globale
window.state = {
    // General
    region: 'abdomen',
    weight: 75,
    height: 175,
    
    // Routine / Geometry
    orientation: 'Transversal',
    dimension: '3D',
    slices: 60,
    fovRead: 220.0,
    fovPhasePct: 100.0,
    sliceThick: 1.0,
    phaseOS: 30.0,
    sliceOS: 5.0,
    
    // Contrast / Timing
    tr: 2200.0,
    te: 105.0,
    flipAngle: 135.0,
    saturation: 'Nessuna',
    
    // Resolution
    baseRes: 320,
    phaseResPct: 91.0,
    sliceResPct: 81.0,
    interp: 0,
    
    // Sequence / Acceleration
    nex: 1.0,
    conc: 1,
    bw: 521.0,
    echoSpacing: 4.4,
    turboFactor: 64, // ETL
    accelType: 'GRAPPA', // GRAPPA, CAIPIRINHA, CS
    accelR: 4.0,
    csFactor: 2.0,
    gFactor: 1.0,
    phasePartial: 100.0,
    slicePartial: 100.0
};

// Layout dei form (generati in main.js)
window.uiConfig = {
    routine: { label: 'Routine', fields:[
        { id: 'dimension', label: 'Dimension', type: 'select', options: ['2D', '3D'] },
        { id: 'orientation', label: 'Orientation', type: 'select', options:['Transversal', 'Coronal', 'Sagittal'] },
        { id: 'slices', label: 'Slices', type: 'number', step: 2 },
        { id: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
        { id: 'fovPhasePct', label: 'FOV Phase (%)', type: 'number', step: 5 },
        { id: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
        { id: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
        { id: 'te', label: 'TE (ms)', type: 'number', step: 1 },
        { id: 'nex', label: 'NEX / Averages', type: 'number', step: 0.5 },
        { id: 'conc', label: 'Concatenations', type: 'number', step: 1 }
    ]},
    contrast: { label: 'Contrast', fields:[
        { id: 'flipAngle', label: 'Flip Angle (°)', type: 'number', step: 5 },
        { id: 'saturation', label: 'Saturation', type: 'select', options:['Nessuna', 'Fat Sat', 'Water Sat'] }
    ]},
    resolution: { label: 'Resolution', fields:[
        { id: 'baseRes', label: 'Base Res (Nx)', type: 'number', step: 16 },
        { id: 'phaseResPct', label: 'Phase Res (%)', type: 'number', step: 1 },
        { id: 'sliceResPct', label: 'Slice Res (%)', type: 'number', step: 1 },
        { id: 'phaseOS', label: 'Phase OS (%)', type: 'number', step: 5 },
        { id: 'sliceOS', label: 'Slice OS (%)', type: 'number', step: 5 },
        { id: 'interp', label: 'Interpolation', type: 'select', options: [0, 1] }
    ]},
    geometry: { label: 'Geometry', fields:[
        { id: 'phasePartial', label: 'Phase Partial Fourier (%)', type: 'number', step: 5 },
        { id: 'slicePartial', label: 'Slice Partial Fourier (%)', type: 'number', step: 5 }
    ]},
    physio: { label: 'Physio', fields: [
        // Placeholder per logica futura
    ]},
    sequence: { label: 'Sequence', fields:[
        { id: 'bw', label: 'Bandwidth (Hz/Px)', type: 'number', step: 10 },
        { id: 'echoSpacing', label: 'Echo Spacing (ms)', type: 'number', step: 0.1 },
        { id: 'turboFactor', label: 'Turbo Factor (ETL)', type: 'number', step: 1 },
        { id: 'accelType', label: 'Accel Type', type: 'select', options: ['GRAPPA', 'CAIPIRINHA', 'CS'] },
        { id: 'accelR', label: 'Accel Factor (R)', type: 'number', step: 1 },
        { id: 'csFactor', label: 'CS Factor (1-10)', type: 'number', step: 0.5 },
        { id: 'gFactor', label: 'Base g-Factor', type: 'number', step: 0.1 }
    ]}
};
