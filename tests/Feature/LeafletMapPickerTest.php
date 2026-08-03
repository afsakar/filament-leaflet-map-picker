<?php

use Afsakar\LeafletMapPicker\LeafletMapPicker;
use Afsakar\LeafletMapPicker\LeafletMapPickerColumn;
use Afsakar\LeafletMapPicker\LeafletMapPickerEntry;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Illuminate\Support\ViewErrorBag;
use Livewire\Component as Livewire;

function mountTestField(LeafletMapPicker $field, mixed $state = null): array
{
    $host = new class extends Livewire implements HasForms
    {
        use InteractsWithForms;

        public array $data = [];

        public function render(): string
        {
            return '<div></div>';
        }
    };

    $schema = Schema::make($host)
        ->statePath('data')
        ->components([$field]);

    $schema->getComponents();
    $schema->fill([$field->getName() => $state]);

    return [$field, $schema, $host];
}

function mountTestEntry(LeafletMapPickerEntry $entry): array
{
    $host = new class extends Livewire implements HasForms
    {
        use InteractsWithForms;

        public array $data = [];

        public function render(): string
        {
            return '<div></div>';
        }
    };

    $schema = Schema::make($host)
        ->statePath('data')
        ->components([$entry]);

    $schema->getComponents();

    return [$entry, $schema, $host];
}

it('returns canonical map config without mutating null state', function () {
    [$field] = mountTestField(
        LeafletMapPicker::make('coordinates')
            ->defaultLocation(['lat' => 0, 'lng' => 0]),
        null,
    );

    $config = json_decode($field->id('coordinates-field')->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);

    expect($field->getState())->toBeNull()
        ->and($config['defaultLocation'])->toBe(['lat' => 0.0, 'lng' => 0.0])
        ->and($config['showTileControl'])->toBeTrue()
        ->and($config)->not->toHaveKey('showTaleControl');
});

it('disables interaction when field is disabled or read only', function () {
    expect(LeafletMapPicker::make('coordinates')->disabled()->getDraggable())->toBeFalse()
        ->and(LeafletMapPicker::make('coordinates')->readOnly()->getClickable())->toBeFalse();
});

it('uses the same canonical default for entry', function () {
    expect(LeafletMapPickerEntry::make('coordinates')->getDefaultLocation())
        ->toBe(['lat' => 37.9106, 'lng' => 40.2365]);
});

it('uses unique modal ids for each field id', function () {
    [$firstField] = mountTestField(LeafletMapPicker::make('first')->id('first-field'));
    [$secondField] = mountTestField(LeafletMapPicker::make('second')->id('second-field'));

    $first = json_decode($firstField->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);
    $second = json_decode($secondField->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);

    expect($first['searchModalId'])->toBe('first-field-location-search-modal')
        ->and($second['searchModalId'])->toBe('second-field-location-search-modal')
        ->and($first['searchModalId'])->not->toBe($second['searchModalId']);
});

it('normalizes field state inputs without throwing or defaulting invalid values', function (mixed $state, ?array $expected) {
    [$field] = mountTestField(LeafletMapPicker::make('coordinates'), $state);

    expect(fn () => $field->getState())->not->toThrow(Throwable::class)
        ->and($field->getState())->toBe($expected)
        ->and(json_decode($field->id('coordinates-field')->getMapConfig(), true, 512, JSON_THROW_ON_ERROR)['defaultLocation'])
        ->toBe(['lat' => 37.9106, 'lng' => 40.2365]);
})->with([
    'canonical array' => [['lat' => '40.1', 'lng' => '29.2'], ['lat' => 40.1, 'lng' => 29.2]],
    'legacy array' => [[40.1, 29.2], ['lat' => 40.1, 'lng' => 29.2]],
    'json string' => ['{"lat":"40.1","lng":"29.2"}', ['lat' => 40.1, 'lng' => 29.2]],
    'invalid string' => ['nope', null],
    'null' => [null, null],
]);

