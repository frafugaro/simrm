// js/config.js

window.state = {
    // Routine
    slabGroup: 1, slabs: 1, slices: 60, position: 'Isocenter', phaseDir: 'A >> P',
    phaseOS: 0, sliceOS: 0, fovRead: 220, fovPhase: 100, sliceThick: 3.0,
    tr: 2500, te: 90, nex: 1.0, conc: 1, autoAlign: 'Off', coil: 'Body+Spine',
    // Contrast
    flipAngle: 90, fatWater: 'Standard', darkBlood: 'Off', bloodSupp: 'Off',
    // Resolution
    nx: 320, phaseRes: 100, sliceRes: 100, accelMode: 'GRAPPA', accelPE: 2, accel3D: 1,
    csFactor: 1.0, phasePartial: 100, slicePartial: 100,
    // Sequence
    seqName: 'TSE', dimension: '2D', bw: 250, echoSpacing: 5.0, etl: 15, echoTrainDur: 75,
    // Setup
    orientation: 'Transversal', region: 'Abdomen', weight: 75, height: 175
};

window.uiConfig = {
    routine: { label: 'Routine', fields:[
        { key: 'slabGroup', label: 'Slab Group', type: 'number' },
        { key: 'slabs', label: 'Slabs', type: 'number' },
        { key: 'slices', label: 'Slices per Slab', type: 'number' },
        { key: 'position', label: 'Position', type: 'select', options: ['Isocenter', 'Head', 'Feet'] },
        { key: 'phaseDir', label: 'Phase Enc. Dir', type: 'select', options:['A >> P', 'R >> L', 'H >> F'] },
        { key: 'phaseOS', label: 'Phase OS (%)', type: 'number', step: 10 },
        { key: 'sliceOS', label: 'Slice OS (%)', type: 'number', step: 10 },
        { key: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
        { key: 'fovPhase', label: 'FOV Phase (%)', type: 'number', step: 5 },
        { key: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
        { key: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
        { key: 'te', label: 'TEeff (ms)', type: 'number', step: 1 },
        { key: 'nex', label: 'NEX / Averages', type: 'number', step: 0.5 },
        { key: 'conc', label: 'Concatenations', type: 'number' },
        { key: 'autoAlign', label: 'AutoAlign', type: 'select', options: ['Off', 'Head', 'Spine'] },
        { key: 'coil', label: 'Coil Elements', type: 'select', options:['Body+Spine', 'Head/Neck 20', 'Knee 15'] }
    ]},
    contrast: { label: 'Contrast', fields:[
        { key: 'tr', label: 'TR (ms)', type: 'number', step: 100 },
        { key: 'te', label: 'TE (ms)', type: 'number', step: 1 },
        { key: 'flipAngle', label: 'Flip Angle (°)', type: 'number', step: 5 },
        { key: 'fatWater', label: 'Fat-Water Contrast', type: 'select', options: ['Standard', 'Fat Sat', 'Water Sat'] },
        { key: 'darkBlood', label: 'Dark Blood', type: 'select', options: ['Off', 'On'] },
        { key: 'bloodSupp', label: 'Blood Suppression', type: 'select', options:['Off', 'On'] }
    ]},
    resolution: { label: 'Resolution', fields:[
        { key: 'nx', label: 'Base Resolution (Nx)', type: 'number', step: 16 },
        { key: 'phaseRes', label: 'Phase Res (%)', type: 'number', step: 1 },
        { key: 'sliceRes', label: 'Slice Res (%)', type: 'number', step: 1 },
        { key: 'accelMode', label: 'Accel Mode', type: 'select', options: ['None', 'GRAPPA', 'CAIPIRINHA', 'CS'] },
        { key: 'accelPE', label: 'Accel PE', type: 'number', step: 1 },
        { key: 'accel3D', label: 'Accel 3D', type: 'number', step: 1 },
        { key: 'csFactor', label: 'CS Factor (1-10)', type: 'number', step: 0.5 },
        { key: 'phasePartial', label: 'Phase Partial Fourier', type: 'select', options:['100', '87.5', '75', '62.5'] },
        { key: 'slicePartial', label: 'Slice Partial Fourier', type: 'select', options:['100', '87.5', '75', '62.5'] }
    ]},
    geometry: { label: 'Geometry', fields:[
        { key: 'fovRead', label: 'FOV Read (mm)', type: 'number', step: 10 },
        { key: 'fovPhase', label: 'FOV Phase (%)', type: 'number', step: 5 },
        { key: 'sliceThick', label: 'Slice Thick (mm)', type: 'number', step: 0.5 },
        { key: 'slices', label: 'Slices per Slab', type: 'number' }
    ]},
    physio: { label: 'Physio', fields:[] },
    sequence: { label: 'Sequence', fields:[
        { key: 'seqName', label: 'Sequence Name', type: 'select', options: ['TSE', 'GRE', 'EPI', 'SPACE'] },
        { key: 'dimension', label: 'Dimension', type: 'select', options:['2D', '3D'] },
        { key: 'bw', label: 'Bandwidth (Hz/Px)', type: 'number', step: 10 },
        { key: 'echoSpacing', label: 'Echo Spacing (ms)', type: 'number', step: 0.1 },
        { key: 'etl', label: 'Turbo Factor (ETL)', type: 'number', step: 1 },
        { key: 'echoTrainDur', label: 'Echo Train Duration', type: 'number' }
    ]},
    setup: { label: 'Setup', specialCss: 'mt-auto text-blue-400 border-t border-slate-800', fields:[
        { key: 'orientation', label: 'Orientation', type: 'select', options: ['Transversal', 'Coronal', 'Sagittal'] },
        { key: 'region', label: 'Anatomical Region', type: 'select', options:['Abdomen', 'Pelvis', 'Thorax', 'Skull'] },
        { key: 'weight', label: 'Weight (kg)', type: 'number' },
        { key: 'height', label: 'Height (cm)', type: 'number' },
        { key: 'autoIsoBtn', label: 'AUTO ISO', type: 'button', action: 'window.runAutoIso()' }
    ]}
};
