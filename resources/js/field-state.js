import { coordinatesEqual, normalizeCoordinates, resolveCoordinates } from './coordinates.js';

export function createFieldState() {
    return {
        setCoordinates(position) {
            const normalized = normalizeCoordinates(position);

            if (!normalized) {
                return false;
            }

            if (this.destroyed) {
                return false;
            }

            const updated = this.updateMap(normalized, true);

            if (updated === false) {
                return false;
            }

            this.lastValidCoordinates = normalized;
            this.location = normalized;

            return true;
        },

        updateMapFromAlpine(value) {
            const normalized = normalizeCoordinates(value);

            if (this.destroyed || !normalized || !this.map || !this.marker) {
                return;
            }

            if (coordinatesEqual(normalized, this.lastValidCoordinates)) {
                return;
            }

            const updated = this.updateMap(normalized, true);

            if (updated === false) {
                return;
            }

            this.lastValidCoordinates = normalized;
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
