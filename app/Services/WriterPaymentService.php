<?php

namespace App\Services;

use App\Models\NewsArticle;
use App\Models\WriterEarning;
use Illuminate\Support\Facades\DB;

class WriterPaymentService
{
    public function creditArticleIfEligible(NewsArticle $article): ?WriterEarning
    {
        return DB::transaction(function () use ($article): ?WriterEarning {
            $lockedArticle = NewsArticle::query()
                ->with('author')
                ->lockForUpdate()
                ->findOrFail($article->id);

            if (
                ! $lockedArticle->isApprovedAndVerified()
                || ! $lockedArticle->isPublished()
                || ! $lockedArticle->author?->isWriter()
            ) {
                return null;
            }

            return WriterEarning::firstOrCreate(
                ['article_id' => $lockedArticle->id],
                [
                    'user_id' => $lockedArticle->user_id,
                    'amount' => $lockedArticle->author->articleFee(),
                    'article_title' => $lockedArticle->title,
                    'description' => 'Honor artikel yang disetujui dan lolos verifikasi fakta.',
                    'credited_at' => now(),
                ]
            );
        });
    }
}
