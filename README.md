# LeafletMapPicker Component

A Filament Forms component that provides an interactive Leaflet map for selecting and storing geographical coordinates.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/afsakar/filament-leaflet-map-picker.svg?style=flat-square)](https://packagist.org/packages/afsakar/filament-leaflet-map-picker)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/afsakar/filament-leaflet-map-picker/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/afsakar/filament-leaflet-map-picker/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/afsakar/filament-leaflet-map-picker/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/afsakar/filament-leaflet-map-picker/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/afsakar/filament-leaflet-map-picker.svg?style=flat-square)](https://packagist.org/packages/afsakar/filament-leaflet-map-picker)


## Features

- Interactive map for location selection
- Customizable map height
- Default location configuration
- Adjustable zoom level
- Draggable and clickable markers
- "My Location" button for quick navigation to user's current position
- Support for different tile providers (OpenStreetMap by default)
- Custom tile layer support
- Custom marker configuration

## Installation

You can install the package via composer:

```bash
composer require afsakar/filament-leaflet-map-picker

php artisan vendor:publish --tag="filament-leaflet-map-picker-assets"
```

You can publish the lang files with:

```bash
php artisan vendor:publish --tag="filament-leaflet-map-picker-translations"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="filament-leaflet-map-picker-views"
```

## Usage

```php
use use Afsakar\LeafletMapPicker\LeafletMapPicker;

// Basic usage
LeafletMapPicker::make('location')
    ->label('Select Location')

// Advanced usage with customization
LeafletMapPicker::make('location')
    ->label('Property Location')
    ->height('500px')
    ->defaultLocation([41.0082, 28.9784]) // Istanbul coordinates
    ->defaultZoom(15)
    ->draggable() // default true
    ->clickable() // default true
    ->myLocationButtonLabel('Go to My Location')
    ->tileProvider('openstreetmap')
    ->customTiles([
        'mapbox' => [
            'url' => 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
            'options' => [
                'attribution' => '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
                'id' => 'mapbox/streets-v11',
                'maxZoom' => 19,
                'accessToken' => 'YOUR_MAPBOX_TOKEN',
            ]
        ]
    ])
    ->customMarker([
        'iconUrl' => asset('pin-2.png'),
        'iconSize' => [38, 38],
        'iconAnchor' => [19, 38],
        'popupAnchor' => [0, -38]
    ])
```

## Testing

```bash
composer test
```

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
