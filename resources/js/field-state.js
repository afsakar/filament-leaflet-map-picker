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
            this.syncCoordinateInputs(normalized);

            return true;
        },

        syncCoordinateInputs(position) {
            const normalized = normalizeCoordinates(position);

            if (!normalized) {
                return false;
            }

            this.coordinateInputs = {
                lat: String(normalized.lat),
                lng: String(normalized.lng),
            };

            return true;
        },

        syncCoordinatesFromInputs() {
            const normalized = normalizeCoordinates(this.coordinateInputs);

            if (!normalized) {
                return false;
            }

            return this.setCoordinates(normalized);
        },

        updateMapFromAlpine(value) {
            const normalized = normalizeCoordinates(value);

            if (this.destroyed || !normalized || !this.map || !this.marker) {
                return;
            }

            if (coordinatesEqual(normalized, this.lastValidCoordinates)) {
                this.syncCoordinateInputs(normalized);

                return;
            }

            const updated = this.updateMap(normalized, true);

            if (updated === false) {
                return;
            }

            this.lastValidCoordinates = normalized;
            this.syncCoordinateInputs(normalized);
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
