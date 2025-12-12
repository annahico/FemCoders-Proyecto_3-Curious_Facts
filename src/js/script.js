// === CONSTANTE API ===
const API_BASE_URL = 'https://uselessfacts.jsph.pl/';

// [T1.1, T2.1: Lógica Pura - Exportable para Testing]

const fetchRandomFact = async (endpoint = 'api/v2/facts/random?language=es') => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

function extractRandomText(fact) {
    if (!fact || !fact.text) {
        throw new Error('The provided fact structure is not valid for fact extraction.');
    }

    return {
        id: fact.id,
        text: fact.text.trim()
    };
};

function saveToFavorites(fact) {
    const favoritesJSON = localStorage.getItem('curiousFactsFavorites');
    let favorites = favoritesJSON ? JSON.parse(favoritesJSON) : [];

    const exists = favorites.some(fav => fav.id === fact.id);

    if (!exists) {
        favorites.unshift(fact); 
        localStorage.setItem('curiousFactsFavorites', JSON.stringify(favorites));
        return true;
    }
    
    return false;
}


// === Lógica de inicialización (SÓLO DOM) ===

function initApp() {

    //  ELEMENTOS DEL DOM (T1.2) 
    const factTextElement = document.getElementById('fact-text');
    const newFactButton = document.getElementById('new-fact-button');
    const saveFactButton = document.getElementById('save-fact-button');
    const factCard = document.getElementById('fact-card');

    //  FUNCIONES DE ESTADO Y DISPLAY 
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

    // T1.3/T2.3: COMPLETA displayFact
    function displayFact(factData) {
        factTextElement.textContent = factData.text;

        // Almacena el ID y el texto en el botón (Para T2.3)
        saveFactButton.dataset.factId = factData.id;
        saveFactButton.dataset.factText = factData.text;

        saveFactButton.disabled = false;
        factCard.classList.remove('error');
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
    
    // T2.3: Manejar el evento de guardar
    function handleSaveFact() {
        const factId = saveFactButton.dataset.factId;
        const factText = saveFactButton.dataset.factText;
        
        if (factId && factText) {
            const success = saveToFavorites({ id: factId, text: factText });
            
            if (success) {
                // Opcional: Mostrar retroalimentación al usuario
                console.log(`Fact ${factId} guardado!`);
            } else {
                console.log(`Fact ${factId} ya existe en favoritos.`);
            }
        }
    }

    //  INICIALIZACIÓN DE EVENTOS (T1.3 & T2.3)
    newFactButton.addEventListener('click', loadNewFact);
    saveFactButton.addEventListener('click', handleSaveFact); // T2.3
    loadNewFact(); 
}


// Exportamos toda la lógica pura que necesitamos testear
export { fetchRandomFact, extractRandomText, saveToFavorites };

// LLAMADA FINAL: SOLO SE EJECUTA EN EL NAVEGADOR 
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
}