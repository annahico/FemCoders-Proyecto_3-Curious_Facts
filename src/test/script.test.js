import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchRandomFact, extractRandomText } from '../js/script.js';

global.fetch = vi.fn();

afterEach(() => {
    vi.clearAllMocks();
});

describe('fetchRandomFact', () => {

    it('debe devolver el objeto JSON completo en caso de éxito (response.ok = true)', async () => {
        const mockData = { text: "Un hecho simulado.", id: "12345" };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        const result = await fetchRandomFact();
        expect(result).toEqual(mockData);
    });

    it('debe lanzar un error si la respuesta de la API no es ok (ej: 404)', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 404,
        });

        await expect(fetchRandomFact()).rejects.toThrow('API response error: 404');
    });

    it('debe lanzar un error si ocurre un fallo de red o conexión', async () => {
        const networkError = new Error('Network failure');

        fetch.mockRejectedValue(networkError);

        await expect(fetchRandomFact()).rejects.toThrow('Network failure');
    });

});


describe('extractRandomText', () => {

    it('debe devolver el objeto limpio con id y texto si los datos son válidos', () => {
        const rawData = { text: "El sol es amarillo.", id: "98765", source: "wikipedia" };
        const expected = { id: "98765", text: "El sol es amarillo." };

        const result = extractRandomText(rawData);
        expect(result).toEqual(expected);
    });

    it('debe lanzar un error si el objeto de entrada es nulo o indefinido', () => {
        expect(() => extractRandomText(null)).toThrow(
            'The provided fact structure is not valid for fact extraction.'
        );
    });

    it("debe lanzar un error si el objeto de entrada no tiene la propiedad 'text'", () => {
        const incompleteData = { id: "123", source: "other" };

        expect(() => extractRandomText(incompleteData)).toThrow(
            'The provided fact structure is not valid for fact extraction.'
        );
    });
});