// Stato reattivo di default
window.state = {
    slices: 60, position: 'Isocenter', phaseEncDir: 'A >> P', phaseOS: 0, sliceOS: 0, 
    fovRead: 220, fovPhasePct: 100, sliceThick: 1.0, tr: 2200, te: 105, nex: 1.0, conc: 1,
    flipAngle: 90, saturation: 'Nessuna', fatWaterContrast: 'Standard',
    baseRes: 320, phaseResPct: 100, sliceResPct: 100, interp: '0',
    phasePartial: 100, slicePartial: 100,
    trigger: 'None', delay: 0,
    seqName: 'SPACE', dimension: '3D', bw: 521, echoSpacing: 4.4, turboFactor: 64, accelType: 'GRAPPA', accelR: 2, csFactor: 1.0,
    orientation: 'Transversal', region: 'abdomen', weight: 75, height: 175
};

// Schema dell'architettura UI e indicizzazione per il motore di ricerca
window.config = {
    routine: {
        label: 'Routine',
        fields:[
            { id: 'slices', label: 'Slices per Slab', type: 'number', step: 2 },
            { id: 'position', label: 'Position', type: 'select', options: ['Isocenter', 'Local'] },
            { id: 'phaseEncDir', label: 'Phase Enc. Dir', type: 'select', options:['A >> P', 'R >> L'] },
            { id: 'phaseOS', label: 'Phase OS (%)', type: 'number', step: 10 },
            { id: 'sliceOS', label: 'Slice OS (%)', type: 'number', step: 5 },
            { id: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
            { id: 'fovPhasePct', label: 'FOV Phase (%)', type: 'number', step: 5 },
            { id: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
            { id: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
            { id: 'te', label: 'TEeff (ms)', type: 'number', step: 1 },
            { id: 'nex', label: 'NEX / Averages', type: 'number', step: 0.5 },
            { id: 'conc', label: 'Concatenations', type: 'number', step: 1 }
        ]
    },
    contrast: {
        label: 'Contrast',
        fields:[
            { id: 'flipAngle', label: 'Flip Angle (deg)', type: 'number', step: 5 },
            { id: 'saturation', label: 'Saturation', type: 'select', options:['Nessuna', 'Fat Sat', 'Water Sat'] },
            { id: 'fatWaterContrast', label: 'Fat-Water Contrast', type: 'select', options: ['Standard', 'Dixon'] }
        ]
    },
    resolution: {
        label: 'Resolution',
        fields:[
            { id: 'baseRes', label: 'Base Res (Nx)', type: 'number', step: 16 },
            { id: 'phaseResPct', label: 'Phase Res (%)', type: 'number', step: 1 },
            { id: 'sliceResPct', label: 'Slice Res (%)', type: 'number', step: 1 },
            { id: 'interp', label: 'Interpolation', type: 'select', options: ['0', '1'] }
        ]
    },
    geometry: {
        label: 'Geometry',
        fields:[
            { id: 'phasePartial', label: 'Phase Partial Fourier (%)', type: 'number', step: 5 },
            { id: 'slicePartial', label: 'Slice Partial Fourier (%)', type: 'number', step: 5 }
        ]
    },
    physio: {
        label: 'Physio',
        fields:[
            { id: 'trigger', label: 'Physio Trigger', type: 'select', options: ['None', 'Respiratory', 'ECG'] },
            { id: 'delay', label: 'Trigger Delay (ms)', type: 'number', step: 10 }
        ]
    },
    sequence: {
        label: 'Sequence',
        fields:[
            { id: 'seqName', label: 'Sequence Name', type: 'select', options:['SPACE', 'TSE', 'GRE', 'EPI'] },
            { id: 'dimension', label: 'Dimension', type: 'select', options: ['2D', '3D'] },
            { id: 'bw', label: 'Bandwidth (Hz/Px)', type: 'number', step: 10 },
            { id: 'echoSpacing', label: 'Echo Spacing (ms)', type: 'number', step: 0.1 },
            { id: 'turboFactor', label: 'Turbo Factor (ETL)', type: 'number', step: 1 },
            { id: 'accelType', label: 'Acceleration Mode', type: 'select', options:['None', 'GRAPPA', 'CAIPIRINHA', 'CS'] },
            { id: 'accelR', label: 'Acceleration Factor (R)', type: 'number', step: 1 },
            { id: 'csFactor', label: 'CS Factor', type: 'number', step: 0.5 }
        ]
    },
    setup: {
        label: 'Setup Paziente & Geometria',
        fields:[
            { id: 'orientation', label: 'Orientation', type: 'select', options:['Transversal', 'Coronal', 'Sagittal'] },
            { id: 'region', label: 'Anatomical Region', type: 'select', options: ['abdomen', 'pelvis', 'thorax', 'head'] },
            { id: 'weight', label: 'Patient Weight (kg)', type: 'number', step: 1 },
            { id: 'height', label: 'Patient Height (cm)', type: 'number', step: 1 },
            { id: 'btnAutoIso', label: 'Imposta AUTO ISO', type: 'button', action: 'triggerAutoIso()' }
        ]
    }
};
