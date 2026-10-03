<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id, 'order_number' => $this->order_number, 'customer_name' => $this->customer_name, 'whatsapp' => $this->whatsapp, 'email' => $this->email,
            'bride_name' => $this->bride_name, 'groom_name' => $this->groom_name, 'slug' => $this->slug, 'total' => $this->total, 'status' => $this->status, 'created_at' => $this->created_at,
            'template' => new TemplateResource($this->template), 'payment' => $this->payment, 'wedding_id' => $this->wedding?->id, 'histories' => $this->whenLoaded('histories'),
        ];
    }
}
