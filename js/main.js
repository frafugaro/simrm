document.addEventListener('DOMContentLoaded', () => {
    // Inizializza il simulatore sul tab Routine
    window.switchTab('routine');

    // Chiusura menù ricerca cliccando fuori
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.relative')) {
            document.getElementById('search-results').classList.add('hidden');
        }
    });
});

// GESTORE NAVIGAZIONE TAB
window.switchTab = function(tabKey) {
    // 1. Aggiorna UI Sidebar
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-slate-800', 'border-blue-500', 'text-white');
        if(btn.dataset.tab === tabKey) btn.classList.add('active', 'bg-slate-800', 'border-blue-500', 'text-white');
    });

    // 2. Svuota e Ricrea Container
    const container = document.getElementById('params-container');
    container.innerHTML = `<h2 class="text-lg font-bold text-blue-400 border-b border-slate-700 pb-2 mb-6 uppercase tracking-widest">${window.config[tabKey].label}</h2>`;
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 lg:grid-cols-3 gap-6';

    window.config[tabKey].fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-1 transition-all duration-300 rounded-md p-1';
        wrapper.id = `wrapper-${field.id}`; // ID per l'evidenziazione

        // Label
        if (field.type !== 'button') {
            wrapper.innerHTML += `<label class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">${field.label}</label>`;
        }

        // Input Engine
        const val = window.state[field.id] !== undefined ? window.state[field.id] : '';
        let inputHtml = '';

        if (field.type === 'select') {
            inputHtml = `<select id="inp-${field.id}" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-inner">
                ${field.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
            </select>`;
        } else if (field.type === 'button') {
            inputHtml = `<button onclick="window.${field.action}" class="w-full mt-4 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-blue-400 font-bold py-2 px-4 rounded shadow-lg transition-colors text-xs tracking-wider uppercase">⚙️ ${field.label}</button>`;
        } else {
            inputHtml = `<input type="${field.type}" id="inp-${field.id}" value="${val}" ${field.step ? `step="${field.step}"` : ''} class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs shadow-inner">`;
        }

        wrapper.innerHTML += inputHtml;
        grid.appendChild(wrapper);
    });

    container.appendChild(grid);

    // 3. Associa Event Listeners per sincronizzare lo stato
    window.config[tabKey].fields.forEach(field => {
        if(field.type !== 'button') {
            const el = document.getElementById(`inp-${field.id}`);
            if(el) {
                el.addEventListener('change', (e) => {
                    window.state[field.id] = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    console.log(`State Updated: ${field.id} = ${window.state[field.id]}`);
                    // In futuro qui chiameremo window.calculatePhysics()
                });
            }
        }
    });
};

// MOTORE DI RICERCA INTELLIGENTE
window.searchParameters = function(query) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (!query || query.trim().length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('flex');
        return;
    }

    const lowerQuery = query.toLowerCase();
    let matches =[];

    // Scansione di tutto il config object
    Object.keys(window.config).forEach(tabKey => {
        window.config[tabKey].fields.forEach(field => {
            if (field.label.toLowerCase().includes(lowerQuery) || field.id.toLowerCase().includes(lowerQuery)) {
                matches.push({ tab: tabKey, field: field });
            }
        });
    });

    // Renderizzazione dei risultati
    if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'px-4 py-3 text-xs text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer border-b border-slate-700 last:border-0 transition-colors flex justify-between items-center';
            div.innerHTML = `<span>${match.field.label}</span> <span class="text-[9px] uppercase tracking-widest opacity-60 bg-black/20 px-2 py-1 rounded">${window.config[match.tab].label}</span>`;
            
            // Azione al click
            div.onclick = () => {
                document.getElementById('quick-search').value = '';
                resultsContainer.classList.add('hidden');
                
                // Salta al Tab e focalizza
                window.switchTab(match.tab);
                
                setTimeout(() => {
                    const targetWrapper = document.getElementById(`wrapper-${match.field.id}`);
                    const targetInput = document.getElementById(`inp-${match.field.id}`);
                    
                    if(targetWrapper && targetInput) {
                        // Scroll dolce
                        targetWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Focus logico sull'input
                        targetInput.focus();
                        
                        // Highlight temporaneo (Tailwind classes)
                        targetWrapper.classList.add('ring-2', 'ring-blue-500', 'bg-blue-900/40');
                        setTimeout(() => {
                            targetWrapper.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-900/40');
                        }, 2500);
                    }
                }, 50); // Piccolo delay per far renderizzare il DOM del nuovo tab
            };
            resultsContainer.appendChild(div);
        });
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('flex');
    } else {
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('flex');
    }
};

// Placeholder per il bottone Setup
window.triggerAutoIso = function() {
    alert('Funzione AUTO ISO invocata! (Da implementare nella logica geometrica)');
};
