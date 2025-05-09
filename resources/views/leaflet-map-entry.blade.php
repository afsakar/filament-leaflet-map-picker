@php
    $id = $getId();
    $statePath = $getStatePath();
@endphp

<x-dynamic-component
    :component="$getEntryWrapperView()"
    :entry="$entry"
>
    <div
        wire:ignore
        ax-load
        x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('leaflet-map-picker', 'afsakar/filament-leaflet-map-picker'))]"
        ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('leaflet-map-picker-entry', 'afsakar/filament-leaflet-map-picker') }}"
        x-data="leafletMapEntry({
            location: {{ json_encode($getState()) }},
            config: {
                defaultZoom: {{ $getDefaultZoom() }},
                defaultLocation: {{ json_encode($getDefaultLocation()) }},
                tileProvider: '{{ $getTileProvider() }}',
                showTileControl: {{ $getShowTileControl() ? 'true' : 'false' }},
                customMarker: {{ $getCustomMarker() ? json_encode($getCustomMarker()) : 'null' }},
                customTiles: {{ json_encode($getCustomTiles()) }},
                markerIconPath: '{{ $getMarkerIconPath() }}',
                markerShadowPath: '{{ $getMarkerShadowPath() }}'
            }
        })"
        x-ignore
    >
        <div class="relative w-full mx-auto rounded-lg overflow-hidden shadow bg-gray-50 dark:bg-gray-700">
            <div
                x-ref="mapContainer"
                class="leaflet-map-picker w-full relative"
                style="height: {{ $getHeight() }}; z-index: 1;"
            ></div>

            <div class="p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600" x-show="location !== null">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-2 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="text-sm text-gray-700 dark:text-gray-200">
                        {{ __('filament-leaflet-map-picker::leaflet-map-picker.selected_locations') }}
                        <span class="font-medium" x-text="location ? location.lat.toFixed(6) : ''"></span>,
                        <span class="font-medium" x-text="location ? location.lng.toFixed(6) : ''"></span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</x-dynamic-component>
