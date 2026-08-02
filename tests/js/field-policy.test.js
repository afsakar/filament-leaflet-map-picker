import assert from 'node:assert/strict';
import test from 'node:test';
import {
    getGeolocationErrorMessageKey,
    getGeolocationOptions,
    scheduleModalSearch,
} from '../../resources/js/field-policy.js';

function createDeferred() {
    let resolve;
    let reject;

    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
}

function createTimerHarness() {
    const timers = [];
    let nextId = 1;

    return {
        timers,
        setTimeout(callback, delay) {
            const timer = { id: nextId++, callback, delay, cleared: false };
            timers.push(timer);

            return timer;
        },
        clearTimeout(timer) {
            if (timer) {
                timer.cleared = true;
            }
        },
    };
}

function createSearchSubject(overrides = {}) {
    return {
        config: {
            geocoderEndpoint: 'https://nominatim.openstreetmap.org/search',
            geolocationHighAccuracy: false,
            geolocationTimeout: 10000,
        },
        searchTimeout: null,
        searchController: null,
        searchRequestId: 0,
        lastSearchAt: 0,
        searchQuery: '',
        localSearchResults: [],
        isSearching: false,
        notifications: [],
        notifySearchError(messageKey) {
            this.notifications.push(messageKey);
        },
        ...overrides,
    };
}

test('scheduleModalSearch rate-limits, aborts earlier work, and ignores stale results', async () => {
    const timers = createTimerHarness();
    let now = 1_000;
    let createdControllers = 0;

    class FakeAbortController {
        constructor() {
            this.signal = { aborted: false };
            createdControllers += 1;
        }

        abort() {
            this.signal.aborted = true;
        }
    }

    const firstResponse = createDeferred();
    const secondResponse = createDeferred();
    const fetchCalls = [];

    const subject = createSearchSubject();

    scheduleModalSearch(subject, 'first result', {
        now: () => now,
        setTimeout: timers.setTimeout,
        clearTimeout: timers.clearTimeout,
        AbortController: FakeAbortController,
        fetch: (url, options) => {
            fetchCalls.push({ url: String(url), options });

            return fetchCalls.length === 1 ? firstResponse.promise : secondResponse.promise;
        },
    });

    assert.equal(subject.isSearching, true);
    assert.equal(timers.timers[0].delay, 0);

    const firstPendingSearch = timers.timers[0].callback();
    assert.equal(createdControllers, 1);

    now = 1_200;

    scheduleModalSearch(subject, 'second result', {
        now: () => now,
        setTimeout: timers.setTimeout,
        clearTimeout: timers.clearTimeout,
        AbortController: FakeAbortController,
        fetch: (url, options) => {
            fetchCalls.push({ url: String(url), options });

            return fetchCalls.length === 1 ? firstResponse.promise : secondResponse.promise;
        },
    });

    assert.equal(subject.searchController.signal.aborted, true);
    assert.equal(timers.timers[0].cleared, true);
    assert.equal(timers.timers[1].delay, 800);

    const secondPendingSearch = timers.timers[1].callback();
    assert.equal(createdControllers, 2);

    secondResponse.resolve({
        ok: true,
        json: async () => [{ display_name: 'new result' }],
    });
    await secondPendingSearch;
    await flushPromises();

    assert.deepEqual(subject.localSearchResults, [{ display_name: 'new result' }]);
    assert.equal(subject.isSearching, false);

    firstResponse.resolve({
        ok: true,
        json: async () => [{ display_name: 'old result' }],
    });
    await firstPendingSearch;
    await flushPromises();

    assert.deepEqual(subject.localSearchResults, [{ display_name: 'new result' }]);
    assert.equal(fetchCalls[0].url, 'https://nominatim.openstreetmap.org/search?format=json&q=first+result&limit=8');
    assert.equal(fetchCalls[1].url, 'https://nominatim.openstreetmap.org/search?format=json&q=second+result&limit=8');
    assert.deepEqual(fetchCalls[1].options.headers, { Accept: 'application/json' });
});

test('scheduleModalSearch reports geocoder failures without surfacing aborts', async () => {
    const timers = createTimerHarness();

    class FakeAbortController {
        constructor() {
            this.signal = { aborted: false };
        }

        abort() {
            this.signal.aborted = true;
        }
    }

    const subject = createSearchSubject();

    scheduleModalSearch(subject, 'limited query', {
        now: () => 2_000,
        setTimeout: timers.setTimeout,
        clearTimeout: timers.clearTimeout,
        AbortController: FakeAbortController,
        fetch: async () => ({
            ok: false,
            status: 429,
            json: async () => [],
        }),
    });

    await timers.timers[0].callback();
    await flushPromises();

    assert.deepEqual(subject.notifications, ['rate_limit_wait']);
    assert.deepEqual(subject.localSearchResults, []);

    subject.notifications = [];

    scheduleModalSearch(subject, 'aborted query', {
        now: () => 3_500,
        setTimeout: timers.setTimeout,
        clearTimeout: timers.clearTimeout,
        AbortController: FakeAbortController,
        fetch: async () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            throw error;
        },
    });

    await timers.timers[1].callback();
    await flushPromises();

    assert.deepEqual(subject.notifications, []);
});

test('getGeolocationOptions and error keys follow the configured policy', () => {
    assert.deepEqual(
        getGeolocationOptions({
            geolocationHighAccuracy: true,
            geolocationTimeout: 4500,
        }),
        {
            enableHighAccuracy: true,
            timeout: 4500,
            maximumAge: 0,
        },
    );

    assert.equal(getGeolocationErrorMessageKey({ code: 1 }), 'location_permission_denied');
    assert.equal(getGeolocationErrorMessageKey({ code: 2 }), 'location_unavailable');
    assert.equal(getGeolocationErrorMessageKey({ code: 3 }), 'location_timeout');
    assert.equal(getGeolocationErrorMessageKey({ code: 999 }), 'location_unavailable');
});
