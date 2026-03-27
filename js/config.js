// Oggetto Globale di Stato
window.state = {
    slabGroup: 1, slabs: 1, slices: 60, position: 'Isocenter', phaseEncDir: 'A>>P',
    phaseOS: 0, sliceOS: 0, fovRead: 380, fovPhasePct: 100, sliceThick: 3,
    tr: 3500, te: 90, nex: 1, conc: 1, autoAlign: 'Off', coilElements: 'Body+Spine',
    flipAngle: 90, fwContrast: 'Standard', darkBlood: 'Off', bloodSuppression: 'Off',
    nx: 320, phaseResPct: 100, sliceResPct: 100, accelMode: 'GRAPPA', accelPE: 2, accel3D: 1,
    csFactor: 1.0, phasePartial: 100, slicePartial: 100, seqName: 'TSE', dimension: '2D',
    bw: 250, echoSpacing: 5.2, etl: 15, etd: 78,
    orientation: 'Transversal', region: 'Abdomen', weight: 75, height: 175
};

// Struttura della UI
window.configUI = {
    routine: {
        id: 'routine', label: 'Routine', isBottom: false,
        fields:[
            { key: 'slabGroup', label: 'Slab Group', type: 'number', step: 1 },
            { key: 'slabs', label: 'Slabs (0=2D)', type: 'number', step: 1 },
            { key: 'slices', label: 'Slices per Slab', type: 'number', step: 1 },
            { key: 'position', label: 'Position', type: 'select', options: ['Isocenter', 'Local'] },
            { key: 'phaseEncDir', label: 'Phase Enc. Dir.', type: 'select', options: ['A>>P', 'R>>L'] },
            { key: 'phaseOS', label: 'Phase OS %', type: 'number', step: 10 },
            { key: 'sliceOS', label: 'Slice OS %', type: 'number', step: 10 },
            { key: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
            { key: 'fovPhasePct', label: 'FOV Phase %', type: 'number', step: 5 },
            { key: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
            { key: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
            { key: 'te', label: 'TE (ms)', type: 'number', step: 1 },
            { key: 'nex', label: 'NEX (Averages)', type: 'number', step: 0.5 },
            { key: 'conc', label: 'Concatenations', type: 'number', step: 1 },
            { key: 'autoAlign', label: 'AutoAlign', type: 'select', options:['Off', 'Head', 'Spine'] },
            { key: 'coilElements', label: 'Coil Elements', type: 'select', options: ['Body+Spine', 'Head/Neck 20'] }
        ]
    },
    contrast: {
        id: 'contrast', label: 'Contrast', isBottom: false,
        fields:[
            { key: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
            { key: 'te', label: 'TE (ms)', type: 'number', step: 1 },
            { key: 'flipAngle', label: 'Flip Angle (°)', type: 'number', step: 5 },
            { key: 'fwContrast', label: 'Fat-Water Contrast', type: 'select', options: ['Standard', 'Fat Sat', 'Water Sat'] },
            { key: 'darkBlood', label: 'Dark Blood', type: 'select', options: ['Off', 'On'] },
            { key: 'bloodSuppression', label: 'Blood Suppression', type: 'select', options: ['Off', 'On'] }
        ]
    },
    resolution: {
        id: 'resolution', label: 'Resolution', isBottom: false,
        fields:[
            { key: 'nx', label: 'Base Res (Nx)', type: 'number', step: 16 },
            { key: 'phaseResPct', label: 'Phase Res %', type: 'number', step: 5 },
            { key: 'sliceResPct', label: 'Slice Res %', type: 'number', step: 5 },
            { key: 'accelMode', label: 'Accel Mode', type: 'select', options: ['None', 'GRAPPA', 'CAIPIRINHA', 'CS'] },
            { key: 'accelPE', label: 'Accel PE', type: 'number', step: 1 },
            { key: 'accel3D', label: 'Accel 3D', type: 'number', step: 1 },
            { key: 'csFactor', label: 'CS Factor (1-10)', type: 'number', step: 0.5 },
            { key: 'phasePartial', label: 'Phase Partial Fourier', type: 'select', options:['100', '87.5', '75', '62.5'] },
            { key: 'slicePartial', label: 'Slice Partial Fourier', type: 'select', options:['100', '87.5', '75', '62.5'] }
        ]
    },
    geometry: {
        id: 'geometry', label: 'Geometry', isBottom: false,
        fields:[
            { key: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
            { key: 'fovPhasePct', label: 'FOV Phase %', type: 'number', step: 5 },
            { key: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
            { key: 'slabs', label: 'Slabs', type: 'number', step: 1 },
            { key: 'slices', label: 'Slices per Slab', type: 'number', step: 1 }
        ]
    },
    physio: {
        id: 'physio', label: 'Physio', isBottom: false,
        fields:[] // Placeholder
    },
    sequence: {
        id: 'sequence', label: 'Sequence', isBottom: false,
        fields:[
            { key: 'seqName', label: 'Sequence Name', type: 'select', options:['TSE', 'SPACE', 'GRE'] },
            { key: 'dimension', label: 'Dimension', type: 'select', options: ['2D', '3D'] },
            { key: 'bw', label: 'Bandwidth (Hz/Px)', type: 'number', step: 10 },
            { key: 'echoSpacing', label: 'Echo Spacing (ms)', type: 'number', step: 0.1 },
            { key: 'etl', label: 'Turbo Factor (ETL)', type: 'number', step: 1 },
            { key: 'etd', label: 'Echo Train Duration', type: 'number', step: 1 }
        ]
    },
    setup: {
        id: 'setup', label: 'Setup', isBottom: true,
        fields:[
            { key: 'orientation', label: 'Orientation', type: 'select', options: ['Transversal', 'Coronal', 'Sagittal'] },
            { key: 'region', label: 'Anatomical Region', type: 'select', options:['Abdomen', 'Pelvis', 'Thorax', 'Skull'] },
            { key: 'weight', label: 'Weight (kg)', type: 'number', step: 1 },
            { key: 'height', label: 'Height (cm)', type: 'number', step: 1 },
            { key: 'btnAutoIso', label: 'Set AUTO ISO', type: 'button', action: 'window.setAutoIso()' }
        ]
    }
};
