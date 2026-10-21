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
Il sistema non è un dispositivo medico e i dati in output derivano esclusivamente da simulazioni algoritmiche su fantocci tecnico/anatomici (modelli vettoriali/matriciali). È severamente vietato l'utilizzo di questa piattaforma per scopi diagnostici, clinici o per la pianificazione di esami su pazienti reali.

## Struttura del Repository e Note per gli Sviluppatori

> **Nota importante:** Questo repository **non contiene** il codice sorgente del simulatore RM (algoritmi, calcoli delle equazioni di Bloch o interfaccia di simulazione). 

Questo progetto ospita esclusivamente il **portale di presentazione e richiesta accessi**: una landing page informativa con il sistema di autenticazione e gestione delle credenziali per gli utenti.

### Caratteristiche del repository
- Contiene l'interfaccia di presentazione delle funzionalità di SIMRM.
- Gestisce il form di richiesta credenziali e l'interfaccia di login/registrazione.
- Il motore di simulazione effettivo risiede in un repository privato separato ed è erogato su un dominio dedicato ([simulatorerm.vercel.app](https://simulatorerm.vercel.app/)).

Di conseguenza, il clonato di questo repository è utile solo se si desidera analizzare o contribuire alla gestione del portale web di richiesta accessi e alle sue integrazioni di autenticazione.

## Contatti e Contributi

Se desideri contribuire al miglioramento del portale, segnalare un problema o proporre suggerimenti e consigli sul progetto, puoi inviare un'e-mail a:

📧 **simrm.portal@gmail.com**

---
**Sviluppo:** Francesco Fugaro | © 2024-2026 SIMRM Project
