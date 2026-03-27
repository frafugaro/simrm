// Oggetto di Stato Globale - Configurazione di default (Vida 3T)
window.state = {
    // Routine
    Slab_Group: 1,
    Slabs: 0, // 0 = 2D, >0 = 3D
    Slices: 35,
    Position: 'Isocenter',
    Orientation: 'Axial',
    Phase_Enc_Dir: 'A>>P',
    Phase_OS: 0,
    Slice_OS: 0,
    FOV_Read: 380,
    FOV_Phase: 100,
    Slice_Thick: 5,
    TR: 2500,
    TEeff: 80,
    NEX: 1,
    Concatenations: 1,
    AutoAlign: 'Off',
    Coil_Elements: 'Body+Spine',
    
    // Contrast
    Flip_Angle: 90,
    Fat_Water_Contrast: 'Standard',
    Dynamic_Mode: 'None',
    
    // Resolution
    Nx: 320,
    Phase_Res: 100,
    Slice_Res: 100,
    
    // Acceleration / Sequence
    Accel_Mode: 'GRAPPA', // None, GRAPPA, CAIPIRINHA, CS
    Accel_PE: 2,
    Accel_3D: 1,
    CS_Factor: 1.0,
    Phase_Partial: 100, // 100, 87.5, 75, 62.5
    Slice_Partial: 100,
    BW: 250,
    Echo_Spacing: 5.2,
    Turbo_Factor: 15, // ETL
    Echo_Train_Duration: 78,
    
    // Physio
    Region: 'Abdomen',
    Weight: 75,
    Height: 175
};