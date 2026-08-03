import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('./support/leaflet-stub-hooks.mjs', import.meta.url);

const { default: leafletMapPicker } = await import('../../resources/js/field.js');

test('entangled location is exposed as an own property of the component', () => {
    // Alpine initializes `$wire.$entangle()` interceptors only for properties that
    // exist on the object returned to x-data. Assigning it later (e.g. inside init())
    // leaves the interceptor uninitialized, so state writes never reach Livewire.
    const entangled = { lat: 41.0082, lng: 28.9784 };

    const component = leafletMapPicker({ location: entangled, config: {} });

    assert.equal(Object.hasOwn(component, 'location'), true);
    assert.equal(component.location, entangled);
});
