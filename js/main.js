document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LOGIN LOGIC
    const doLogin = () => {
        if(document.getElementById('login-pwd').value === 'simulatore') {
            document.getElementById('login-screen').style.opacity = '0';
            setTimeout(() => { document.getElementById('login-screen').style.display = 'none'; buildUI(); }, 500);
        } else {
            document.getElementById('login-err').classList.remove('hidden');
        }
    };
    document.getElementById('login-btn').addEventListener('click', doLogin);
    document.getElementById('login-pwd').addEventListener('keypress', e => { if(e.key==='Enter') doLogin(); });

    // 2. BUILD UI DYNAMICALLY (Eseguito una sola volta)
    function buildUI() {
        const sidebar = document.getElementById('sidebar');
        const container = document.getElementById('params-container');
        
        Object.values(window.configUI).forEach((tab, index) => {
            // Setup Sidebar button
            const btn = document.createElement('button');
            btn.className = `tab-btn text-left px-4 py-3 text-xs font-medium border-l-4 border-transparent hover:bg-slate-800 transition ${tab.isBottom ? 'mt-auto text-blue-400' : 'text-slate-400'} ${index === 0 ? 'active' : ''}`;
            btn.innerText = tab.label;
            btn.onclick = () => window.switchTab(tab.id, btn);
            sidebar.appendChild(btn);

            // Setup Content Box
            const box = document.createElement('div');
            box.id = `tab-box-${tab.id}`;
            box.className = `grid grid-cols-2 gap-x-6 gap-y-4 ${index === 0 ? 'block' : 'hidden'}`;
            
            tab.fields.forEach(f => {
                const wrap = document.createElement('div');
                wrap.className = "flex flex-col gap-1";
                const label = `<label class="text-[10px] text-slate-500 uppercase tracking-wider">${f.label}</label>`;
                
                let input = '';
                if(f.type === 'button') {
                    input = `<button onclick="${f.action}" class="w-full bg-slate-700 hover:bg-slate-600 text-blue-400 font-bold py-1 rounded text-xs border border-slate-600">${f.label}</button>`;
                } else if (f.type === 'select') {
                    input = `<select id="inp-${tab.id}-${f.key}" data-key="${f.key}" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-blue-500 sync-input">
                        ${f.options.map(o => `<option value="${o}" ${window.state[f.key] === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>`;
                } else {
                    input = `<input type="number" id="inp-${tab.id}-${f.key}" data-key="${f.key}" value="${window.state[f.key]}" step="${f.step}" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-blue-500 font-mono sync-input">`;
                }
                
                wrap.innerHTML = label + input;
                box.appendChild(wrap);
            });
            container.appendChild(box);
        });

        // Setup Event Listeners per gli input creati
        document.querySelectorAll('.sync-input').forEach(el => {
            el.addEventListener('input', (e) => window.updateState(e.target.dataset.key, e.target.value, e.target.id));
        });

        window.calculatePhysics();
    }

    // 3. TAB SWITCHING
    window.switchTab = function(tabId, btnEl) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if(btnEl) btnEl.classList.add('active');
        else { // Se richiamato da search
            document.querySelectorAll('.tab-btn').forEach(b => {
                if(b.innerText.toLowerCase() === window.configUI[tabId].label.toLowerCase()) b.classList.add('active');
            });
        }
        
        document.querySelectorAll('div[id^="tab-box-"]').forEach(box => box.classList.add('hidden'));
        document.getElementById(`tab-box-${tabId}`).classList.remove('hidden');
        document.getElementById('current-tab-title').innerText = window.configUI[tabId].label;
    };

    // 4. SMART SEARCH
    const searchInput = document.getElementById('quick-search');
    const searchRes = document.getElementById('search-results');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchRes.innerHTML = '';
        if(query.length < 2) { searchRes.classList.add('hidden'); return; }

        let matches =[];
        Object.values(window.configUI).forEach(tab => {
            tab.fields.forEach(f => {
                if(f.label && f.label.toLowerCase().includes(query)) {
                    matches.push({ tabId: tab.id, field: f });
                }
            });
        });

        if(matches.length > 0) {
            matches.forEach(m => {
                const div = document.createElement('div');
                div.className = "px-3 py-2 text-xs text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer border-b border-slate-700";
                div.innerText = `${m.field.label} (${window.configUI[m.tabId].label})`;
                div.onclick = () => {
                    searchRes.classList.add('hidden');
                    searchInput.value = '';
                    window.switchTab(m.tabId);
                    const targetId = `inp-${m.tabId}-${m.field.key}`;
                    setTimeout(() => {
                        const el = document.getElementById(targetId);
                        if(el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.focus();
                            el.classList.add('flash-highlight');
                            setTimeout(() => el.classList.remove('flash-highlight'), 1500);
                        }
                    }, 50);
                };
                searchRes.appendChild(div);
            });
            searchRes.classList.remove('hidden');
            searchRes.classList.add('flex');
        } else {
            searchRes.classList.add('hidden');
        }
    });

    // 5. GLOBAL STATE UPDATE (Zero innerHTML rebuilds on typing)
    window.updateState = function(key, value, sourceId) {
        window.state[key] = value;
        // Sincronizza input duplicati in altre tab senza disturbare il focus corrente
        document.querySelectorAll(`[data-key="${key}"]`).forEach(el => {
            if(el.id !== sourceId) el.value = value;
        });
        window.calculatePhysics();
    };

    // 6. AUTO ISO FEATURE
    window.setAutoIso = function() {
        const dx = window.state.fovRead / window.state.nx;
        window.updateState('sliceThick', parseFloat(dx.toFixed(2)), null);
        window.updateState('phaseResPct', 100, null);
        window.updateState('sliceResPct', 100, null);
    };
});
