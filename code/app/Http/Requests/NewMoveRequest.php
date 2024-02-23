<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property mixed move
 */
class NewMoveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */


    public function authorize(): bool
    {
        if (User::isLoggedIn()) {
            return User::getLoggedUser()->gameInfos()->where('game_id', $this->route('gameId'))->exists();
        } else {
            // @codeCoverageIgnoreStart
            return true;
            // @codeCoverageIgnoreEnd
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'move' => 'required|string'
        ];
    }
}
