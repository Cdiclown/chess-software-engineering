<?php

namespace App\Http\Requests;

use App\Enums\GameTypesEnum;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property string type
 * @property int game_duration
 * @property int difficulty
 */
class CreateGameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // A guest cannot create pvp game
        if ($this->type == GameTypesEnum::PVP->value && !User::isLoggedIn()) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:' . implode(',', GameTypesEnum::values()),
            // Game duration required only if pvp
            'game_duration' => 'required_if:type,' . GameTypesEnum::PVP->value . '|integer|min:1',
            'difficulty' => 'required_if:type,' . GameTypesEnum::PVB->value . '|integer|min:-46|max:46',
        ];
    }
}
