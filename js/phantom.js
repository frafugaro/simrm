window.getSignalIntensity = function(t1, t2, pd = 1.0, isFat = false) {
    const s = window.state;
    // Saturation Logic
    if (s.saturation === 'Fat Sat' && isFat) return `rgb(10, 10, 10)`;
    if (s.saturation === 'Water Sat' && !isFat) return `rgb(10, 10, 10)`;

    // Bloch Equation (Spin Echo approx)
    const signal = pd * (1 - Math.exp(-s.tr / t1)) * Math.exp(-s.te / t2);
    const gray = Math.min(255, Math.max(10, Math.round(signal * 850)));
    return `rgb(${gray}, ${gray}, ${gray})`;
};

window.updatePhantomGraphics = function(phys) {
    const s = window.state;

    // 1. Hide all phantom groups, show active one based on region
    document.querySelectorAll('g[id^="ph-group-"]').forEach(el => el.classList.add('hidden'));
    
    let viewId = `${s.region}-axial`; // fallback base
    if(s.region === 'abdomen' || s.region === 'pelvis' || s.region === 'thorax' || s.region === 'head') {
        viewId = `${s.region}-axial`; // Il design SVG fornito ha principalmente assiali
    }
    
    const activeGroup = document.getElementById(`ph-group-${viewId}`);
    if(activeGroup) activeGroup.classList.remove('hidden');

    // 2. Color Mapping via Bloch (Abdomen as main example)
    if (s.region === 'abdomen') {
        const liverC = getSignalIntensity(1200, 160, 0.85, false);
        const spleenC = getSignalIntensity(1000, 120, 0.90, false);
        const kidneyC = getSignalIntensity(1100, 130, 0.90, false);
        const fatC = getSignalIntensity(250, 80, 1.0, true);
        const muscleC = getSignalIntensity(900, 50, 0.80, false);
        const spineC = getSignalIntensity(300, 60, 0.80, false);

        const safeFill = (id, color) => { const el = document.getElementById(id); if(el) el.setAttribute('fill', color); };
        safeFill('ph-abd-ax-liver', liverC);
        safeFill('ph-abd-ax-spleen', spleenC);
        safeFill('ph-abd-ax-kidney-cortex', kidneyC);
        safeFill('ph-abd-ax-kidney-medulla', kidneyC);
        safeFill('ph-abd-ax-kidney-cortex-l', kidneyC);
        safeFill('ph-abd-ax-kidney-medulla-l', kidneyC);
        safeFill('ph-abd-ax-fat', fatC);
        safeFill('ph-abd-ax-muscle', muscleC);
        safeFill('ph-abd-ax-spine', spineC);
    }
    // Pelvis logic...
    else if (s.region === 'pelvis') {
        const pz = getSignalIntensity(1200, 130, 0.9, false);
        const tz = getSignalIntensity(1000, 80, 0.8, false);
        const fatC = getSignalIntensity(250, 80, 1.0, true);
        const muscleC = getSignalIntensity(900, 50, 0.80, false);
        const safeFill = (id, color) => { const el = document.getElementById(id); if(el) el.setAttribute('fill', color); };
        
        safeFill('ph-pelvis-ax-fat', fatC);
        safeFill('ph-pelvis-ax-muscle', muscleC);
        safeFill('ph-pelvis-ax-prostate-pz', pz);
        safeFill('ph-pelvis-ax-prostate-tz', tz);
        safeFill('ph-pelvis-ax-bladder', getSignalIntensity(3000, 1000, 1.0, false));
        safeFill('ph-pelvis-ax-rectum', getSignalIntensity(800, 50, 0.5, false));
        safeFill('ph-pelvis-ax-bone-l', getSignalIntensity(2000, 10, 0.1, false));
        safeFill('ph-pelvis-ax-bone-r', getSignalIntensity(2000, 10, 0.1, false));
    }
    // Thorax & Head similarly handle colors via Bloch if present in SVG...

    // 3. Noise Overlay
    let baseNoiseOpacity = Math.max(0, (1.0 - phys.snrFinal) * 0.3);
    let gFactorOpacity = (s.accelType === 'GRAPPA' && s.accelR > 2.0) ? (s.accelR - 2.0) * 0.15 * s.gFactor : 0;
    
    document.getElementById('ph-noise').setAttribute('opacity', baseNoiseOpacity);
    document.getElementById('ph-noise-gfactor').setAttribute('opacity', gFactorOpacity);

    // 4. CS Iterative Denoising / Blur
    let currentFilter = 'grayscale(100%)';
    if (s.accelType === 'CS') {
        const blurAmount = (s.csFactor - 1) * 0.3;
        currentFilter += ` blur(${blurAmount}px) contrast(110%)`;
    }
    document.getElementById('phantom-wrapper').style.filter = currentFilter;

    // 5. Chemical Shift Transform (Hz/Px)
    let shiftPx = 0;
    let dropShadow = 'none';
    if (phys.bwHzPx < 100) { shiftPx = 3; dropShadow = 'drop-shadow(-3px 0px 0px rgba(0,0,0,1))'; }
    else if (phys.bwHzPx <= 250) { shiftPx = 1; dropShadow = 'drop-shadow(-1px 0px 0px rgba(0,0,0,0.8))'; }
    
    document.querySelectorAll('.transform-water').forEach(el => {
        el.style.transform = `translateX(${shiftPx}px)`;
        el.style.filter = shiftPx > 0 ? dropShadow : '';
        el.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s';
    });
};
