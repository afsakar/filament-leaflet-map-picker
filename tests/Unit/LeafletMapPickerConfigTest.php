<?php

use Afsakar\LeafletMapPicker\LeafletMapPicker;

class TestLeafletMapPicker extends LeafletMapPicker
{
    public function getId(): ?string
    {
        return $this->getCustomId() ?? $this->getName();
    }

    public function isDisabled(): bool
    {
        return false;
    }

    public function isReadOnly(): bool
    {
        return false;
    }
}

function makeTestField(string $name, string $id): LeafletMapPicker
{
    return TestLeafletMapPicker::make($name)->id($id);
}

it('builds config with modal and geolocation settings', function () {
    $config = json_decode(makeTestField('location', 'location-field')->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);

    expect($config)
        ->toMatchArray([
            'searchModalId' => 'location-field-location-search-modal',
            'geocoderEndpoint' => 'https://nominatim.openstreetmap.org/search',
            'geolocationHighAccuracy' => false,
            'geolocationTimeout' => 10000,
            'showTileControl' => true,
        ])
        ->not->toHaveKey('showTaleControl')
        ->not->toHaveKey('statePath');
});

it('builds unique modal ids per field id', function () {
    $first = json_decode(makeTestField('firstLocation', 'first-field')->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);
    $second = json_decode(makeTestField('secondLocation', 'second-field')->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);

    expect($first['searchModalId'])->toBe('first-field-location-search-modal');
    expect($second['searchModalId'])->toBe('second-field-location-search-modal');
    expect($first['searchModalId'])->not->toBe($second['searchModalId']);
});
