<?php

use Afsakar\LeafletMapPicker\LeafletMapPickerColumn;

it('uses a compact default height and evaluates height closures', function () {
    expect(LeafletMapPickerColumn::make('location')->getHeight())
        ->toBe('50px')
        ->and(LeafletMapPickerColumn::make('location')->height(fn (): string => '320px')->getHeight())
        ->toBe('320px');
});

it('normalizes column state without mutating it', function () {
    $column = mountTestColumn(LeafletMapPickerColumn::make('location'), '{"lat":"40.1","lng":"29.2"}');

    expect($column->getNormalizedState())->toBe(['lat' => 40.1, 'lng' => 29.2])
        ->and(mountTestColumn(LeafletMapPickerColumn::make('location'), 'invalid')->getNormalizedState())
        ->toBeNull();
});

it('honors the inherited state pipeline', function () {
    $column = mountTestColumn(
        LeafletMapPickerColumn::make('location')
            ->state([1, 2])
            ->getStateUsing(fn (): array => ['lat' => '40.1', 'lng' => '29.2']),
        [1, 2],
    );

    expect($column->getNormalizedState())->toBe(['lat' => 40.1, 'lng' => 29.2]);
});

it('keys maps by row identity and normalized state', function () {
    $first = mountTestColumn(LeafletMapPickerColumn::make('location'), [40.1, 29.2], 'row-1');
    $sameRowChanged = mountTestColumn(LeafletMapPickerColumn::make('location'), [41.1, 28.2], 'row-1');
    $otherRowSameState = mountTestColumn(LeafletMapPickerColumn::make('location'), [40.1, 29.2], 'row-2');

    expect($first->getMapKey())
        ->toContain('row-1')
        ->not->toBe($sameRowChanged->getMapKey())
        ->not->toBe($otherRowSameState->getMapKey());
});
