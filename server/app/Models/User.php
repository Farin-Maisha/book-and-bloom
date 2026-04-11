<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'google_id',
        'email_verified_at',
        'verification_code',
        'verification_expires_at',
        'registration_fee_paid',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    protected $casts = [
        'is_admin'             => 'boolean',
        'email_verified_at'    => 'datetime',
        'verification_expires_at' => 'datetime',
        'registration_fee_paid' => 'boolean',
    ];
}