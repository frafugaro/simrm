// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Login Logic
    const loginBtn = document.getElementById('login-btn');
    const loginPwd = document.getElementById('login-pwd');
    const checkAuth = () => {
        if (loginPwd.value === 'simulatore') {
            document.getElementById('login-screen').style.opacity = '0';
            setTimeout(() => document.getElementById('login-screen').style.display = 'none', 500);
            initUI();
        } else {
            document.getElementById('login-err').classList.remove('hidden');
        }
    };
    loginBtn.addEventListener('click', checkAuth);
    loginPwd.addEventListener('keypress', e => { if (e.key === 'Enter') checkAuth(); });

    // 2. Init UI (Zero InnerHTML per input re-render)
    function initUI() {
        const sidebar = document.getElementById('sidebar-tabs');
        const container = document.getElementById('params-container');
        let firstTab = true;

        Object.keys(window.uiConfig).forEach(tabKey => {
            const conf = window.uiConfig[tabKey];
            
            // Sidebar Button
            const btn = document.createElement('button');
            const baseCSS = 'tab-btn p-3 text-left font-medium border-l-4 border-transparent hover:bg-slate-800 transition-colors block w-full ';
            btn.className = baseCSS + (conf.specialCss ? conf.specialCss : 'text-slate-400') + (firstTab ? ' active' : '');
            btn.innerText = conf.label;
            btn.onclick = () => switchTab(tabKey);
            sidebar.appendChild(btn);

            // Tab Content Div
            const tabDiv = document.createElement('div');
            tabDiv.id = `tab-${tabKey}`;
            tabDiv.className = `tab-content ${firstTab ? 'active' : ''}`;
            tabDiv.innerHTML = `<h3 class="text-xs font-bold text-blue-500 mb-4 border-b border-slate-700 pb-1 uppercase tracking-wider">${conf.label} Parameters</h3>`;
            
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4';

            conf.fields.forEach(f => {
                const wrap = document.createElement('div');
                wrap.className = 'flex flex-col justify-end gap-1';
                
                if (f.type !== 'button') {
                    wrap.innerHTML = `<label class="text-[10px] uppercase text-slate-400 tracking-wider">${f.label}</label>`;
                }

                let inputEl;
                if (f.type === 'select') {
                    inputEl = document.createElement('select');
                    f.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt; option.innerText = opt;
                        if(window.state[f.key] == opt) option.selected = true;
                        inputEl.appendChild(option);
                    });
                } else if (f.type === 'button') {
                    inputEl = document.createElement('button');
                    inputEl.innerText = f.label;
                    inputEl.className = "w-full bg-slate-700 hover:bg-slate-600 text-blue-400 font-bold py-1.5 rounded text-xs border border-blue-500 transition-colors";
                    inputEl.onclick = new Function(f.action);
                } else {
                    inputEl = document.createElement('input');
                    inputEl.type = f.type;
                    if(f.step) inputEl.step = f.step;
                    inputEl.value = window.state[f.key];
                }

                if (f.type !== 'button') {
                    // ID Univoco combinando tab e key per supportare duplicati es: TR in Routine e Contrast
                    inputEl.id = `inp-${tabKey}-${f.key}`;
                    inputEl.dataset.key = f.key;
                    inputEl.className = "w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-blue-500 outline-none font-mono text-xs";
                    
                    // Listener per aggiornamento
                    inputEl.addEventListener('input', (e) => {
                        window.updateStateDirectly(f.key, e.target.value);
                    });
                }
                
                wrap.appendChild(inputEl);
                grid.appendChild(wrap);
            });

            tabDiv.appendChild(grid);
            container.appendChild(tabDiv);
            firstTab = false;
        });

        window.calculatePhysics();
    }

    // 3. Update State Directly (Syncs multi-tab inputs without losing focus)
    window.updateStateDirectly = function(key, value) {
        window.state[key] = value;
        
        // Sync HTML inputs everywhere they exist
        document.querySelectorAll(`[data-key="${key}"]`).forEach(el => {
            if (el !== document.activeElement) {
                el.value = value;
            }
        });
        
        window.calculatePhysics();
    };

    // 4. Tab Switching Function
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            if(b.innerText.toLowerCase() === tabId || (tabId==='setup' && b.innerText==='Setup')) {
                b.classList.add('active', 'bg-slate-800', 'border-blue-500', 'text-white');
            } else {
                b.classList.remove('active', 'bg-slate-800', 'border-blue-500', 'text-white');
            }
        });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
    };

    // 5. Smart Search Bar Logic
    const searchInp = document.getElementById('quick-search');
    const searchRes = document.getElementById('search-results');

    searchInp.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        searchRes.innerHTML = '';
        
        if (q.length < 2) {
            searchRes.classList.add('hidden');
            return;
        }

        let matches = 0;
        Object.keys(window.uiConfig).forEach(tabKey => {
            window.uiConfig[tabKey].fields.forEach(f => {
                if (f.label.toLowerCase().includes(q)) {
                    matches++;
                    const div = document.createElement('div');
                    div.className = "p-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer border-b border-slate-800";
                    div.innerText = `${f.label} → [${window.uiConfig[tabKey].label}]`;
                    
                    div.onclick = () => {
                        window.switchTab(tabKey);
                        searchRes.classList.add('hidden');
                        searchInp.value = '';
                        
                        // Scroll & Flash
                        setTimeout(() => {
                            const targetId = `inp-${tabKey}-${f.key}`;
                            const el = document.getElementById(targetId);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('flash-highlight');
                                el.focus();
                                setTimeout(() => el.classList.remove('flash-highlight'), 1500);
                            }
                        }, 50);
                    };
                    searchRes.appendChild(div);
                }
            });
        });

        if (matches > 0) {
            searchRes.classList.remove('hidden');
        } else {
            searchRes.classList.add('hidden');
        }
    });
    
    // Nascondi search se si clicca fuori
    document.addEventListener('click', (e) => {
        if(e.target !== searchInp) searchRes.classList.add('hidden');
    });
});
