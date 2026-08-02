<?php

namespace Afsakar\LeafletMapPicker\Support;

use JsonException;

final class CoordinateNormalizer
{
    public static function normalize(mixed $value): ?array
    {
        if (is_string($value)) {
            try {
                $value = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                return null;
            }
        }

        if (! is_array($value)) {
            return null;
        }

        $lat = array_key_exists('lat', $value) ? $value['lat'] : ($value[0] ?? null);
        $lng = array_key_exists('lng', $value) ? $value['lng'] : ($value[1] ?? null);

        if (! is_numeric($lat) || ! is_numeric($lng)) {
            return null;
        }

        $lat = (float) $lat;
        $lng = (float) $lng;

        if (! is_finite($lat) || ! is_finite($lng) || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return null;
        }

        return ['lat' => $lat, 'lng' => $lng];
    }
}
