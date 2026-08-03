<?php

use Afsakar\LeafletMapPicker\LeafletMapPickerColumn;

it('uses a compact default height and evaluates height closures', function () {
    expect(LeafletMapPickerColumn::make('location')->getHeight())
        ->toBe('240px')
        ->and(LeafletMapPickerColumn::make('location')->height(fn (): string => '320px')->getHeight())
        ->toBe('320px');
});

it('normalizes column state without mutating it', function () {
    $column = LeafletMapPickerColumn::make('location')->state('{"lat":"40.1","lng":"29.2"}');

    expect($column->getNormalizedState())->toBe(['lat' => 40.1, 'lng' => 29.2])
        ->and(LeafletMapPickerColumn::make('location')->state('invalid')->getNormalizedState())
        ->toBeNull();
});
