<?php

use Afsakar\LeafletMapPicker\LeafletMapPickerColumn;
use Afsakar\LeafletMapPicker\Tests\TestCase;
use Filament\Support\Contracts\TranslatableContentDriver;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Livewire\Component;

uses(TestCase::class)->in(__DIR__);

function mountTestColumn(
    LeafletMapPickerColumn $column,
    mixed $state,
    string $recordKey = 'row-1',
): LeafletMapPickerColumn {
    $host = new class extends Component implements HasTable
    {
        use InteractsWithTable;

        public function render(): string
        {
            return '<div></div>';
        }

        public function makeFilamentTranslatableContentDriver(): ?TranslatableContentDriver
        {
            return null;
        }
    };

    Table::make($host)->columns([$column]);

    return $column
        ->record(['__key' => $recordKey, 'location' => $state])
        ->recordKey($recordKey);
}
