<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'article_fee')) {
                $table->unsignedBigInteger('article_fee')->nullable()->after('role');
            }
            if (! Schema::hasColumn('users', 'bank_name')) {
                $table->string('bank_name', 100)->nullable()->after('article_fee');
            }
            if (! Schema::hasColumn('users', 'bank_account_number')) {
                $table->string('bank_account_number', 100)->nullable()->after('bank_name');
            }
            if (! Schema::hasColumn('users', 'bank_account_holder')) {
                $table->string('bank_account_holder', 150)->nullable()->after('bank_account_number');
            }
        });

        Schema::table('news_articles', function (Blueprint $table): void {
            if (! Schema::hasColumn('news_articles', 'editorial_status')) {
                $table->string('editorial_status', 20)->default('pending')->index()->after('status');
            }
            if (! Schema::hasColumn('news_articles', 'fact_check_status')) {
                $table->string('fact_check_status', 20)->default('pending')->index()->after('editorial_status');
            }
            if (! Schema::hasColumn('news_articles', 'review_note')) {
                $table->text('review_note')->nullable()->after('fact_check_status');
            }
            if (! Schema::hasColumn('news_articles', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('review_note')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('news_articles', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (! Schema::hasColumn('news_articles', 'fact_checked_by')) {
                $table->foreignId('fact_checked_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('news_articles', 'fact_checked_at')) {
                $table->timestamp('fact_checked_at')->nullable()->after('fact_checked_by');
            }
        });

        if (! Schema::hasTable('writer_earnings')) {
            Schema::create('writer_earnings', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('article_id')->nullable()->unique()->constrained('news_articles')->nullOnDelete();
                $table->unsignedBigInteger('amount');
                $table->string('article_title', 180);
                $table->string('description', 255);
                $table->timestamp('credited_at');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('writer_withdrawals')) {
            Schema::create('writer_withdrawals', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedBigInteger('amount');
                $table->string('bank_name', 100);
                $table->string('bank_account_number', 100);
                $table->string('bank_account_holder', 150);
                $table->string('status', 20)->default('pending')->index();
                $table->text('admin_note')->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('requested_at');
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('writer_withdrawals');
        Schema::dropIfExists('writer_earnings');

        Schema::table('news_articles', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('fact_checked_by');
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn([
                'editorial_status',
                'fact_check_status',
                'review_note',
                'approved_at',
                'fact_checked_at',
            ]);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'article_fee',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
            ]);
        });
    }
};
