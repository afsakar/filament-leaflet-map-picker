<?php

namespace Afsakar\LeafletMapPicker\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Afsakar\LeafletMapPicker\LeafletMapPicker
 */
class LeafletMapPicker extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Afsakar\LeafletMapPicker\LeafletMapPicker::class;
    }
}
