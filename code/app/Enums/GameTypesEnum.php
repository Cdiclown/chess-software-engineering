<?php

namespace App\Enums;

use ArchTech\Enums\Names;
use ArchTech\Enums\Values;

enum GameTypesEnum : string
{
    use Names, Values;

    case PVP = 'pvp';
    case PVB = 'pvb';
}
