import { coordinatesEqual, normalizeCoordinates, resolveCoordinates } from './coordinates.js';

export function createFieldState() {
    return {
        setCoordinates(position) {
            const normalized = normalizeCoordinates(position);

            if (!normalized) {
                return false;
            }

            this.lastValidCoordinates = normalized;
            this.lat = normalized.lat;
            this.lng = normalized.lng;
            this.location = normalized;
            this.updateMap(normalized, true);

            return true;
        },

        updateMapFromAlpine(value) {
            const normalized = normalizeCoordinates(value);

            if (!normalized || !this.map || !this.marker) {
                return;
            }

            if (coordinatesEqual(normalized, this.lastValidCoordinates)) {
                return;
            }

            this.lastValidCoordinates = normalized;
            this.updateMap(normalized, true);
        },

        getCoordinates() {
            return resolveCoordinates(
                this.location,
                this.lastValidCoordinates ?? this.getDefaultCoordinates(),
            );
        },

        getDefaultCoordinates() {
            return {
                lat: this.config.defaultLocation.lat,
                lng: this.config.defaultLocation.lng,
            };
        },
    };
}
