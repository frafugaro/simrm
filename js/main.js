document.addEventListener('DOMContentLoaded', () => {
    
    // Login Logic
    const loginBtn = document.getElementById('login-btn');
    const loginPwd = document.getElementById('login-pwd');
    
    const doLogin = () => {
        if(loginPwd.value === 'simulatore') {
            document.getElementById('login-screen').style.opacity = '0';
            setTimeout(() => document.getElementById('login-screen').style.display = 'none', 500);
            initUI();
        } else {
            document.getElementById('login-err').classList.remove('hidden');
        }
    };
    loginBtn.addEventListener('click', doLogin);
    loginPwd.addEventListener('keypress', e => e.key === 'Enter' && doLogin());

    // Generate UI from Config
    function initUI() {
        const sidebar = document.getElementById('sidebar-tabs');
        const container = document.getElementById('parameters-container');
        
        let isFirst = true;
        
        // Populate inputs that exist in static HTML (like Patient data)
        document.querySelectorAll('.state-input').forEach(input => {
            const key = input.dataset.key;
            if(window.state[key] !== undefined) input.value = window.state[key];
            
            input.addEventListener('input', (e) => {
                let val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                if(isNaN(val) && e.target.type === 'number') val = 0;
                window.state[key] = val;
                triggerUpdate();
            });
        });

        // Dynamic generation of tabs based on window.uiConfig
        Object.keys(window.uiConfig).forEach(tabKey => {
            const tabData = window.uiConfig[tabKey];
            
            // Sidebar Button
            const btn = document.createElement('button');
            btn.className = `tab-btn p-3 text-left font-medium border-l-4 border-transparent text-slate-400 hover:bg-slate-800 transition-colors w-full block ${isFirst ? 'active bg-slate-800 border-blue-500 text-white' : ''}`;
            btn.innerText = tabData.label;
            btn.dataset.target = tabKey;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'bg-slate-800', 'border-blue-500', 'text-white'));
                btn.classList.add('active', 'bg-slate-800', 'border-blue-500', 'text-white');
                
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabKey}`).classList.add('active');
            });
            sidebar.appendChild(btn);

            // Tab Content Box
            const contentBox = document.createElement('div');
            contentBox.id = `tab-${tabKey}`;
            contentBox.className = `tab-content h-full ${isFirst ? 'active' : ''}`;
            
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4';

            tabData.fields.forEach(f => {
                const wrapper = document.createElement('div');
                wrapper.className = 'flex flex-col gap-1 justify-end';
                
                wrapper.innerHTML = `<label class="text-[10px] uppercase tracking-wider text-slate-400">${f.label}</label>`;
                
                let inputHtml = '';
                const currentVal = window.state[f.id] !== undefined ? window.state[f.id] : '';
                
                if (f.type === 'select') {
                    inputHtml = `<select id="inp-${f.id}" data-key="${f.id}" class="dyn-input w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 outline-none focus:border-blue-500 text-xs">
                        ${f.options.map(o => `<option value="${o}" ${currentVal == o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>`;
                } else {
                    inputHtml = `<input type="${f.type}" id="inp-${f.id}" data-key="${f.id}" value="${currentVal}" ${f.step ? `step="${f.step}"` : ''} class="dyn-input w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 outline-none focus:border-blue-500 font-mono text-xs">`;
                }
                wrapper.innerHTML += inputHtml;
                grid.appendChild(wrapper);
            });
            
            contentBox.innerHTML = `<h3 class="text-xs font-bold text-blue-500 mb-3 uppercase border-b border-slate-700 pb-1">${tabData.label} Settings</h3>`;
            contentBox.appendChild(grid);
            container.appendChild(contentBox);
            
            isFirst = false;
        });

        // Attach listeners to dynamic inputs (Zero innerHTML rebuilds)
        document.querySelectorAll('.dyn-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                let val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                if(isNaN(val) && e.target.type === 'number') val = 0;
                
                window.state[key] = val;
                triggerUpdate();
            });
        });

        triggerUpdate(); // Initial boot
    }

    // Core Pipeline
    function triggerUpdate() {
        // 1. Calculate Math
        const phys = window.calculatePhysics();
        
        // 2. Update Bottom Dashboard DOM exactly by ID
        const m = Math.floor(phys.taSeconds / 60);
        const s = Math.round(phys.taSeconds % 60);
        document.getElementById('out-ta').innerText = `${m}:${s.toString().padStart(2, '0')}`;
        document.getElementById('out-etl').innerText = `${window.state.turboFactor} / ${Math.ceil(phys.displayedShots)}`;
        document.getElementById('out-res').innerText = `${phys.v_dx.toFixed(2)} × ${phys.v_dy.toFixed(2)} × ${phys.v_dz.toFixed(2)} mm`;
        document.getElementById('out-snr-base').innerText = phys.snrBase.toFixed(2);
        document.getElementById('out-bw-real').innerText = `BW Reale: ${phys.bwHzPx.toFixed(1)} Hz/Px`;
        
        // SAR formatting
        const sarEl = document.getElementById('out-sar');
        sarEl.innerText = phys.sar.toFixed(2);
        sarEl.className = phys.sar > 3.2 
            ? 'font-mono text-sm text-red-400 font-bold border-b border-red-500 animate-pulse' 
            : 'font-mono text-sm text-slate-200 border-b border-transparent';

        // ISO formatting
        const isoEl = document.getElementById('out-iso');
        isoEl.innerText = phys.isIsotropic ? 'ISO ✅' : 'ANISO';
        isoEl.className = `font-bold text-[10px] ${phys.isIsotropic ? 'text-green-500' : 'text-yellow-600'}`;

        // SNR Final formatting
        const snrFinalEl = document.getElementById('out-snr-final');
        const snrBoxEl = document.getElementById('box-snr-final');
        const alertEl = document.getElementById('alert-banner');
        
        snrFinalEl.innerText = phys.snrFinal.toFixed(2);
        
        if (phys.snrFinal < 0.8) { 
            snrBoxEl.className = "border border-red-500 bg-red-900/30 px-4 py-2 rounded flex-1 transition-colors relative";
            snrFinalEl.className = "font-mono text-xl font-bold text-red-400";
            alertEl.classList.remove('hidden');
        } else {
            snrBoxEl.className = "border border-blue-500 bg-blue-900/20 px-4 py-2 rounded flex-1 transition-colors relative";
            snrFinalEl.className = "font-mono text-xl font-bold text-blue-400";
            alertEl.classList.add('hidden');
        }

        // 3. Update Visual Phantom
        window.updatePhantomGraphics(phys);
    }
});
