import * as L from 'leaflet';
import { createFieldState } from './field-state.js';
import {
    getGeolocationErrorMessageKey,
    getGeolocationOptions,
    scheduleModalSearch,
} from './field-policy.js';
import defaultTileProviders from './tile-providers.js';

export default function leafletMapPicker({ location, config }) {
    const fieldState = createFieldState();

    return {
        ...fieldState,
        map: null,
        marker: null,
        destroyed: false,
        lat: null,
        lng: null,
        location: null,
        lastValidCoordinates: null,
        tileLayer: null,
        searchTimeout: null,
        searchController: null,
        resizeObserver: null,
        searchRequestId: 0,
        lastSearchAt: 0,
        searchQuery: '',
        localSearchResults: [],
        isSearching: false,
        config: {
            draggable: true,
            clickable: true,
            defaultZoom: 13,
            defaultLocation: {
                lat: 37.9106,
                lng: 40.2365,
            },
            myLocationButtonLabel: '',
            searchModalId: '',
            geocoderEndpoint: 'https://nominatim.openstreetmap.org/search',
            geolocationHighAccuracy: false,
            geolocationTimeout: 10000,
            tileProvider: 'openstreetmap',
            customTiles: [],
            customMarker: null,
            searchButtonLabel: '',
            messages: {},
            is_disabled: false,
            showTileControl: true,
        },

        tileProviders: defaultTileProviders,

        init: function () {
            this.destroyed = false;
            this.location = location
            this.config = { ...this.config, ...config }
            this.resetSearchState();

            const customTiles = Array.isArray(this.config.customTiles) ? {} : (this.config.customTiles ?? {});

            this.tileProviders = { ...defaultTileProviders, ...customTiles };

            this.initMap()
            this.$watch('location', (value) => this.updateMapFromAlpine(value));
        },

        destroy: function () {
            this.destroyed = true;
            clearTimeout(this.searchTimeout);
            this.searchController?.abort();
            this.resizeObserver?.disconnect();
            this.map?.remove();
            this.searchTimeout = null;
            this.searchController = null;
            this.resizeObserver = null;
            this.map = null;
            this.marker = null;
            this.tileLayer = null;
        },

        initMap: function () {
            const coordinates = this.getCoordinates();

            this.map = L.map(this.$refs.mapContainer).setView(
                [coordinates.lat, coordinates.lng],
                this.config.defaultZoom
            );

            this.setTileLayer(this.config.tileProvider);

            let markerOptions = { draggable: this.config.draggable };

            if (this.config.customMarker) {
                const icon = L.icon(this.config.customMarker);
                markerOptions.icon = icon;
            } else {
                markerOptions.icon = L.icon({
                    iconUrl: this.config.markerIconPath,
                    shadowUrl: this.config.markerShadowPath,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize: [41, 41],
                })
            }

            this.marker = L.marker(
                [coordinates.lat, coordinates.lng],
                markerOptions
            ).addTo(this.map);

            this.lat = coordinates.lat;
            this.lng = coordinates.lng;
            this.lastValidCoordinates = coordinates;

            if (this.config.clickable) {
                this.map.on('click', (e) => {
                    this.markerMoved({
                        latLng: {
                            toJSON: () => ({
                                lat: e.latlng.lat,
                                lng: e.latlng.lng
                            })
                        }
                    });
                });
            }

            if (this.config.draggable) {
                this.marker.on('dragend', (e) => {
                    const position = e.target.getLatLng();
                    this.markerMoved({
                        latLng: {
                            toJSON: () => ({
                                lat: position.lat,
                                lng: position.lng
                            })
                        }
                    });
                });
            }

            if (! this.config.is_disabled) {
                this.addLocationButton();
                this.addSearchButton();
            }

            if (this.config.showTileControl) {
                this.addTileSelectorControl();
            }

            this.observeMapContainer();
            this.$nextTick(() => this.map?.invalidateSize(false));
        },

        addSearchButton: function () {
            const searchControl = L.Control.extend({
                options: {
                    position: 'topleft'
                },
                onAdd: (map) => {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    const button = L.DomUtil.create('button', 'search-button', container);
                    const label = this.config.searchButtonLabel || 'Search Location';
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    `;
                    button.type = 'button';
                    button.title = label;
                    button.setAttribute('aria-label', label);
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.width = '30px';
                    button.style.height = '30px';
                    button.setAttribute('x-tooltip.raw', label);

                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.disableScrollPropagation(container);

                    L.DomEvent.on(button, 'click', (e) => {
                        this.$dispatch('open-modal', { id: this.config.searchModalId });
                    });

                    return container;
                }
            });
        
            this.map.addControl(new searchControl());
        },

        resetSearchState: function () {
            clearTimeout(this.searchTimeout);
            this.searchController?.abort();

            this.searchTimeout = null;
            this.searchController = null;
            this.searchRequestId += 1;
            this.searchQuery = '';
            this.localSearchResults = [];
            this.isSearching = false;
        },

        notify: function (title, message) {
            if (!message) {
                return;
            }

            new FilamentNotification()
                .title(title)
                .body(message)
                .danger()
                .send();
        },

        notifySearchError: function (messageKey) {
            this.notify(
                this.config.searchButtonLabel || 'Search location',
                this.config.messages?.[messageKey] ?? '',
            );
        },

        notifyLocationError: function (messageKey) {
            this.notify(
                this.config.myLocationButtonLabel || 'My Location',
                this.config.messages?.[messageKey] ?? '',
            );
        },

        submitSearch: function () {
            this.searchLocationFromModal(this.searchQuery);
        },

        searchLocationFromModal: function(query) {
            const started = scheduleModalSearch(this, query);

            if (!started) {
                this.localSearchResults = [];
                this.isSearching = false;
            }
        },
        
        selectLocationFromModal: function(result) {
            if (!this.setCoordinates({ lat: result.lat, lng: result.lon })) {
                return;
            }

            this.resetSearchState();
            this.$dispatch('close-modal', { id: this.config.searchModalId });
        },

        setTileLayer: function(providerName) {
            if (this.tileLayer) {
                this.map.removeLayer(this.tileLayer);
            }

            const resolvedProviderName = this.tileProviders[providerName] ? providerName : 'openstreetmap';
            const provider = this.tileProviders[resolvedProviderName] || this.tileProviders.openstreetmap;

            this.config.tileProvider = resolvedProviderName;

            this.tileLayer = L.tileLayer(provider.url, provider.options).addTo(this.map);
        },

        addTileSelectorControl: function() {
            const tileControl = L.Control.extend({
                options: {
                    position: 'topright'
                },
                onAdd: (map) => {
                    const container = L.DomUtil.create('div', 'leaflet-tile-selector leaflet-bar leaflet-control');

                    const label = L.DomUtil.create('label', '', container);
                    label.textContent = this.config.map_type_text;

                    const select = L.DomUtil.create('select', '', container);

                    Object.keys(this.tileProviders).forEach(key => {
                        const option = L.DomUtil.create('option', '', select);
                        option.value = key;
                        option.textContent = this.formatProviderName(key);

                        if (key === this.config.tileProvider) {
                            option.selected = true;
                        }
                    });

                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.disableScrollPropagation(container);

                    L.DomEvent.on(select, 'change', (e) => {
                        this.setTileLayer(e.target.value);
                    });

                    return container;
                }
            });

            this.map.addControl(new tileControl());
        },

        formatProviderName: function(name) {
            return name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, function(str) { return str.toUpperCase(); })
                .trim();
        },

        addLocationButton: function () {
            const locationControl = L.Control.extend({
                options: {
                    position: 'topleft'
                },
                onAdd: (map) => {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    const button = L.DomUtil.create('button', 'location-button', container);
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    `;
                    button.type = 'button';
                    button.title = this.config.myLocationButtonLabel;
                    button.setAttribute('aria-label', this.config.myLocationButtonLabel);
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.width = '30px';
                    button.style.height = '30px';
                    button.setAttribute('x-tooltip.raw', this.config.myLocationButtonLabel);

                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.disableScrollPropagation(container);

                    L.DomEvent.on(button, 'click', (e) => {
                        this.goToCurrentLocation();
                    });

                    return container;
                }
            });

            this.map.addControl(new locationControl());
        },

        goToCurrentLocation: function () {
            if (!window.isSecureContext) {
                this.notifyLocationError('secure_context_required');

                return;
            }

            if (!navigator.geolocation) {
                this.notifyLocationError('browser_location_not_supported');

                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (this.destroyed) {
                        return;
                    }

                    this.setCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    this.notifyLocationError(getGeolocationErrorMessageKey(error));
                },
                getGeolocationOptions(this.config),
            );
        },

        markerMoved: function (event) {
            const position = event.latLng.toJSON();
            this.setCoordinates(position);
        },

        updateMap: function (position, shouldPan = true) {
            if (this.destroyed || !this.map || !this.marker) {
                return false;
            }

            this.marker.setLatLng([position.lat, position.lng]);

            if (shouldPan) {
                this.map.panTo([position.lat, position.lng]);
            }

            this.lat = position.lat;
            this.lng = position.lng;

            return true;
        },

        observeMapContainer: function () {
            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            this.resizeObserver?.disconnect();
            this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize(false));
            this.resizeObserver.observe(this.$refs.mapContainer);
        },
    }
}
