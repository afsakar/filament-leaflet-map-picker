<?php

namespace Afsakar\LeafletMapPicker;

use Closure;
use Filament\Infolists\Components\Entry as Component;
use Filament\Support\Concerns\HasExtraAlpineAttributes;

class LeafletMapPickerEntry extends Component
{
    use HasExtraAlpineAttributes;

    protected string $view = 'filament-leaflet-map-picker::leaflet-map-entry';

    protected string | Closure $height = '400px';

    protected int $defaultZoom = 13;

    protected array $defaultLocation = [
        'lat' => 41.0082,
        'lng' => 28.9784,
    ];

    protected string $tileProvider = 'openstreetmap';

    protected bool $showTileControl = true;

    protected ?array $customMarker = null;

    protected array $customTiles = [];

    protected string | Closure $markerIconPath = '';

    protected string | Closure $markerShadowPath = '';

    public function defaultZoom(int $defaultZoom): static
    {
        $this->defaultZoom = $defaultZoom;

        return $this;
    }

    public function defaultLocation(array $defaultLocation): static
    {
        $this->defaultLocation = $defaultLocation;

        return $this;
    }

    public function tileProvider(string $tileProvider): static
    {
        $this->tileProvider = $tileProvider;

        return $this;
    }

    public function hideTileControl(): static
    {
        $this->showTileControl = false;

        return $this;
    }

    public function customMarker(?array $customMarker): static
    {
        $this->customMarker = $customMarker;

        return $this;
    }

    public function customTiles(array $customTiles): static
    {
        $this->customTiles = $customTiles;

        return $this;
    }

    public function getDefaultZoom(): int
    {
        return $this->defaultZoom;
    }

    public function getDefaultLocation(): array
    {
        return $this->defaultLocation;
    }

    public function getTileProvider(): string
    {
        return $this->tileProvider;
    }

    public function getShowTileControl(): bool
    {
        return $this->showTileControl;
    }

    public function getCustomMarker(): ?array
    {
        return $this->customMarker;
    }

    public function getCustomTiles(): array
    {
        return $this->customTiles;
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

    public function height(string | Closure $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function getHeight(): string
    {
        return $this->evaluate($this->height);
    }
}
