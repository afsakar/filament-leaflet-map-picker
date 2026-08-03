import assert from 'node:assert/strict';
import test from 'node:test';

let getEntryInteractionOptions;

try {
    ({ getEntryInteractionOptions } = await import('../../resources/js/entry-policy.js'));
} catch {
    // The assertion below reports the missing behavior as a test failure.
}

test('disables every map and marker interaction only when requested', () => {
    assert.equal(typeof getEntryInteractionOptions, 'function');

    assert.deepEqual(getEntryInteractionOptions(false), {
        map: {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false,
        },
        marker: {
            draggable: false,
            interactive: false,
            keyboard: false,
        },
    });

    assert.deepEqual(getEntryInteractionOptions(), {
        map: {
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            touchZoom: true,
        },
        marker: {
            draggable: false,
            interactive: true,
            keyboard: true,
        },
    });
});
