<?php
namespace Tests;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    protected function setUpTraits()
    {
        // Check before RefreshDatabase can run any destructive migration command.
        if (! $this->app->environment('testing') || config('database.default') !== 'mysql' || config('database.connections.mysql.database') !== 'radina_wedding_test') {
            throw new \RuntimeException('Tests require the isolated radina_wedding_test database.');
        }
        return parent::setUpTraits();
    }
}
