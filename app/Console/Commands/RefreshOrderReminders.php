<?php

namespace App\Console\Commands;

use App\Services\OrderReminderService;
use Illuminate\Console\Command;

class RefreshOrderReminders extends Command
{
    protected $signature = 'radina:reminders';

    protected $description = 'Perbarui pengingat pesanan untuk dashboard dan portal pelanggan';

    public function handle(OrderReminderService $reminders): int
    {
        $reminders->refresh();
        $this->info('Pengingat dashboard dan portal diperbarui.');

        return self::SUCCESS;
    }
}
