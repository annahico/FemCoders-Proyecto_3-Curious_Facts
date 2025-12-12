import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
// Importamos todas las funciones de lógica pura
import { 
    fetchRandomFact, 
    extractRandomText, 
    saveToFavorites, 
    loadFavorites, 
    deleteFavorite 
} from '../js/script.js'; 

// PREPARACIÓN DEL ENTORNO (MOCKING DE FETCH Y LOCALSTORAGE) 

// 1. Mockear Fetch (T1.x)
global.fetch = vi.fn();

// 2. Mockear localStorage (T2.x)
const localStorageMock = (function() {
    let store = {};
    return {
        // getItem debe devolver null si la clave no existe, como el localStorage real
        getItem: vi.fn(key => store[key] || null), 
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn(key => {
            delete store[key];
        }),
    };
})();

// Sustituir el localStorage global por nuestro mock
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Limpiar mocks después de cada prueba
afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // Limpiar el mock de localStorage
});

// TEST SUITE 1: fetchRandomFact (T1.x - Lógica de Red)
describe('fetchRandomFact', () => { 
    it('debe devolver el objeto JSON completo en caso de éxito (response.ok = true)', async () => {
        const mockData = { text: "Un hecho simulado.", id: "12345" };
        fetch.mockResolvedValue({ ok: true, json: async () => mockData });
        const result = await fetchRandomFact();
        expect(result).toEqual(mockData);
    });
    it('debe lanzar un error si la respuesta de la API no es ok (ej: 404)', async () => {
        fetch.mockResolvedValue({ ok: false, status: 404 });
        await expect(fetchRandomFact()).rejects.toThrow('API response error: 404');
    });
    it('debe lanzar un error si ocurre un fallo de red o conexión', async () => {
        const networkError = new Error('Network failure');
        fetch.mockRejectedValue(networkError);
        await expect(fetchRandomFact()).rejects.toThrow('Network failure');
    });
});


// TEST SUITE 2: extractRandomText (T1.x - Lógica de Procesamiento)
describe('extractRandomText', () => { 
    it('debe devolver el objeto limpio con id y texto si los datos son válidos', () => {
        const rawData = { text: "El sol es amarillo.", id: "98765", source: "wikipedia" };
        const expected = { id: "98765", text: "El sol es amarillo." };
        const result = extractRandomText(rawData);
        expect(result).toEqual(expected);
    });
    it('debe lanzar un error si el objeto de entrada es nulo o indefinido', () => {
        expect(() => extractRandomText(null)).toThrow('The provided fact structure is not valid for fact extraction.');
    });
    it("debe lanzar un error si el objeto de entrada no tiene la propiedad 'text'", () => {
        const incompleteData = { id: "123", source: "other" };
        expect(() => extractRandomText(incompleteData)).toThrow('The provided fact structure is not valid for fact extraction.');
    });
});

// TEST SUITE 3: saveToFavorites (T2.4 - Lógica de Guardado)
describe('saveToFavorites', () => {
    const fact1 = { id: 'a1b2', text: 'Facto Uno' };
    const fact2 = { id: 'c3d4', text: 'Facto Dos' };

    it('debe guardar el primer hecho y devolver true', () => {
        const success = saveToFavorites(fact1);
        expect(success).toBe(true); 
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('debe añadir un nuevo hecho al inicio de la lista y devolver true', () => {
        // Pre-carga un hecho
        localStorage.setItem('curiousFactsFavorites', JSON.stringify([fact1]));
        
        // Ejecución del segundo hecho
        saveToFavorites(fact2);

        // Verifica que fact2 esté primero
        const saved = JSON.parse(localStorage.getItem('curiousFactsFavorites'));
        expect(saved[0].id).toBe('c3d4');
        expect(saved.length).toBe(2);
    });

    it('no debe guardar un hecho duplicado (mismo ID) y debe devolver false', () => {
        localStorage.setItem('curiousFactsFavorites', JSON.stringify([fact1]));
        
        // Intenta guardar el mismo hecho
        const success = saveToFavorites(fact1);

        expect(success).toBe(false); 
        
        // El setItem solo debe haberse llamado 1 vez (durante la pre-carga)
        expect(localStorage.setItem).toHaveBeenCalledTimes(1); 
    });
});

// TEST SUITE 4: loadFavorites (T2.x - Lógica de Carga)

describe('loadFavorites', () => {
    it('debe devolver un array vacío si localStorage está vacío', () => {
        // localStorage.getItem retornará null, que es lo que simulamos
        const favorites = loadFavorites();
        expect(favorites).toEqual([]);
        expect(localStorage.getItem).toHaveBeenCalled();
    });

    it('debe devolver los favoritos parseados si existen en localStorage', () => {
        const mockFacts = [{ id: 'x', text: 'T1' }, { id: 'y', text: 'T2' }];
        localStorage.setItem('curiousFactsFavorites', JSON.stringify(mockFacts));

        const favorites = loadFavorites();
        expect(favorites).toEqual(mockFacts);
    });
});

// TEST SUITE 5: deleteFavorite (T2.x - Lógica de Eliminación)

describe('deleteFavorite', () => {
    const fact1 = { id: 'a1b2', text: 'Facto Uno' };
    const fact2 = { id: 'c3d4', text: 'Facto Dos' };
    
    beforeEach(() => {
        // Pre-carga ambos hechos antes de cada test en esta suite
        localStorage.setItem('curiousFactsFavorites', JSON.stringify([fact1, fact2]));
    });

    it('debe eliminar el hecho por ID y devolver true', () => {
        const success = deleteFavorite('a1b2'); // Eliminar fact1
        
        expect(success).toBe(true);
        
        // El resultado debe contener solo fact2
        const favorites = JSON.parse(localStorage.getItem('curiousFactsFavorites'));
        expect(favorites).toEqual([fact2]);
    });

    it('debe devolver false si el ID no se encuentra', () => {
        const success = deleteFavorite('z999'); // ID inexistente
        
        expect(success).toBe(false);
        
        // La lista debe permanecer sin cambios
        const favorites = JSON.parse(localStorage.getItem('curiousFactsFavorites'));
        expect(favorites).toEqual([fact1, fact2]);
        expect(favorites.length).toBe(2);
    });
});