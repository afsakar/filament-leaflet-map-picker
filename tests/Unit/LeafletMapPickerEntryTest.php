<?php

use Afsakar\LeafletMapPicker\LeafletMapPickerEntry;

it('uses the shared canonical default location', function () {
    expect(LeafletMapPickerEntry::make('location')->getDefaultLocation())
        ->toBe(['lat' => 37.9106, 'lng' => 40.2365]);
});

it('normalizes custom default locations and preserves zero coordinates', function () {
    expect(LeafletMapPickerEntry::make('location')->defaultLocation([0, 0])->getDefaultLocation())
        ->toBe(['lat' => 0.0, 'lng' => 0.0]);
});

it('normalizes entry state before it reaches the view', function () {
    expect(LeafletMapPickerEntry::make('location')->state([0, 0])->getNormalizedState())
        ->toBe(['lat' => 0.0, 'lng' => 0.0])
        ->and(LeafletMapPickerEntry::make('location')->state('{"lat":"40.1","lng":"29.2"}')->getNormalizedState())
        ->toBe(['lat' => 40.1, 'lng' => 29.2])
        ->and(LeafletMapPickerEntry::make('location')->state('nope')->getNormalizedState())
        ->toBeNull();
});
