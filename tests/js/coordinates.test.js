import assert from 'node:assert/strict';
import test from 'node:test';
import { coordinatesEqual, normalizeCoordinates, resolveCoordinates } from '../../resources/js/coordinates.js';

test('normalizes canonical, legacy, JSON, numeric strings, and zero', () => {
    assert.deepEqual(normalizeCoordinates({ lat: '0', lng: '0' }), { lat: 0, lng: 0 });
    assert.deepEqual(normalizeCoordinates([41.0082, 28.9784]), { lat: 41.0082, lng: 28.9784 });
    assert.deepEqual(normalizeCoordinates('{"lat":41.0082,"lng":28.9784}'), { lat: 41.0082, lng: 28.9784 });
});

test('rejects invalid coordinates and keeps the last valid fallback', () => {
    assert.equal(normalizeCoordinates({ lat: 91, lng: 0 }), null);
    assert.deepEqual(resolveCoordinates({ lat: 91, lng: 0 }, { lat: 0, lng: 0 }), { lat: 0, lng: 0 });
});

test('rejects empty, structured, and non-decimal coordinate values', () => {
    for (const value of ['', '   ', [], {}, '0x10', '0b10']) {
        assert.equal(normalizeCoordinates({ lat: value, lng: 0 }), null);
        assert.equal(normalizeCoordinates({ lat: 0, lng: value }), null);
    }
});

test('compares coordinates without truthy checks', () => {
    assert.equal(coordinatesEqual({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }), true);
    assert.equal(coordinatesEqual({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), false);
});
