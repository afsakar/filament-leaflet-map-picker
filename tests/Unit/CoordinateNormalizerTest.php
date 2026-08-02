<?php

use Afsakar\LeafletMapPicker\Support\CoordinateNormalizer;

it('normalizes canonical coordinates', function () {
    expect(CoordinateNormalizer::normalize(['lat' => '41.0082', 'lng' => '28.9784']))
        ->toBe(['lat' => 41.0082, 'lng' => 28.9784]);
});

it('accepts legacy array and json values', function () {
    expect(CoordinateNormalizer::normalize([41.0082, 28.9784]))
        ->toBe(['lat' => 41.0082, 'lng' => 28.9784])
        ->and(CoordinateNormalizer::normalize('{"lat":41.0082,"lng":28.9784}'))
        ->toBe(['lat' => 41.0082, 'lng' => 28.9784]);
});

it('accepts zero and rejects invalid ranges', function () {
    expect(CoordinateNormalizer::normalize(['lat' => 0, 'lng' => 0]))
        ->toBe(['lat' => 0.0, 'lng' => 0.0])
        ->and(CoordinateNormalizer::normalize(['lat' => 91, 'lng' => 0]))
        ->toBeNull()
        ->and(CoordinateNormalizer::normalize(['lat' => 0, 'lng' => 181]))
        ->toBeNull();
});

it('rejects malformed, non-finite and incomplete values', function () {
    foreach ([null, '', '{}', ['lat' => ''], ['lat' => INF, 'lng' => 0]] as $value) {
        expect(CoordinateNormalizer::normalize($value))->toBeNull();
    }
});
