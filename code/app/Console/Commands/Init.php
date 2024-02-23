<?php

// @codeCoverageIgnoreStart

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Telegram\Bot\Laravel\Facades\Telegram;

class Init extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:init';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->call('migrate:fresh');
        $this->call('db:seed');

        // Set telegram webhook
        Telegram::setWebhook(['url' => env('TELEGRAM_WEBHOOK_URL')]);
    }
}

// @codeCoverageIgnoreEnd
