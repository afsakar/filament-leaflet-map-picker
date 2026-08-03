<div
    wire:ignore
    wire:key="{{ $getMapKey() }}"
    x-load
    x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('leaflet-map-picker', 'afsakar/filament-leaflet-map-picker'))]"
    x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('leaflet-map-picker-entry', 'afsakar/filament-leaflet-map-picker') }}"
    x-data="leafletMapPickerEntry({ location: {{ json_encode($getNormalizedState()) }}, config: {{ $getMapConfig() }} })"
    x-ignore
    class="p-4"
>
    <div
        x-ref="mapContainer"
        class="leaflet-map-picker relative rounded"
        style="height: {{ $getHeight() }}; z-index: 1; width: 6rem;"
        role="img"
        aria-label="{{ $getMapAriaLabel() }}"
    ></div>
</div>
