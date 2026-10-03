<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateCategory extends Model
{
    protected $table = 'template_categories';

    protected $fillable = ['name', 'slug'];
}
