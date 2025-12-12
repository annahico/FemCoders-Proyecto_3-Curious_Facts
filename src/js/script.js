// src/js/script.js

// === CONSTANTE API ===
const API_BASE_URL = 'https://uselessfacts.jsph.pl/';

// [T1.1: Lógica Pura - Exportable para Testing]

const fetchRandomFact = async (endpoint = 'api/v2/facts/random?language=es') => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            // Lanza un error si la respuesta HTTP no es exitosa (ej: 404, 500)
            throw new Error(`API response error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        // Relanza el error de red o de respuesta para que sea manejado por el coordinador
        throw new Error(error.message);
    }
};

function extractRandomText(fact) {
    if (!fact || !fact.text) {
        throw new Error('The provided fact structure is not valid for fact extraction.');
    }

    // Retorna solo las propiedades que necesitamos para el DOM y el almacenamiento
    return {
        id: fact.id,
        text: fact.text.trim()
    };
};
//  Lógica de inicialización (SÓLO DOM) 

 // Inicializa la aplicación, obteniendo referencias al DOM y configurando eventos.
 // Esta función es llamada solo por el navegador, no por Vitest.

function initApp() {

    //  ELEMENTOS DEL DOM (T1.2) 
    const factTextElement = document.getElementById('fact-text');
    const newFactButton = document.getElementById('new-fact-button');
    const saveFactButton = document.getElementById('save-fact-button');
    const factCard = document.getElementById('fact-card');

    //  FUNCIONES DE ESTADO Y DISPLAY 
    function displayStatus(message, isError = false) {
        factTextElement.textContent = message;
        newFactButton.disabled = true;
        saveFactButton.disabled = true;

        if (isError) {
            factCard.classList.add('error');
        } else {
            factCard.classList.remove('error');
        }
    }

    // COORDINADOR PRINCIPAL (T1.3) 
    async function loadNewFact() {
        displayStatus("Cargando un nuevo hecho curioso...", false);

        try {
            const rawData = await fetchRandomFact();
            const factData = extractRandomText(rawData);
            displayFact(factData);
        } catch (error) {
            console.error("Error al cargar el hecho:", error);
            displayStatus("¡Ups! Falló la carga del hecho. Revisa tu conexión o la URL de la API.", true);
        } finally {
            newFactButton.disabled = false;
        }
    }

    //  INICIALIZACIÓN DE EVENTOS (T1.3) 
    newFactButton.addEventListener('click', loadNewFact);
    loadNewFact(); // Llamada inicial al cargar la página (Requisito funcional)
}


// Exportamos solo la lógica pura que necesitamos testear (para T1.4)
export { fetchRandomFact, extractRandomText };

//  LLAMADA FINAL: SOLO SE EJECUTA EN EL NAVEGADOR 
// Condición: Solo añade el listener si 'document' existe (es decir, en el navegador).
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
}