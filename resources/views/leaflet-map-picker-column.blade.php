<div
    wire:ignore
    x-load
    x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('leaflet-map-picker', 'afsakar/filament-leaflet-map-picker'))]"
    x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('leaflet-map-picker-entry', 'afsakar/filament-leaflet-map-picker') }}"
    x-data="leafletMapPickerEntry({ location: {{ json_encode($getNormalizedState()) }}, config: {{ $getMapConfig() }} })"
    x-ignore
>
    <div x-ref="mapContainer" class="leaflet-map-picker w-full relative" style="height: {{ $getHeight() }}; z-index: 1;"></div>
</div>
