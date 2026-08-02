# FilamentPHP LeafletJS Map Picker

A Filament Forms component that provides an interactive Leaflet map for selecting and storing geographical coordinates.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/afsakar/filament-leaflet-map-picker.svg?style=flat-square)](https://packagist.org/packages/afsakar/filament-leaflet-map-picker)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/afsakar/filament-leaflet-map-picker/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/afsakar/filament-leaflet-map-picker/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/afsakar/filament-leaflet-map-picker/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/afsakar/filament-leaflet-map-picker/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/afsakar/filament-leaflet-map-picker.svg?style=flat-square)](https://packagist.org/packages/afsakar/filament-leaflet-map-picker)

![Banner](https://raw.githubusercontent.com/afsakar/filament-leaflet-map-picker/main/art/leaflet-js-banner.png "Banner")

## Features

- Interactive map for location selection
- Canonical `{ lat, lng }` state with legacy `[lat, lng]` and JSON string input support
- Adjustable zoom level and map height
- Draggable and clickable markers
- "My Location" button for quick navigation to the user's current position
- Search modal backed by an explicit-submit geocoder request
- OpenStreetMap and Esri tile presets plus custom HTTPS tile layers
- Custom marker configuration
- Read-only display mode and Infolist entry support

![Screenshot](https://raw.githubusercontent.com/afsakar/filament-leaflet-map-picker/main/art/sc-default.png "Default")

## Compatibility

| Package line | Filament | Laravel | PHP | Notes |
| --- | --- | --- | --- | --- |
| v3.0.0 target | 4.x | 12.x | 8.2+ | Supported in this line |
| v3.0.0 target | 4.x | 13.x | 8.3+ | Supported in this line |
| v3.0.0 target | 5.x | 12.x | 8.3+ | Host app must provide Livewire 4 and Tailwind CSS 4 |
| v3.0.0 target | 5.x | 13.x | 8.3+ | Host app must provide Livewire 4 and Tailwind CSS 4 |
| v2.x | 3.x | Existing v2 support matrix | See v2 docs | Filament 3 stays on the v2 line |

Filament 3 support is intentionally not part of the v3.0.0 package line. If you are staying on Filament 3, keep using the v2 releases.

## Installation

Install the PHP package in your Filament app:

```bash
composer require afsakar/filament-leaflet-map-picker
```

The package auto-discovers its service provider. Filament assets are registered with `FilamentAsset` and loaded on demand through the component views' `x-load`, `x-load-src`, and `x-load-css` attributes, so you do not need to copy the compiled JS/CSS into your app for normal usage.

If you want Leaflet's image assets published locally, you can still publish them:

```bash
php artisan vendor:publish --tag="filament-leaflet-map-picker-assets"
```

You can publish translations with:

```bash
php artisan vendor:publish --tag="filament-leaflet-map-picker-translations"
```

Optionally, you can publish the views with:

```bash
php artisan vendor:publish --tag="filament-leaflet-map-picker-views"
```

## Database and model setup

Store the coordinates in a `json` or `text` column:

```php
Schema::create('properties', function (Blueprint $table) {
    $table->id();
    $table->json('location')->nullable();
    $table->timestamps();
});
```

Cast the attribute to `array` in your model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'location',
    ];

    protected $casts = [
        'location' => 'array',
    ];
}
```

## Canonical state format and migration notes

The canonical saved state for v3 is:

```json
{ "lat": 41.0082, "lng": 28.9784 }
```

The package still reads these legacy inputs while you migrate existing data:

- legacy arrays like `[41.0082, 28.9784]`
- JSON strings like `"{\"lat\":41.0082,\"lng\":28.9784}"`

New writes should use the canonical object shape. If you already cast the column to `array`, Laravel will persist the object-shaped array cleanly in a `json` column.

## Usage

### Form

```php
use Afsakar\LeafletMapPicker\LeafletMapPicker;

LeafletMapPicker::make('location')
    ->label('Property Location')
    ->height('500px')
    ->defaultLocation(['lat' => 41.0082, 'lng' => 28.9784])
    ->defaultZoom(15)
    ->draggable()
    ->clickable()
    ->myLocationButtonLabel('Go to My Location')
    ->geocoderEndpoint('https://nominatim.openstreetmap.org/search')
    ->geolocationTimeout(10000)
    ->geolocationHighAccuracy()
    ->hideTileControl()
    ->readOnly()
    ->tileProvider('openstreetmap')
    ->customTiles([
        'mapbox' => [
            'url' => 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
            'options' => [
                'attribution' => '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
                'id' => 'mapbox/streets-v11',
                'maxZoom' => 19,
                'accessToken' => 'YOUR_MAPBOX_TOKEN',
            ],
        ],
    ])
    ->customMarker([
        'iconUrl' => asset('pin-2.png'),
        'iconSize' => [38, 38],
        'iconAnchor' => [19, 38],
        'popupAnchor' => [0, -38],
    ]);
```

The simplest canonical default location example is:

```php
LeafletMapPicker::make('location')
    ->defaultLocation(['lat' => 41.0082, 'lng' => 28.9784]);
```

### State synchronization behavior

- Clicking the map writes `{ lat, lng }` into the field state.
- Dragging the marker writes `{ lat, lng }` into the field state.
- Search result selection writes `{ lat, lng }` into the field state.
- Geolocation writes `{ lat, lng }` into the field state.
- If the Livewire/Alpine state is changed manually to a valid coordinate object, legacy array, or supported JSON string, the marker and map recenter to match it.

### Infolist

```php
use Afsakar\LeafletMapPicker\LeafletMapPickerEntry;

LeafletMapPickerEntry::make('location')
    ->label('Property Location')
    ->height('500px')
    ->defaultLocation(['lat' => 41.0082, 'lng' => 28.9784])
    ->tileProvider('openstreetmap')
    ->hideTileControl()
    ->customTiles([
        'mapbox' => [
            'url' => 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
            'options' => [
                'attribution' => '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
                'id' => 'mapbox/streets-v11',
                'maxZoom' => 19,
                'accessToken' => 'YOUR_MAPBOX_TOKEN',
            ],
        ],
    ])
    ->customMarker([
        'iconUrl' => asset('pin-2.png'),
        'iconSize' => [38, 38],
        'iconAnchor' => [19, 38],
        'popupAnchor' => [0, -38],
    ]);
```

## Search, tile, and geolocation policy

- Built-in tile presets are limited to `openstreetmap` and `esri`.
- OpenStreetMap tile usage must stay on HTTPS and keep the provider's attribution visible.
- The default browser geocoder endpoint is `https://nominatim.openstreetmap.org/search`.
- Public Nominatim usage here is explicit-submit only. The package does not support autocomplete against the public endpoint.
- Keep public Nominatim traffic to roughly 1 request per second.
- Your application is responsible for any required `Referer`, `User-Agent`, API key, custom tile contract, attribution, or provider-specific compliance.
- The browser-side package does not spoof a `User-Agent`, and browser control over `Referer` is limited by the host app and browser policy.
- If you need higher traffic, backend credentials, bulk/offline tiles, or policy-controlled geocoding, use your own backend proxy or a commercial/provider-managed geocoder instead of the public endpoint.
- Offline/bulk tile distribution is outside this package; if you need it, bring your own compliant tile infrastructure.

## Development checks

Run the package checks from the repository root:

```bash
composer install
npm install
npm run build
composer validate --no-check-publish
composer lint
composer phpstan
composer test
npm run test:js
```

## Screenshots

Default:
![Screenshot](https://raw.githubusercontent.com/afsakar/filament-leaflet-map-picker/main/art/sc-default.png "Default")

Custom Marker:
![Screenshot](https://raw.githubusercontent.com/afsakar/filament-leaflet-map-picker/main/art/sc-custom-marker.png "Custom Marker")

Custom Tile:
![Screenshot](https://raw.githubusercontent.com/afsakar/filament-leaflet-map-picker/main/art/sc-custom-tile.png "Custom Tile")

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Azad Furkan ŞAKAR](https://github.com/afsakar)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
