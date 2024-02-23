<?php

namespace App\Enums;

use ArchTech\Enums\Names;
use ArchTech\Enums\Values;

enum GameStatusEnum : string
{
    use Names, Values;

    case NO_STATUS = 'no_status';
    case WHITE_TURN = 'white_turn';
    case BLACK_TURN = 'black_turn';
    case BLACK_WIN = 'black_win';
    case WHITE_WIN = 'white_win';
}
