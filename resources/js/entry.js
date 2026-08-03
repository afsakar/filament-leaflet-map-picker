import * as L from 'leaflet';
import { normalizeCoordinates, resolveCoordinates } from './coordinates.js';
import { getEntryInteractionOptions } from './entry-policy.js';
import defaultTileProviders from './tile-providers.js';

export default function leafletMapPickerEntry({ location, config }) {
    return {
        map: null,
        marker: null,
        location: null,
        selectedCoordinates: normalizeCoordinates(location),
        searchTimeout: null,
        searchController: null,
        resizeObserver: null,
        tileLayer: null,
        config: {
            defaultZoom: 13,
            defaultLocation: {
                lat: 37.9106,
                lng: 40.2365,
            },
            tileProvider: 'openstreetmap',
            customTiles: [],
            customMarker: null,
            showTileControl: true,
            interactive: true,
            map_type_text: 'Map Type',
            markerIconPath: '',
            markerShadowPath: '',
        },

        tileProviders: defaultTileProviders,

        init: function () {
            this.location = location;
            this.config = { ...this.config, ...config };
            const customTiles = Array.isArray(this.config.customTiles) ? {} : (this.config.customTiles ?? {});

            this.tileProviders = { ...defaultTileProviders, ...customTiles };

            this.initMap();
        },

        destroy: function () {
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
            const interactionOptions = getEntryInteractionOptions(this.config.interactive);

            this.map = L.map(this.$refs.mapContainer, interactionOptions.map).setView(
                [coordinates.lat, coordinates.lng],
                this.config.defaultZoom
            );

            this.setTileLayer(this.config.tileProvider);

            const markerOptions = interactionOptions.marker;

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

            if (this.config.showTileControl) {
                this.addTileSelectorControl();
            }

            this.observeMapContainer();
            this.$nextTick(() => this.map?.invalidateSize(false));
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

                    const select = L.DomUtil.create('select', '', container);
                    select.setAttribute('aria-label', this.config.map_type_text || 'Map Type');

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

        getCoordinates: function () {
            return resolveCoordinates(this.location, this.config.defaultLocation) ?? {
                lat: 37.9106,
                lng: 40.2365,
            };
        },

        observeMapContainer: function () {
            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            this.resizeObserver?.disconnect();
            this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize(false));
            this.resizeObserver.observe(this.$refs.mapContainer);
        },
    };
}
