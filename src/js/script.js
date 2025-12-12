// CONSTANTE API 
const API_BASE_URL = 'https://uselessfacts.jsph.pl/';

// [Lógica Pura: T1.1, T2.1, T2.2, T2.4 - Exportable para Testing]

// T1.1
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

// T1.1
function extractRandomText(fact) {
    if (!fact || !fact.text) {
        throw new Error('The provided fact structure is not valid for fact extraction.');
    }
    return {
        id: fact.id,
        text: fact.text.trim()
    };
};

// T2.2 - Lógica Pura: Cargar Favoritos
function loadFavorites() {
    const favoritesJSON = localStorage.getItem('curiousFactsFavorites');
    return favoritesJSON ? JSON.parse(favoritesJSON) : [];
}

// T2.1 - Lógica Pura: Guardar Favoritos
function saveToFavorites(fact) {
    let favorites = loadFavorites();
    const exists = favorites.some(fav => fav.id === fact.id);

    if (!exists) {
        favorites.unshift(fact); 
        localStorage.setItem('curiousFactsFavorites', JSON.stringify(favorites));
        return true;
    }
    return false;
}

function deleteFavorite(factId) {
    let favorites = loadFavorites();
    
    // Filtra el array, manteniendo solo los hechos cuyo ID no coincida.
    const initialLength = favorites.length;
    favorites = favorites.filter(fact => fact.id !== factId);
    
    // Si el tamaño cambió, significa que se eliminó uno.
    if (favorites.length < initialLength) {
        localStorage.setItem('curiousFactsFavorites', JSON.stringify(favorites));
        return true;
    }
    return false;
}

// === Lógica de inicialización (SÓLO DOM) ===

function initApp() {

    // === ELEMENTOS DEL DOM (T1.2) 
    const factTextElement = document.getElementById('fact-text');
    const newFactButton = document.getElementById('new-fact-button');
    const saveFactButton = document.getElementById('save-fact-button');
    const factCard = document.getElementById('fact-card');
    const favoritesListElement = document.getElementById('favorites-list'); // T2.2

    // --- Lógica DOM Interna (Usa las referencias DOM) ---

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

        saveFactButton.dataset.factId = factData.id;
        saveFactButton.dataset.factText = factData.text;

        saveFactButton.disabled = false;
        factCard.classList.remove('error');
    }

    function renderFavoritesList() {
        const favorites = loadFavorites();
        favoritesListElement.innerHTML = ''; 
        
        if (favorites.length === 0) {
            favoritesListElement.innerHTML = '<li class="text-secondary">No tienes hechos favoritos guardados.</li>';
            return;
        }

        favorites.forEach(fact => {
            const listItem = document.createElement('li');
            listItem.classList.add('favorite-item');
            
            const factSpan = document.createElement('span');
            factSpan.textContent = fact.text;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-favorite-btn');
            deleteButton.dataset.factId = fact.id; 
            
            // T2.4: Manejador de eliminación
            deleteButton.addEventListener('click', handleDeleteFact);
            
            listItem.appendChild(factSpan);
            listItem.appendChild(deleteButton);
            favoritesListElement.appendChild(listItem);
        });
    }
    
    // T2.3: Manejar el evento de guardar
    function handleSaveFact() {
        const factId = saveFactButton.dataset.factId;
        const factText = saveFactButton.dataset.factText;
        
        if (factId && factText) {
            const success = saveToFavorites({ id: factId, text: factText });
            
            if (success) {
                renderFavoritesList(); //  Refresca la lista
            }
        }
    }
    
    // T2.4: Manejar el evento de eliminación
    function handleDeleteFact(event) {
        const factIdToDelete = event.target.dataset.factId;
        
        if (factIdToDelete) {
            const success = deleteFavorite(factIdToDelete);
            
            if (success) {
                renderFavoritesList(); // Refresca la lista
            }
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
    saveFactButton.addEventListener('click', handleSaveFact); 

    loadNewFact(); 
    renderFavoritesList(); //  T2.2: Llamada inicial para mostrar favoritos
}

// Exportamos toda la lógica pura que necesitamos testear
export { fetchRandomFact, extractRandomText, saveToFavorites, loadFavorites, deleteFavorite };

//  LLAMADA FINAL: SOLO SE EJECUTA EN EL NAVEGADOR 
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
}