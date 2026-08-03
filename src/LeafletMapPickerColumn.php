<?php

namespace Afsakar\LeafletMapPicker;

use Afsakar\LeafletMapPicker\Support\CoordinateNormalizer;
use Closure;
use Filament\Tables\Columns\Column;
use JsonException;

class LeafletMapPickerColumn extends Column
{
    protected string $view = 'filament-leaflet-map-picker::leaflet-map-picker-column';

    protected string | Closure $height = '50px';

    public function height(string | Closure $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function getHeight(): string
    {
        return $this->evaluate($this->height);
    }

    public function getNormalizedState(): ?array
    {
        return CoordinateNormalizer::normalize($this->getState());
    }

    public function getMapKey(): string
    {
        $recordIdentity = $this->getRecordKey() ?? $this->getName();
        $stateHash = sha1(json_encode($this->getNormalizedState(), JSON_THROW_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION));

        return 'leaflet-map-picker-column-' . rawurlencode($recordIdentity) . '-' . $stateHash;
    }

    public function getMapAriaLabel(): string
    {
        $state = $this->getNormalizedState();

        if ($state === null) {
            return __('filament-leaflet-map-picker::leaflet-map-picker.column_no_selected_location');
        }

        return __('filament-leaflet-map-picker::leaflet-map-picker.column_selected_location', $state);
    }

    /**
     * @throws JsonException
     */
    public function getMapConfig(): string
    {
        return json_encode([
            'defaultZoom' => 13,
            'defaultLocation' => [
                'lat' => 37.9106,
                'lng' => 40.2365,
            ],
            'tileProvider' => 'openstreetmap',
            'showTileControl' => false,
            'interactive' => false,
            // Thumbnails are too small for a pin and the attribution control covers
            // most of the tile, so the column renders a bare dot instead.
            'markerStyle' => 'dot',
            'showAttribution' => false,
            'customMarker' => null,
            'customTiles' => [],
            'markerIconPath' => asset('vendor/leaflet-map-picker/images/marker-icon-2x.png'),
            'markerShadowPath' => asset('vendor/leaflet-map-picker/images/marker-shadow.png'),
            'map_type_text' => __('filament-leaflet-map-picker::leaflet-map-picker.map_type'),
        ], JSON_THROW_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION);
    }
}
