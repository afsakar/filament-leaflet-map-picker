const PUBLIC_NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
let publicNominatimNextSearchAt = 0;

export function getGeolocationOptions(config = {}) {
    return {
        enableHighAccuracy: Boolean(config.geolocationHighAccuracy),
        timeout: Number(config.geolocationTimeout),
        maximumAge: 0,
    };
}

export function getGeolocationErrorMessageKey(error) {
    switch (error?.code) {
        case 1:
            return 'location_permission_denied';
        case 3:
            return 'location_timeout';
        case 2:
        default:
            return 'location_unavailable';
    }
}

export function scheduleModalSearch(component, query, overrides = {}) {
    const runtime = {
        now: () => Date.now(),
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        AbortController: globalThis.AbortController,
        fetch: globalThis.fetch.bind(globalThis),
        origin: globalThis.location?.origin,
        ...overrides,
    };

    runtime.clearTimeout(component.searchTimeout);
    component.searchController?.abort();

    const normalizedQuery = String(query ?? '').trim();

    if (normalizedQuery.length < 3) {
        component.searchTimeout = null;
        component.searchController = null;
        component.localSearchResults = [];
        component.isSearching = false;

        return false;
    }

    const requestId = (component.searchRequestId ?? 0) + 1;
    const now = runtime.now();
    let url;

    try {
        url = new URL(component.config.geocoderEndpoint, runtime.origin);
    } catch {
        url = null;
    }

    const isPublicNominatim = url?.origin === new URL(PUBLIC_NOMINATIM_ENDPOINT).origin
        && url.pathname === new URL(PUBLIC_NOMINATIM_ENDPOINT).pathname;
    let wait = Math.max(0, 1000 - (now - (component.lastSearchAt ?? 0)));

    if (isPublicNominatim) {
        const scheduledAt = Math.max(now, publicNominatimNextSearchAt);
        wait = scheduledAt - now;
        publicNominatimNextSearchAt = scheduledAt + 1000;
    }

    component.searchRequestId = requestId;
    component.localSearchResults = [];
    component.isSearching = true;
    component.searchTimeout = runtime.setTimeout(async () => {
        if (component.destroyed || component.searchRequestId !== requestId) {
            return;
        }

        component.lastSearchAt = runtime.now();

        const controller = new runtime.AbortController();
        component.searchController = controller;

        try {
            if (!url) {
                throw new TypeError('Invalid geocoder endpoint');
            }

            url.searchParams.set('format', 'json');
            url.searchParams.set('q', normalizedQuery);
            url.searchParams.set('limit', '8');

            const response = await runtime.fetch(url, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const error = new Error(`Geocoder returned ${response.status}`);
                error.status = response.status;

                throw error;
            }

            const data = await response.json();

            if (component.destroyed || component.searchRequestId !== requestId) {
                return;
            }

            component.localSearchResults = Array.isArray(data) ? data : [];
        } catch (error) {
            if (component.destroyed || error?.name === 'AbortError' || component.searchRequestId !== requestId) {
                return;
            }

            component.localSearchResults = [];
            component.notifySearchError?.(
                error?.status === 429 ? 'rate_limit_wait' : 'search_failed',
            );
        } finally {
            if (!component.destroyed && component.searchRequestId === requestId) {
                component.isSearching = false;
                component.searchTimeout = null;
            }

            if (component.searchController === controller) {
                component.searchController = null;
            }
        }
    }, wait);

    return true;
}
