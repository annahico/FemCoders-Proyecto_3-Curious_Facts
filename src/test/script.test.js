// test/script.test.js

// Ejemplo de un test simple para que Vitest encuentre un archivo
import { describe, it, expect } from 'vitest';

describe('Initial Test', () => {
    it('This test must always be passed to verify the configuration.', () => {
        expect(1 + 1).toBe(2);
    });
});

