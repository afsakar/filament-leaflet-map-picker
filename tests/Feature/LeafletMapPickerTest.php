<?php

use Afsakar\LeafletMapPicker\LeafletMapPicker;
use Afsakar\LeafletMapPicker\LeafletMapPickerEntry;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
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
