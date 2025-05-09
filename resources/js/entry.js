import * as L from 'leaflet';

export default function leafletMapPickerEntry({ location, config }) {
    return {
        map: null,
        marker: null,
        location: null,
        tileLayer: null,
        config: {
            defaultZoom: 13,
            defaultLocation: {
                lat: 41.0082,
                lng: 28.9784,
            },
            tileProvider: 'openstreetmap',
            customTiles: [],
            customMarker: null,
            showTileControl: true,
            markerIconPath: '',
            markerShadowPath: '',
        },

        tileProviders: {
            openstreetmap: {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            },
            google: {
                url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                options: {
                    attribution: '&copy; Google Maps',
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }
            },
            googleSatellite: {
                url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                options: {
                    attribution: '&copy; Google Maps',
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }
            },
            googleTerrain: {
                url: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
                options: {
                    attribution: '&copy; Google Maps',
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }
            },
            googleHybrid: {
                url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
                options: {
                    attribution: '&copy; Google Maps',
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }
            },
            esri: {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                options: {
                    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
                }
            }
        },

        init: function () {
            this.location = location;
            this.config = { ...this.config, ...config };

            if (this.config.customTiles && Object.keys(this.config.customTiles).length > 0) {
                this.tileProviders = { ...this.tileProviders, ...this.config.customTiles };
            }

            this.initMap();
        },

        initMap: function () {
            const coordinates = this.getCoordinates();
            
            this.map = L.map(this.$refs.mapContainer).setView(
                [coordinates.lat, coordinates.lng],
                this.config.defaultZoom
            );

            this.setTileLayer(this.config.tileProvider);

            let markerOptions = { draggable: false };

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
        },

        setTileLayer: function(providerName) {
            if (this.tileLayer) {
                this.map.removeLayer(this.tileLayer);
            }

            const provider = this.tileProviders[providerName] || this.tileProviders.openstreetmap;

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
            let locationObj = this.location;
            
            if (typeof locationObj === 'string') {
                try {
                    locationObj = JSON.parse(locationObj);
                } catch (e) {
                    locationObj = null;
                }
            }

            if (
                locationObj === null ||
                !locationObj.hasOwnProperty('lat') ||
                !locationObj.hasOwnProperty('lng')
            ) {
                locationObj = {
                    lat: this.config.defaultLocation.lat,
                    lng: this.config.defaultLocation.lng,
                };
            }

            return locationObj;
        }
    };
}