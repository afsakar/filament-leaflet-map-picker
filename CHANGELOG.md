# Changelog

All notable changes to `filament-leaflet-map-picker` will be documented in this file.

## v4: Filament 4/5 support, coordinate inputs, entangled state fix - 2026-08-03

### History note

`v4` started from its own root commit, so GitHub could not compare the two branches. `33929c9` grafts `main` into `v4` with `-s ours` (the v4 tree is kept as-is) and the follow-up commit restores the main-only changes that graft would have reverted: the dependabot action bumps (`fetch-metadata@v2.5.0`, `git-auto-commit-action@v7`) and the `v2.0.0` release notes in `CHANGELOG.md`.

### What's in it

- Filament 4/5 and Laravel 12/13 support, canonical `{lat, lng}` state shape, and the entry + table column components.
- Fix: the picker never wrote state back to Livewire. `location` was passed as a constructor argument and assigned in `init()`, but Alpine initializes `$wire.$entangle()` interceptors before `init()` runs, so the interceptor stayed uninitialized and saving stored `null`. It is now an own property of the component object. `x-ignore` is also restored next to `x-load`, without which Alpine evaluates `x-data` before the async component is registered.
- `showCoordinateInputs()` renders editable latitude/longitude inputs under the map, synced with the marker in both directions.
- The search modal now queries the geocoder while typing (debounced) instead of only on Enter or the search button.
- The table column renders as a compact thumbnail: a dot instead of a pin, no attribution control.

### Verification

- `vendor/bin/pest` — 39 passed (191 assertions)
- `npm run test:js` — 21 passed
- `vendor/bin/pint --test` — passed

Two files on `main` are intentionally absent here: `tests/ExampleTest.php` (skeleton test, removed during the v4 rewrite) and `.phpunit.cache/test-results` (now gitignored).

## v3.0.0

### What's Changed

- add unified support documentation for Filament 4/5 and Laravel 12/13
- document the canonical `{lat, lng}` state shape and legacy input migration path
- include manual state-to-map synchronization behavior in the release notes
- document search, tile, geolocation, attribution, and Nominatim policy boundaries
- keep Filament 3 users on the v2 release line instead of this v3 target

## v2.0.0 - 2025-10-02

### What's Changed

* Bump dependabot/fetch-metadata from 2.3.0 to 2.4.0 by @dependabot[bot] in https://github.com/afsakar/filament-leaflet-map-picker/pull/3
* Bump stefanzweifel/git-auto-commit-action from 5 to 6 by @dependabot[bot] in https://github.com/afsakar/filament-leaflet-map-picker/pull/6
* Bump aglipanci/laravel-pint-action from 2.5 to 2.6 by @dependabot[bot] in https://github.com/afsakar/filament-leaflet-map-picker/pull/10

### New Contributors

* @dependabot[bot] made their first contribution in https://github.com/afsakar/filament-leaflet-map-picker/pull/3

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.3.0...v2.0.0

## v1.3.0 - 2025-05-09

### What's Changed

* feat(map-entry): add entry component and fix default visibility for tile control in picker component. by @afsakar in #2

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.2.1...v1.3.0

## v1.2.1 - 2025-05-02

Fix map z-index problem

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.2.0...v1.2.1

## v1.2.0 - 2025-04-24

Add read-only mode and tile control visibility

Introduce read-only mode to disable marker interactions and hide tile control when not needed. This enhances flexibility for users who require a non-interactive map view or want to simplify the UI by removing the tile selector. Also, improve error handling for location services by using Filament notifications instead of alerts.

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.1.1...v1.2.0

## v1.1.1 - 2025-04-23

Fix: Location search result list height

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.1.0...v1.1.1

## v1.1.0 - 2025-04-22

### What's Changed

* feat: add location search functionality by @afsakar in https://github.com/afsakar/filament-leaflet-map-picker/pull/1

### New Contributors

* @afsakar made their first contribution in https://github.com/afsakar/filament-leaflet-map-picker/pull/1

**Full Changelog**: https://github.com/afsakar/filament-leaflet-map-picker/compare/v1.0.0...v1.1.0

## First Release - 2025-04-22

First release 🎉

## 1.0.0 - 202X-XX-XX

- initial release