it('dehydrates field state to canonical coordinates', function (mixed $state, ?array $expected) {
    [, $schema] = mountTestField(LeafletMapPicker::make('coordinates'), $state);

    expect($schema->getState())->toBe(['coordinates' => $expected]);
})->with([
    'canonical array' => [['lat' => '40.1', 'lng' => '29.2'], ['lat' => 40.1, 'lng' => 29.2]],
    'legacy array' => [[40.1, 29.2], ['lat' => 40.1, 'lng' => 29.2]],
    'json string' => ['{"lat":"40.1","lng":"29.2"}', ['lat' => 40.1, 'lng' => 29.2]],
    'invalid string' => ['nope', null],
]);

it('renders null and invalid entry states without presenting the visual fallback as selected', function (mixed $state) {
    view()->share('errors', new ViewErrorBag);

    [$entry] = mountTestEntry(LeafletMapPickerEntry::make('coordinates')->state($state));
    $html = $entry->toHtml();

    expect($html)
        ->toMatch('/location:\s*null/')
        ->toContain('x-show="selectedCoordinates')
        ->toContain('x-text="selectedCoordinates');
})->with([
    'null' => null,
    'invalid' => 'nope',
]);

it('renders field and entry wiring with canonical coordinates', function () {
    view()->share('errors', new ViewErrorBag);

    [$field] = mountTestField(
        LeafletMapPicker::make('coordinates')
            ->id('coordinates-field')
            ->defaultLocation(['lat' => 0, 'lng' => 0]),
    );
    [$entry] = mountTestEntry(
        LeafletMapPickerEntry::make('coordinates')
            ->state([0, 0]),
    );

    $fieldHtml = $field->toHtml();
    $entryHtml = $entry->toHtml();

    expect($fieldHtml)
        ->toContain('coordinates-field-location-search-modal')
        ->toContain('&quot;defaultLocation&quot;:{&quot;lat&quot;:0.0,&quot;lng&quot;:0.0}')
        ->toContain('config.searchModalId');

    expect($entryHtml)
        ->toMatch('/location:\s*\{(?:&quot;|")lat(?:&quot;|"):\s*0(?:\.0)?\s*,\s*(?:&quot;|")lng(?:&quot;|"):\s*0(?:\.0)?\}/')
        ->toContain('defaultLocation: {&quot;lat&quot;:37.9106,&quot;lng&quot;:40.2365}')
        ->toContain('map_type_text: \'Map Type\'')
        ->toContain('x-show="selectedCoordinates && selectedCoordinates.lat !== null && selectedCoordinates.lng !== null"')
        ->toContain('selectedCoordinates.lat !== null ? selectedCoordinates.lat.toFixed(6)');
});

it('supports optional coordinate inputs inside the picker', function () {
    view()->share('errors', new ViewErrorBag);

    [$field] = mountTestField(
        LeafletMapPicker::make('location')
            ->showCoordinateInputs(),
    );

    expect($field->getShowCoordinateInputs())->toBeTrue()
        ->and(LeafletMapPicker::make('location')->getShowCoordinateInputs())->toBeFalse()
        ->and($field->toHtml())
        ->toContain('x-model="coordinateInputs.lat"')
        ->toContain('x-model="coordinateInputs.lng"')
        ->not->toContain(__('filament-leaflet-map-picker::leaflet-map-picker.selected_locations'));
});

it('defers Alpine until the async component is loaded', function () {
    view()->share('errors', new ViewErrorBag);

    [$field] = mountTestField(LeafletMapPicker::make('location'));

    // x-load removes x-ignore and re-inits the tree once the component is registered,
    // so the pair must stay together: without it Alpine evaluates x-data too early
    // and the whole component - entangled state included - fails to initialize.
    expect($field->toHtml())
        ->toContain('wire:ignore')
        ->toContain('x-load-src')
        ->toContain('x-ignore')
        ->toContain('x-model="searchQuery"')
        ->toContain('x-on:input.debounce.500ms="submitSearch()"');
});

