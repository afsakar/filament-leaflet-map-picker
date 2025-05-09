<?php

namespace Afsakar\LeafletMapPicker;

use Closure;
use Exception;
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

    protected array | Closure $customTiles = [];

    protected string | Closure $markerIconPath = '';

    protected string | Closure $markerShadowPath = '';

    protected bool $showTileControl = true;

    private int $precision = 8;

    protected ?array $customMarker = null;

    private array $mapConfig = [
        'draggable' => true,
        'clickable' => true,
        'defaultLocation' => [
            'lat' => 37.9106,
            'lng' => 40.2365,
        ],
        'statePath' => '',
        'defaultZoom' => 13,
        'myLocationButtonLabel' => '',
        'tileProvider' => 'openstreetmap',
        'customTiles' => [],
        'customMarker' => null,
        'markerIconPath' => '',
        'markerShadowPath' => '',
        'showTaleControl' => false,
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
        $position = $this->evaluate($this->defaultLocation);

        if (is_array($position)) {
            if (array_key_exists('lat', $position) && array_key_exists('lng', $position)) {
                return $position;
            } elseif (is_numeric($position[0]) && is_numeric($position[1])) {
                return [
                    'lat' => is_string($position[0]) ? round(floatval($position[0]), $this->precision) : $position[0],
                    'lng' => is_string($position[1]) ? round(floatval($position[1]), $this->precision) : $position[1],
                ];
            }
        }

        return [
            'lat' => 41.0082,
            'lng' => 28.9784,
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
                'statePath' => $this->getStatePath(),
                'defaultZoom' => $this->getDefaultZoom(),
                'myLocationButtonLabel' => $this->getMyLocationButtonLabel(),
                'tileProvider' => $this->getTileProvider(),
                'customTiles' => $this->getCustomTiles(),
                'customMarker' => $this->getCustomMarker(),
                'markerIconPath' => $this->getMarkerIconPath(),
                'markerShadowPath' => $this->getMarkerShadowPath(),
                'map_type_text' => __('filament-leaflet-map-picker::leaflet-map-picker.map_type'),
                'is_disabled' => $this->isDisabled() || $this->isReadOnly(),
                'showTileControl' => $this->showTileControl,
            ]),
            JSON_THROW_ON_ERROR
        );
    }

    /**
     * @throws JsonException
     */
    public function getState(): array
    {
        $state = parent::getState();

        if (is_array($state)) {
            return $state;
        } else {
            try {
                return @json_decode($state, true, 512, JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                return $this->getDefaultLocation();
            }
        }
    }
}
