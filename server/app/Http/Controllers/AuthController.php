<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Google\Client as GoogleClient;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        try {
            $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
            ]);
        } catch (ValidationException $e) {
            $firstMessage = collect($e->errors())->flatten()->first();
            return response()->json([
                'success' => false,
                'message' => $firstMessage,
                'errors'  => $e->errors(),
            ], 422);
        }

        if (!str_contains($request->password, '@')) {
            return response()->json([
                'success' => false,
                'message' => 'Password must contain at least one @ symbol.',
            ], 422);
        }

        $user = User::create([
            'name'                    => $request->name,
            'email'                   => $request->email,
            'password'                => Hash::make($request->password),
            'is_admin'                => false,
            'email_verified_at'       => now(),
            'verification_code'       => null,
            'verification_expires_at' => null,
            'registration_fee_paid'   => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully!',
            'user_id' => $user->id,
        ]);
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);
        } catch (ValidationException $e) {
            $firstMessage = collect($e->errors())->flatten()->first();
            return response()->json([
                'success' => false,
                'message' => $firstMessage,
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->registration_fee_paid) {
            return response()->json([
                'success'       => false,
                'message'       => 'Please pay the registration fee to access the library.',
                'needs_payment' => true,
                'user_id'       => $user->id,
            ], 403);
        }

        $token = $user->createToken('library_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function payFee(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        $user->update(['registration_fee_paid' => true]);

        $token = $user->createToken('library_token')->plainTextToken;

        return response()->json([
            'message' => 'Payment successful! Welcome to the library.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    public function googleAuth(Request $request)
    {
        $request->validate(['id_token' => 'required|string']);

        $client = new GoogleClient(['client_id' => config('services.google.client_id')]);

        try {
            $payload = $client->verifyIdToken($request->id_token);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid Google token.'], 401);
        }

        if (!$payload) {
            return response()->json(['message' => 'Invalid Google token.'], 401);
        }

        $googleId = $payload['sub'];
        $email    = $payload['email'];
        $name     = $payload['name'] ?? $email;

        $user = User::where('google_id', $googleId)
                    ->orWhere('email', $email)
                    ->first();

        if (!$user) {
            $user = User::create([
                'name'                  => $name,
                'email'                 => $email,
                'google_id'             => $googleId,
                'password'              => Hash::make(Str::random(32)),
                'is_admin'              => false,
                'email_verified_at'     => now(),
                'registration_fee_paid' => false,
            ]);
        } else {
            $user->update([
                'google_id'         => $googleId,
                'email_verified_at' => now(),
            ]);
        }

        if (!$user->registration_fee_paid) {
            return response()->json([
                'message'       => 'Please pay the registration fee to access the library.',
                'needs_payment' => true,
                'user_id'       => $user->id,
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('library_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    public function getUser(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    public function dashboard(Request $request)
    {
        return response()->json([
            'message' => 'Welcome to Smart Library Dashboard',
            'user'    => $request->user()
        ]);
    }
}