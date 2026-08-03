function parseValue(value) {
    if (typeof value === 'string') {
        if (value.trim() === '') {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    return value;
}

function toNumber(value) {
    if (typeof value === 'string') {
        value = value.trim();

        if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
            return null;
        }
    } else if (typeof value !== 'number') {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}

export function normalizeCoordinates(value) {
    const parsed = parseValue(value);

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    const latValue = Object.hasOwn(parsed, 'lat') ? parsed.lat : parsed[0];
    const lngValue = Object.hasOwn(parsed, 'lng') ? parsed.lng : parsed[1];
    const lat = toNumber(latValue);
    const lng = toNumber(lngValue);

    if (lat === null || lng === null) {
        return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }

    return { lat, lng };
}

export function coordinatesEqual(left, right) {
    const normalizedLeft = normalizeCoordinates(left);
    const normalizedRight = normalizeCoordinates(right);

    return Boolean(
        normalizedLeft &&
        normalizedRight &&
        normalizedLeft.lat === normalizedRight.lat &&
        normalizedLeft.lng === normalizedRight.lng
    );
}

export function resolveCoordinates(state, fallback) {
    return normalizeCoordinates(state) ?? normalizeCoordinates(fallback);
}
