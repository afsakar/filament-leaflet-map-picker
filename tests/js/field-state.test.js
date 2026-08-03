import assert from 'node:assert/strict';
import test from 'node:test';
import { createFieldState } from '../../resources/js/field-state.js';

function createSubject(overrides = {}) {
    const fieldState = createFieldState();

    return {
        ...fieldState,
        location: null,
        map: { panToCalls: [], panTo(value) { this.panToCalls.push(value); } },
        marker: { setLatLngCalls: [], setLatLng(value) { this.setLatLngCalls.push(value); } },
        lat: null,
        lng: null,
        lastValidCoordinates: null,
        config: {
            defaultLocation: { lat: 41.0082, lng: 28.9784 },
        },
        updateMapCalls: [],
        updateMap(position, shouldPan) {
            this.updateMapCalls.push({ position, shouldPan });
            if (shouldPan) {
                this.map.panTo([position.lat, position.lng]);
            }
            this.lat = position.lat;
            this.lng = position.lng;
        },
        ...overrides,
    };
}

test('setCoordinates writes canonical entangled state and pans for user interactions', () => {
    const subject = createSubject();

    const result = subject.setCoordinates({ lat: '0', lng: '0' });

    assert.equal(result, true);
    assert.deepEqual(subject.location, { lat: 0, lng: 0 });
    assert.deepEqual(subject.lastValidCoordinates, { lat: 0, lng: 0 });
    assert.deepEqual(subject.updateMapCalls, [
        { position: { lat: 0, lng: 0 }, shouldPan: true },
    ]);
    assert.deepEqual(subject.map.panToCalls, [[0, 0]]);
});

test('setCoordinates mirrors canonical state into coordinate inputs', () => {
    const subject = createSubject({
        coordinateInputs: { lat: '', lng: '' },
    });

    assert.equal(subject.setCoordinates({ lat: '40.1', lng: '29.2' }), true);
    assert.deepEqual(subject.coordinateInputs, { lat: '40.1', lng: '29.2' });
});

test('coordinate inputs can update the map only after both values are valid', () => {
    const subject = createSubject({
        coordinateInputs: { lat: '40.1', lng: '29.2' },
    });

    assert.equal(subject.syncCoordinatesFromInputs(), true);
    assert.deepEqual(subject.location, { lat: 40.1, lng: 29.2 });

    subject.coordinateInputs.lat = '';

    assert.equal(subject.syncCoordinatesFromInputs(), false);
    assert.deepEqual(subject.location, { lat: 40.1, lng: 29.2 });
});

test('setCoordinates rejects invalid coordinates without mutating state', () => {
    const subject = createSubject({
        location: { lat: 1, lng: 2 },
        lastValidCoordinates: { lat: 1, lng: 2 },
    });

    const result = subject.setCoordinates({ lat: 91, lng: 0 });

    assert.equal(result, false);
    assert.deepEqual(subject.location, { lat: 1, lng: 2 });
    assert.deepEqual(subject.lastValidCoordinates, { lat: 1, lng: 2 });
    assert.deepEqual(subject.updateMapCalls, []);
});

test('updateMapFromAlpine ignores invalid external state and equal coordinates', () => {
    const subject = createSubject({
        lastValidCoordinates: { lat: 41.0082, lng: 28.9784 },
    });

    subject.updateMapFromAlpine({ lat: 91, lng: 0 });
    subject.updateMapFromAlpine({ lat: 41.0082, lng: 28.9784 });

    assert.deepEqual(subject.lastValidCoordinates, { lat: 41.0082, lng: 28.9784 });
    assert.deepEqual(subject.updateMapCalls, []);
    assert.deepEqual(subject.map.panToCalls, []);
});

test('updateMapFromAlpine pans only for a distinct valid external state', () => {
    const subject = createSubject({
        lastValidCoordinates: { lat: 41.0082, lng: 28.9784 },
    });

    subject.updateMapFromAlpine({ lat: '40.1', lng: '29.2' });

    assert.deepEqual(subject.lastValidCoordinates, { lat: 40.1, lng: 29.2 });
    assert.deepEqual(subject.updateMapCalls, [
        { position: { lat: 40.1, lng: 29.2 }, shouldPan: true },
    ]);
    assert.deepEqual(subject.map.panToCalls, [[40.1, 29.2]]);
});

test('getCoordinates resolves entangled location, last valid fallback, then default', () => {
    const subject = createSubject({
        location: { lat: '40.5', lng: '29.5' },
        lastValidCoordinates: { lat: 1, lng: 2 },
    });

    assert.deepEqual(subject.getCoordinates(), { lat: 40.5, lng: 29.5 });

    subject.location = { lat: 91, lng: 0 };
    assert.deepEqual(subject.getCoordinates(), { lat: 1, lng: 2 });

    subject.lastValidCoordinates = null;
    assert.deepEqual(subject.getCoordinates(), { lat: 41.0082, lng: 28.9784 });
});

test('setCoordinates ignores late geolocation updates after destroy', () => {
    const subject = createSubject({
        destroyed: true,
        location: { lat: 1, lng: 2 },
        lastValidCoordinates: { lat: 1, lng: 2 },
        lat: 1,
        lng: 2,
        updateMap(position, shouldPan) {
            this.updateMapCalls.push({ position, shouldPan });
            return false;
        },
    });

    const result = subject.setCoordinates({ lat: 40.1, lng: 29.2 });

    assert.equal(result, false);
    assert.deepEqual(subject.location, { lat: 1, lng: 2 });
    assert.deepEqual(subject.lastValidCoordinates, { lat: 1, lng: 2 });
    assert.equal(subject.lat, 1);
    assert.equal(subject.lng, 2);
    assert.deepEqual(subject.updateMapCalls, []);
});
