# SIMRM Portal

## Panoramica
**SIMRM Portal** è il portale web dedicato alla richiesta di accesso e alla registrazione per il simulatore didattico SIMRM (Simulatore didattico di sequenze RM 2D e 3D). Il sistema gestisce l'autenticazione degli operatori e l'autorizzazione per accedere all'ambiente interattivo di simulazione delle sequenze RM (es. TSE, SPACE, GRE).

## Riferimenti Operativi
- **Portale Registrazione:** [simrmportal.vercel.app](https://simrmportal.vercel.app)
- **Simulatore RM:** [simulatorerm.vercel.app](https://simulatorerm.vercel.app/)

## Architettura Funzionale
Il portale si interfaccia con un'infrastruttura modulare così definita:
- **Autenticazione e Sicurezza:** Gestione accessi e privacy/cookie manager basati su Supabase. Le password generate hanno validità temporale limitata (6 mesi).
- **Motore di Simulazione (Endpoint):** Backend sviluppato in FastAPI con moduli fisici separati per la validazione dei limiti (TR/TE/SAR) e il calcolo delle equazioni di Bloch (TA, SNR, SAR, ESP, BW).
- **Deployment:** Vercel.

## Avvertenze e Limiti di Utilizzo
L'applicativo e il simulatore annesso hanno **scopi esclusivamente didattici**. 
Il sistema non è un dispositivo medico e i dati in output derivano esclusivamente da simulazioni algoritmiche su fantocci tecnico/anatomici (modelli vettoriali/matriciali)[cite: 5.7]. È severamente vietato l'utilizzo di questa piattaforma per scopi diagnostici, clinici o per la pianificazione di esami su pazienti reali.

## Setup Locale e Configurazione
*(Sezione da completare: inserire specifiche per l'inizializzazione dell'ambiente, le dipendenze e i comandi di avvio).*

---
**Sviluppo:** Francesco Fugaro | © 2024-2026 SIMRM Project
