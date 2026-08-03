import assert from 'node:assert/strict';
import test from 'node:test';
import tileProviders from '../../resources/js/tile-providers.js';

test('default tile providers stay limited to policy-safe HTTPS presets', () => {
    assert.deepEqual(Object.keys(tileProviders), ['openstreetmap', 'esri']);
    assert.equal(tileProviders.openstreetmap.url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    assert.equal(
        tileProviders.esri.url,
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    );
    assert.equal('google' in tileProviders, false);
    assert.equal('googleSatellite' in tileProviders, false);
});
