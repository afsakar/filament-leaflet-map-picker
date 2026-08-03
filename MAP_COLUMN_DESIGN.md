# Leaflet Map Column Design

## Goal

Add a read-only Filament table column that renders a Leaflet map from the
column state. It must work with Filament 4 and 5, use the package's canonical
coordinate handling, and expose an adjustable map height.

## API

```php
use Afsakar\LeafletMapPicker\LeafletMapPickerColumn;

LeafletMapPickerColumn::make('location')
    ->height('240px');
```

`height()` accepts a string or Closure and defaults to `240px`.

## Architecture

- `LeafletMapPickerColumn` extends `Filament\Tables\Columns\Column`.
- `filament/tables` is added as a direct `^4.0|^5.0` runtime dependency.
- The column view renders the existing read-only `leafletMapEntry` Alpine
  component, so map initialization, tile policy, marker handling, lifecycle
  cleanup, and invalid-state fallback stay in one JavaScript path.
- The column view receives the row value through `$getState()`, normalizes it
  before passing it to Alpine, and never writes state back to Livewire.
- Null or invalid state may use the existing visual default for map placement;
  it must not be presented as a selected location or mutate the row value.
- The only new public option is `height()`. Existing map display defaults are
  reused to keep the table column small and predictable.

## View behavior

- Render one map container per table cell with the configured height.
- Use a read-only map: no click, drag, search, or geolocation controls.
- Load the existing entry bundle and package CSS through Filament assets.
- Keep the cell markup self-contained so multiple rows can coexist without
  shared IDs or state.

## Testing

- Unit-test default height, static height, and Closure height evaluation.
- Render-test canonical, legacy, null, and invalid states.
- Assert the column view uses the entry Alpine component and configured height.
- Run PHP tests, Pint, PHPStan, Composer validation, JS tests, build, and the
  generated-asset diff check.

## Out of scope

- Interactive table editing.
- New map controls or geocoder behavior.
- A second JavaScript map implementation.
- Table-specific clustering, lazy loading, or viewport virtualization.
