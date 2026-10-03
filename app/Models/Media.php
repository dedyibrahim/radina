<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = ['wedding_id', 'uploaded_by', 'collection', 'disk', 'path', 'mime_type', 'size'];
}
