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
    >
        <div class="relative w-full mx-auto rounded-lg overflow-hidden shadow bg-gray-50 dark:bg-gray-700">
            <div
                x-ref="mapContainer"
                class="leaflet-map-picker w-full relative"
                style="height: {{ $getHeight() }}; z-index: 1;"
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

        <x-filament::modal
            slide-over
            id="location-search-modal"
            width="md"
            x-on:open-modal.window="if ($event.detail.id === 'location-search-modal') searchQuery = ''; localSearchResults = []"
        >
            <x-slot name="heading">
                {{ __('filament-leaflet-map-picker::leaflet-map-picker.search_location') }}
            </x-slot>

            <div class="space-y-4">
                <div class="relative">
                    <x-filament::input.wrapper  suffix-icon="heroicon-m-magnifying-glass">
                        <x-filament::input
                            type="text"
                            x-model="searchQuery"
                            x-on:input="debounceSearch()"
                            placeholder="{{ __('filament-leaflet-map-picker::leaflet-map-picker.search_placeholder') }}"
                        />
                    </x-filament::input.wrapper>
                </div>

                <!-- Loading indicator -->
                <div x-show="isSearching" class="flex justify-center py-4">
                    <x-filament::loading-indicator class="h-5 w-5" />
                </div>

                <!-- Search results -->
                <div
                    x-show="localSearchResults.length > 0 && !isSearching"
                    x-cloak
                    class="bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                    <ul class="overflow-auto">
                        <template x-for="(result, index) in localSearchResults" :key="index">
                            <li class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                <button
                                    type="button"
                                    @click="selectLocationFromModal(result); $dispatch('close-modal', { id: 'location-search-modal' })"
                                    class="w-full text-left px-4 py-3 flex items-start gap-3"
                                >
                                    <div class="flex-shrink-0 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-800 dark:text-gray-200" x-text="result.display_name || result.name"></p>
                                    </div>
                                </button>
                            </li>
                        </template>
                    </ul>
                </div>

                <!-- No results message -->
                <div
                    x-show="searchQuery && searchQuery.length > 2 && localSearchResults.length === 0 && !isSearching"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {{ __('filament-leaflet-map-picker::leaflet-map-picker.no_results') }}
                    </p>
                </div>
            </div>

            <x-slot name="footer">
                <x-filament::button color="gray" @click="$dispatch('close-modal', { id: 'location-search-modal' })">
                    {{ __('filament-leaflet-map-picker::leaflet-map-picker.cancel') }}
                </x-filament::button>
            </x-slot>
        </x-filament::modal>
    </div>
</x-dynamic-component>
