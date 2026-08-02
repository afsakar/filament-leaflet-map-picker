<?php

namespace Afsakar\LeafletMapPicker;

use Afsakar\LeafletMapPicker\Support\CoordinateNormalizer;
use Closure;
use Filament\Forms\Components\Concerns\CanBeReadOnly;
use Filament\Forms\Components\Field;
use JsonException;

class LeafletMapPicker extends Field
{
    use CanBeReadOnly;

    protected string $view = 'filament-leaflet-map-picker::leaflet-map-picker';

    protected string | Closure $height = '400px';

    protected array | Closure | null $defaultLocation = [37.9106, 40.2365];

    protected int | Closure $defaultZoom = 13;

    protected bool | Closure $draggable = true;

    protected bool | Closure $clickable = true;

    protected string | Closure | null $myLocationButtonLabel = 'My Location';

    protected string | Closure $tileProvider = 'openstreetmap';

    protected string | Closure $geocoderEndpoint = 'https://nominatim.openstreetmap.org/search';

    protected int | Closure $geolocationTimeout = 10000;

    protected bool | Closure $geolocationHighAccuracy = false;

    protected array | Closure $customTiles = [];

    protected string | Closure $markerIconPath = '';

    protected string | Closure $markerShadowPath = '';

    protected bool $showTileControl = true;

    protected ?array $customMarker = null;

    private array $mapConfig = [
        'draggable' => true,
        'clickable' => true,
        'defaultLocation' => [
            'lat' => 37.9106,
            'lng' => 40.2365,
        ],
        'defaultZoom' => 13,
        'myLocationButtonLabel' => '',
        'searchButtonLabel' => '',
        'searchModalId' => '',
        'geocoderEndpoint' => 'https://nominatim.openstreetmap.org/search',
        'geolocationHighAccuracy' => false,
        'geolocationTimeout' => 10000,
        'tileProvider' => 'openstreetmap',
        'customTiles' => [],
        'customMarker' => null,
        'messages' => [],
        'markerIconPath' => '',
        'markerShadowPath' => '',
        'showTileControl' => false,
    ];

    public function hideTileControl(): static
    {
        $this->showTileControl = false;

        return $this;
    }

    public function getTileControlVisibility(): bool
    {
        return $this->evaluate($this->showTileControl);
    }

    public function customMarker(array $config): static
    {
        $this->customMarker = $config;

        return $this;
    }

    public function getCustomMarker(): ?array
    {
        return $this->customMarker;
    }

    public function defaultLocation(array | Closure $defaultLocation): static
    {
        $this->defaultLocation = $defaultLocation;

        return $this;
    }

    public function getDefaultLocation(): array
    {
        return CoordinateNormalizer::normalize($this->evaluate($this->defaultLocation)) ?? [
            'lat' => 37.9106,
            'lng' => 40.2365,
        ];
    }

    public function defaultZoom(int | Closure $defaultZoom): static
    {
        $this->defaultZoom = $defaultZoom;

        return $this;
    }

    public function getDefaultZoom(): int
    {
        return $this->evaluate($this->defaultZoom);
    }

    public function draggable(bool | Closure $draggable = true): static
    {
        $this->draggable = $draggable;

        return $this;
    }

    public function getDraggable(): bool
    {
        if ($this->isDisabled || $this->isReadOnly) {
            return false;
        }

        return $this->evaluate($this->draggable);
    }

    public function clickable(bool | Closure $clickable = true): static
    {
        $this->clickable = $clickable;

        return $this;
    }

    public function getClickable(): bool
    {
        if ($this->isDisabled || $this->isReadOnly) {
            return false;
        }

        return $this->evaluate($this->clickable);
    }

