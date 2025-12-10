// Esta función va a la base de datos de datos curiosos (la API) y pide uno nuevo.
// Espera la respuesta y verifica que la información llegue correctamente. 
// Si hay un problema de conexión o la base de datos falla, la función avisa con un error.

const fetchRandomFact = async (endpoint = 'api/v2/facts/random') => {
    // Aquí se construye la dirección web específica que visitaremos para pedir el dato.
    const API_URL = `https://uselessfacts.jsph.pl/api/v2/facts/${endpoint}?language=en`;
    try {
        const response = await fetch(API_URL); // 'await fetch' significa: 'Ve a la dirección web y espera la respuesta'
        if (!response.ok) { // Si la respuesta no es "todo bien" (ej: código 404 o 500), lanza un error.
            throw new Error(`API response error: ${response.status}`);
        }
        return await response.json(); // Convierte la respuesta en un formato que la aplicación puede usar (JSON).
    } catch (error) {
        throw error; // Si hay un error de conexión, se detiene y avisa.
    }
};

// Esta función toma los datos brutos que vinieron de Internet y los limpia. 
// Se asegura de que el dato contenga el texto y la identificación (ID) necesaria para guardarlo como favorito, y lo devuelve ordenado para que la aplicación lo muestre.

function extractRandomText(fact) { // Verifica si los datos llegaron incompletos o falta el texto principal.
    if (!fact || !fact.text) {
        throw new Error('The provided fact structure is not valid for fact extraction.');
    }
    return { // Devuelve un objeto simple con solo el ID y el texto, listo para usarse en la app.
        id: fact.id,
        text: fact.text
    };
};

// Hacemos que estas dos funciones estén disponibles para el el DOM y los tests.
export { fetchRandomFact, extractRandomText };

//  ELEMENTOS DEL DOM (T1.2) 
const factTextElement = document.getElementById('fact-text');
const newFactButton = document.getElementById('new-fact-button');
const saveFactButton = document.getElementById('save-fact-button');
const factCard = document.getElementById('fact-card');

// Muestra un mensaje de estado, deshabilitando o habilitando botones según sea necesario.
function displayStatus(message, isError = false) {
    factTextElement.textContent = message;
    newFactButton.disabled = true;
    saveFactButton.disables = true;

    // Si hay error, marcamos la tarjeta visualmente
    if (isError) {
        factCard.classList.add('error');
    } else {
        factCard.classList.remove('error');
    }
};

// Muestra el hecho ya procesado en la tarjeta principal.
function displayFact(factData) {
    factTextElement.textContent = factData.text;

    // Almacenamos el ID y el texto en el botón de guardar
    saveFactButton.dataset.factId = factData.id;
    saveFactButton.dataset.factTect = factData.text;

    // Habilita el botón de guardar, ya que hay un hecho válido
    saveFactButton.disabled = false;
    factCard.classList.remove('error');
};

// COORDINADOR PRINCIPAL (T1.3)

// Manejador asíncrono que coordina la llamada a la API y la actualización del DOM.
async function loadNewFact() {
    displayStatus("Loading a new curious fact...", false); // Muestra "Loading..." y deshabilita botones
    
    try {
        // T1.1: Lógica de red y extracción
        const rawData = await fetchRandomFact();
        const factData = extractRandomText(rawData); 
        
        // T1.2: Mostrar en la interfaz
        displayFact(factData); 

    } catch (error) {
        // Manejo del error en la interfaz
        console.error("Error loading the fact:", error);
        displayStatus("Oops! Failed to load the fact. Check your connection or the API URL.", true);
        
    } finally {
        // T1.3: Vuelve a habilitar el botón de "Nuevo Hecho" al finalizar
        newFactButton.disabled = false;
    }
};

// EVENT HANDLER (T1.3)

// 1. Conecta el botón 'Nuevo Hecho' al manejador 
newFactButton.addEventListener('click', loadNewFact);

// 2. Llama a la función al cargar la página 
document.addEventListener('DOMContentLoaded', loadNewFact);