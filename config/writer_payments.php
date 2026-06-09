<?php

return [
    'default_article_fee' => (int) env('WRITER_DEFAULT_ARTICLE_FEE', 25000),
    'minimum_withdrawal' => (int) env('WRITER_MINIMUM_WITHDRAWAL', 50000),
];