it('safely encodes the translated entry map type label', function () {
    view()->share('errors', new ViewErrorBag);

    $translator = app('translator');
    $locale = $translator->getLocale();
    $namespace = 'filament-leaflet-map-picker';
    $key = 'leaflet-map-picker.map_type';
    $original = __("{$namespace}::{$key}");
    $translator->addLines([$key => "Editor's map"], $locale, $namespace);

    try {
        [$entry] = mountTestEntry(LeafletMapPickerEntry::make('coordinates')->state([0, 0]));
        $html = $entry->toHtml();
    } finally {
        $translator->addLines([$key => $original], $locale, $namespace);
    }

    expect($html)->toContain("map_type_text: 'Editor\\u0027s map'");
});

it('dehydrates picker state when sibling coordinate inputs share its location path', function () {
    $host = new class extends Livewire implements HasForms
    {
        use InteractsWithForms;

        public array $data = [];

        public function render(): string
        {
            return '<div></div>';
        }
    };

    $schema = Schema::make($host)
        ->statePath('data')
        ->components([
            LeafletMapPicker::make('location'),
            TextInput::make('location.lat')->live(),
            TextInput::make('location.lng')->live(),
        ]);

    $schema->getComponents();
    $schema->fill([
        'location' => [
            'lat' => '40.1',
            'lng' => '29.2',
        ],
    ]);

    expect($schema->getState())->toBe([
        'location' => [
            'lat' => 40.1,
            'lng' => 29.2,
        ],
    ]);
});

it('renders map columns with normalized read-only locations and configured heights', function (mixed $state, ?string $location) {
    $column = mountTestColumn(
        LeafletMapPickerColumn::make('location')->height('320px'),
        $state,
    );

    $html = $column->toHtml();
    $config = json_decode($column->getMapConfig(), true, 512, JSON_THROW_ON_ERROR);

    expect($html)
        ->toContain('x-data="leafletMapPickerEntry')
        ->toContain('style="height: 320px;')
        ->toContain('x-ref="mapContainer"')
        ->toContain('wire:key="leaflet-map-picker-column-')
        ->toContain('role="img"')
        ->not->toContain('$wire.$entangle')
        ->not->toContain('selectedCoordinates')
        ->toMatch('/location:\s*' . ($location ?? 'null') . '/');

    expect($config)
        ->toMatchArray([
            'defaultZoom' => 13,
            'defaultLocation' => ['lat' => 37.9106, 'lng' => 40.2365],
            'tileProvider' => 'openstreetmap',
            'showTileControl' => false,
            'interactive' => false,
        ])
        ->and($config['markerStyle'])->toBe('dot')
        ->and($config['showAttribution'])->toBeFalse()
        ->and($column->getMapConfig())->toContain('"defaultZoom":13')
        ->toContain('"defaultLocation":{"lat":37.9106,"lng":40.2365}');
})->with([
    'canonical state' => [['lat' => '40.1', 'lng' => '29.2'], '\\{(?:&quot;|")lat(?:&quot;|"):40.1,(?:&quot;|")lng(?:&quot;|"):29.2\\}'],
    'legacy state' => [[40.1, 29.2], '\\{(?:&quot;|")lat(?:&quot;|"):40.1,(?:&quot;|")lng(?:&quot;|"):29.2\\}'],
    'null state' => [null, null],
    'invalid state' => ['invalid', null],
]);

it('labels map columns according to whether a location is selected', function () {
    $selected = mountTestColumn(LeafletMapPickerColumn::make('location'), [40.1, 29.2])->toHtml();
    $empty = mountTestColumn(LeafletMapPickerColumn::make('location'), null)->toHtml();

    expect($selected)->toContain('aria-label="Map showing selected location: 40.1, 29.2"')
        ->and($empty)->toContain('aria-label="Map with no selected location"');
});
