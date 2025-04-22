<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        wire:ignore
        ax-load
        x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('leaflet-map-picker', 'afsakar/filament-leaflet-map-picker'))]"
        ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('leaflet-map-picker', 'afsakar/filament-leaflet-map-picker') }}"
        x-data="leafletMapPicker({
            location: $wire.$entangle('{{ $getStatePath() }}'),
            config: {{ $getMapConfig() }},
            @if($getCustomMarker())
                customMarker: {{ json_encode($getCustomMarker()) }},
            @endif
        })"
        x-ignore
        class="relative w-full mx-auto rounded-lg overflow-hidden shadow z-10"
    >

        <div
            x-ref="mapContainer"
            class="leaflet-map-picker w-full relative"
            style="height: {{ $getHeight() }}"
        ></div>

        <div class="p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600" x-show="lat !== null && lng !== null">
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-2 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                    {{ __('filament-leaflet-map-picker::leaflet-map-picker.selected_locations') }}
                    <span class="font-medium" x-text="lat ? lat.toFixed(6) : ''"></span>,
                    <span class="font-medium" x-text="lng ? lng.toFixed(6) : ''"></span>
                </p>
            </div>
        </div>
    </div>
</x-dynamic-component>
