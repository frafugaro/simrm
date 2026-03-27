// Gestione Interazioni e Ciclo di Vita della UI
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Setup Login Screen
    const loginBtn = document.getElementById('login-btn');
    const loginPwd = document.getElementById('login-pwd');
    const loginErr = document.getElementById('login-err');
    
    loginBtn.addEventListener('click', () => {
        if(loginPwd.value === 'simulatore') {
            document.getElementById('login-screen').style.display = 'none';
            initSimulator();
        } else {
            loginErr.classList.remove('hidden');
        }
    });
    
    // Supporto per tasto invio sul login
    loginPwd.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') loginBtn.click();
    });

    // 2. Gestione Tabs laterali (DOM traverse senza rebuild)
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Rimuovi focus da tutte
            tabs.forEach(t => t.classList.remove('active', 'bg-gray-800'));
            contents.forEach(c => c.classList.add('hidden'));
            
            // Attiva tab cliccato
            tab.classList.add('active', 'bg-gray-800');
            document.getElementById(tab.dataset.target).classList.remove('hidden');
        });
    });

    // 3. Inizializzazione dati e Listener
    function initSimulator() {
        const inputs = document.querySelectorAll('.state-input');
        
        inputs.forEach(input => {
            const key = input.dataset.key;
            
            // Pre-popola HTML in base a config.js (senza distruggere gli elementi HTML)
            if(window.state[key] !== undefined) {
                input.value = window.state[key];
            }
            
            // Aggiungi listener per aggiornamento reattivo
            input.addEventListener('change', (e) => {
                updateState(key, e.target.value);
            });
            input.addEventListener('keyup', (e) => {
                // Aggiornamento live anche digitando (per un feel più reattivo)
                updateState(key, e.target.value);
            });
        });

        // Prima renderizzazione della fisica e grafica
        updateUI();
    }
});

// 4. Update core (Modifica stato -> Calcolo -> Update DOM)
window.updateState = function(key, val) {
    // Parse corretto basato sul tipo atteso
    let parsedVal = isNaN(val) ? val : parseFloat(val);
    
    // Gestione stringhe vuote o NaN improvvisi (es: cancella campo)
    if(val === "") parsedVal = 0; 

    // Aggiorna Global State
    window.state[key] = parsedVal;
    
    // Ricalcola fisica e rendering grafico
    updateUI();
};

function updateUI() {
    // Math logic (physics.js)
    const phys = calculatePhysics();
    
    // Update Header Text (Utilizzando .innerText non perdiamo il focus degli input form)
    document.getElementById('out-ta').innerText = phys.TA_str;
    document.getElementById('out-snr').innerText = phys.SNR;
    document.getElementById('out-ny').innerText = phys.Ny_eff;
    document.getElementById('out-nz').innerText = phys.Nz_eff;

    // Colori Header reattivi
    const snrEl = document.getElementById('out-snr');
    if(parseFloat(phys.SNR) < 0.5) snrEl.className = "font-mono text-red-500 text-lg";
    else if(parseFloat(phys.SNR) > 1.5) snrEl.className = "font-mono text-green-400 text-lg";
    else snrEl.className = "font-mono text-yellow-400 text-lg";

    // Graphics logic (phantom.js)
    renderPhantom();
}