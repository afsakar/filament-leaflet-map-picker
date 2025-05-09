<?php

namespace Afsakar\LeafletMapPicker;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Asset;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class LeafletMapPickerServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-leaflet-map-picker';

    public static string $viewNamespace = 'filament-leaflet-map-picker';

    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package->name(static::$name)
            ->hasInstallCommand(function (InstallCommand $command) {
                $command
                    ->publishConfigFile()
                    ->askToStarRepoOnGitHub('afsakar/filament-leaflet-map-picker');
            });

        $configFileName = static::$name;

        if (file_exists($package->basePath("/../config/{$configFileName}.php"))) {
            $package->hasConfigFile();
        }

        if (file_exists($package->basePath('/../resources/lang'))) {
            $package->hasTranslations();
        }

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
    }

    public function packageRegistered(): void {}

    public function packageBooted(): void
    {
        // Asset Registration
        FilamentAsset::register(
            assets: [
                Css::make('leaflet-map-picker', __DIR__ . '/../resources/dist/filament-leaflet-map-picker.css')->loadedOnRequest(),
                AlpineComponent::make('leaflet-map-picker', __DIR__ . '/../resources/dist/field.js'),
                AlpineComponent::make('leaflet-map-picker-entry', __DIR__ . '/../resources/dist/entry.js'),
            ],
            package: 'afsakar/filament-leaflet-map-picker',
        );

        $this->publishes([
            __DIR__ . '/../resources/dist/images' => public_path('vendor/leaflet-map-picker/images'),
        ], 'filament-leaflet-map-picker-assets');
    }

    protected function getAssetPackageName(): ?string
    {
        return 'afsakar/filament-leaflet-map-picker';
    }
}