    public function height(string | Closure $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function getHeight(): string
    {
        return $this->evaluate($this->height);
    }

    public function myLocationButtonLabel(string | Closure $myLocationButtonLabel): static
    {
        $this->myLocationButtonLabel = $myLocationButtonLabel;

        return $this;
    }

    public function getMyLocationButtonLabel(): string
    {
        return $this->evaluate($this->myLocationButtonLabel);
    }

    public function tileProvider(string | Closure $tileProvider): static
    {
        $this->tileProvider = $tileProvider;

        return $this;
    }

    public function getTileProvider(): string
    {
        return $this->evaluate($this->tileProvider);
    }

    public function geocoderEndpoint(string | Closure $geocoderEndpoint): static
    {
        $this->geocoderEndpoint = $geocoderEndpoint;

        return $this;
    }

    public function getGeocoderEndpoint(): string
    {
        return $this->evaluate($this->geocoderEndpoint);
    }

    public function geolocationTimeout(int | Closure $geolocationTimeout): static
    {
        $this->geolocationTimeout = $geolocationTimeout;

        return $this;
    }

    public function getGeolocationTimeout(): int
    {
        return $this->evaluate($this->geolocationTimeout);
    }

    public function geolocationHighAccuracy(bool | Closure $geolocationHighAccuracy = true): static
    {
        $this->geolocationHighAccuracy = $geolocationHighAccuracy;

        return $this;
    }

    public function getGeolocationHighAccuracy(): bool
    {
        return $this->evaluate($this->geolocationHighAccuracy);
    }

    public function customTiles(array | Closure $customTiles): static
    {
        $this->customTiles = $customTiles;

        return $this;
    }

    public function getCustomTiles(): array
    {
        return $this->evaluate($this->customTiles);
    }

    public function markerIconPath(string | Closure $path): static
    {
        $this->markerIconPath = $path;

        return $this;
    }

    public function getMarkerIconPath(): string
    {
        return $this->evaluate($this->markerIconPath) ?: asset('vendor/leaflet-map-picker/images/marker-icon-2x.png');
    }

    public function markerShadowPath(string | Closure $path): static
    {
        $this->markerShadowPath = $path;

        return $this;
    }

    public function getMarkerShadowPath(): string
    {
        return $this->evaluate($this->markerShadowPath) ?: asset('vendor/leaflet-map-picker/images/marker-shadow.png');
    }

    /**
     * @throws JsonException
     */
    public function getMapConfig(): string
    {
        return json_encode(
            array_merge($this->mapConfig, [
                'draggable' => $this->getDraggable(),
                'clickable' => $this->getClickable(),
                'defaultLocation' => $this->getDefaultLocation(),
                'defaultZoom' => $this->getDefaultZoom(),
                'myLocationButtonLabel' => $this->getMyLocationButtonLabel(),
                'searchButtonLabel' => __('filament-leaflet-map-picker::leaflet-map-picker.search_location'),
                'searchModalId' => "{$this->getId()}-location-search-modal",
                'geocoderEndpoint' => $this->getGeocoderEndpoint(),
                'geolocationHighAccuracy' => $this->getGeolocationHighAccuracy(),
                'geolocationTimeout' => $this->getGeolocationTimeout(),
                'tileProvider' => $this->getTileProvider(),
                'customTiles' => $this->getCustomTiles(),
                'customMarker' => $this->getCustomMarker(),
                'messages' => [
                    'search_failed' => __('filament-leaflet-map-picker::leaflet-map-picker.search_failed'),
                    'rate_limit_wait' => __('filament-leaflet-map-picker::leaflet-map-picker.rate_limit_wait'),
                    'secure_context_required' => __('filament-leaflet-map-picker::leaflet-map-picker.secure_context_required'),
                    'browser_location_not_supported' => __('filament-leaflet-map-picker::leaflet-map-picker.browser_location_not_supported'),
                    'location_permission_denied' => __('filament-leaflet-map-picker::leaflet-map-picker.location_permission_denied'),
                    'location_unavailable' => __('filament-leaflet-map-picker::leaflet-map-picker.location_unavailable'),
                    'location_timeout' => __('filament-leaflet-map-picker::leaflet-map-picker.location_timeout'),
                ],
                'markerIconPath' => $this->getMarkerIconPath(),
                'markerShadowPath' => $this->getMarkerShadowPath(),
                'map_type_text' => __('filament-leaflet-map-picker::leaflet-map-picker.map_type'),
                'is_disabled' => $this->isDisabled() || $this->isReadOnly(),
                'showTileControl' => $this->showTileControl,
            ]),
            JSON_THROW_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION
        );
    }

    /**
     * @throws JsonException
     */
    public function getState(): ?array
    {
        return CoordinateNormalizer::normalize(parent::getState());
    }
}
