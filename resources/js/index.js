import * as L from 'leaflet';

export default function leafletMapPicker({ location, config }) {
    return {
        map: null,
        marker: null,
        lat: null,
        lng: null,
        location: null,
        tileLayer: null,
        config: {
            draggable: true,
            clickable: true,
            defaultZoom: 13,
            defaultLocation: {
                lat: 41.0082,
                lng: 28.9784,
            },
            myLocationButtonLabel: '',
            statePath: '',
            tileProvider: 'openstreetmap',
            customTiles: [],
            customMarker: null,
            searchButtonLabel: '',
            searchQuery: '',
            localSearchResults: [],
            isSearching: false,
            searchTimeout: null,
            is_disabled: false,
            showTileControl: true,
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
            this.location = location
            this.config = { ...this.config, ...config }
            this.searchQuery = ''
            this.localSearchResults = []
            this.isSearching = false

            if (this.config.customTiles && Object.keys(this.config.customTiles).length > 0) {
                this.tileProviders = { ...this.tileProviders, ...this.config.customTiles }
            }

            this.initMap()
            this.$watch('location', (value) => this.updateMapFromAlpine());
        },

        initMap: function () {
            this.map = L.map(this.$refs.mapContainer).setView(
                [this.getCoordinates().lat, this.getCoordinates().lng],
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
                [this.getCoordinates().lat, this.getCoordinates().lng],
                markerOptions
            ).addTo(this.map);

            this.lat = this.getCoordinates().lat;
            this.lng = this.getCoordinates().lng;
            this.setCoordinates(this.getCoordinates());

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
        },

        addSearchButton: function () {
            const searchControl = L.Control.extend({
                options: {
                    position: 'topleft'
                },
                onAdd: (map) => {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    const button = L.DomUtil.create('a', 'search-button', container);
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    `;
                    button.title = this.config.searchButtonLabel || 'Search Location';
                    button.href = '#';
                    button.role = 'button';
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.width = '30px';
                    button.style.height = '30px';
                    button.setAttribute('x-tooltip.raw', this.config.searchButtonLabel || 'Search Location');
        
                    L.DomEvent.on(button, 'click', (e) => {
                        L.DomEvent.preventDefault(e);
                        this.$dispatch('open-modal', { id: 'location-search-modal' });
                    });
        
                    return container;
                }
            });
        
            this.map.addControl(new searchControl());
        },

        debounceSearch: function() {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            if (!this.searchQuery || this.searchQuery.length < 3) {
                this.localSearchResults = [];
                this.isSearching = false;
                return;
            }
            
            this.isSearching = true;
            this.searchTimeout = setTimeout(() => {
                this.searchLocationFromModal(this.searchQuery);
            }, 500);
        },

        searchLocationFromModal: function(query) {
            if (!query || query.length < 3) {
                this.isSearching = false;
                return;
            }
            
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`)
                .then(response => response.json())
                .then(data => {
                    this.localSearchResults = data;
                    this.isSearching = false;
                })
                .catch(error => {
                    console.error('Konum arama hatası:', error);
                    this.isSearching = false;
                });
        },
        
        selectLocationFromModal: function(result) {
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            this.map.setView([lat, lng], 15);
            
            if (this.marker) {
                this.marker.setLatLng([lat, lng]);
            } else {
                this.marker = L.marker([lat, lng]).addTo(this.map);
            }

            this.lat = lat;
            this.lng = lng;
            
            this.localSearchResults = [];
            this.searchQuery = '';

            this.$dispatch('close-modal', { id: 'location-search-modal' });
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
                    const button = L.DomUtil.create('a', 'location-button', container);
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    `;
                    button.title = this.config.myLocationButtonLabel;
                    button.href = '#';
                    button.role = 'button';
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.width = '30px';
                    button.style.height = '30px';
                    button.setAttribute('x-tooltip.raw', this.config.myLocationButtonLabel);

                    L.DomEvent.on(button, 'click', (e) => {
                        L.DomEvent.preventDefault(e);
                        this.goToCurrentLocation();
                    });

                    return container;
                }
            });

            this.map.addControl(new locationControl());
        },

        goToCurrentLocation: function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latLng = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        this.setCoordinates(latLng);
                        this.marker.setLatLng([latLng.lat, latLng.lng]);
                        this.map.setView([latLng.lat, latLng.lng], 15);
                        this.lat = latLng.lat;
                        this.lng = latLng.lng;
                    },
                    (error) => {
                        if (window.location.protocol !== 'https:') {
                            new FilamentNotification().title('Need\'s HTTPS').body('Secure connection (HTTPS) required to access location information').danger().send();
                            return;
                        }

                        new FilamentNotification().title('Error').body('Could not get location. Please check console errors').danger().send();
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                new FilamentNotification().title('No Browser Support').body('Your browser does not support location services').danger().send();
            }
        },

        markerMoved: function (event) {
            const position = event.latLng.toJSON();
            this.lat = position.lat;
            this.lng = position.lng;
            this.setCoordinates(position);
            this.marker.setLatLng([position.lat, position.lng]);
            this.map.panTo([position.lat, position.lng]);
        },

        updateMapFromAlpine: function () {
            const location = this.getCoordinates();
            const markerPosition = this.marker.getLatLng();

            if (
                !(
                    location.lat === markerPosition.lat &&
                    location.lng === markerPosition.lng
                )
            ) {
                this.updateMap(location);
            }
        },

        updateMap: function (position) {
            this.marker.setLatLng([position.lat, position.lng]);
            this.map.panTo([position.lat, position.lng]);
            this.lat = position.lat;
            this.lng = position.lng;
        },

        setCoordinates: function (position) {
            this.$wire.set(this.config.statePath, position);
        },

        getCoordinates: function () {
            let location = this.$wire.get(this.config.statePath);
            if (
                location === null ||
                !location.hasOwnProperty('lat') ||
                !location.hasOwnProperty('lng')
            ) {
                location = {
                    lat: this.config.defaultLocation.lat,
                    lng: this.config.defaultLocation.lng,
                };
            }

            return location;
        }
    }
}
