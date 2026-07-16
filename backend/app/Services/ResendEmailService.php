<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ResendEmailService
{
    public function sendTemporaryPassword(string $to, string $name, string $temporaryPassword): void
    {
        $apiKey = config('services.resend.key');
        $from = config('services.resend.from');

        if (! $apiKey || ! $from) {
            throw new RuntimeException('Resend is not configured.');
        }

        $safeName = e($name ?: 'khách hàng');
        $safePassword = e($temporaryPassword);
        $subject = 'Mật khẩu mới cho tài khoản VANHPERFUME';
        $text = "Xin chào {$name},\n\n"
            ."Mật khẩu tạm thời mới của bạn là: {$temporaryPassword}\n\n"
            ."Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.\n\n"
            .'Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ VANHPERFUME để được hỗ trợ.';

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->post('https://api.resend.com/emails', [
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => <<<HTML
                    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
                        <p>Xin chào {$safeName},</p>
                        <p>VANHPERFUME đã tạo mật khẩu tạm thời mới cho tài khoản của bạn:</p>
                        <p style="display:inline-block;padding:12px 16px;background:#f3f4f6;border-radius:8px;font-size:20px;font-weight:700;letter-spacing:1px;color:#111827">{$safePassword}</p>
                        <p>Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.</p>
                        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ VANHPERFUME để được hỗ trợ.</p>
                        <p style="margin-top:24px;color:#6b7280;font-size:13px">VANHPERFUME</p>
                    </div>
                    HTML,
                'text' => $text,
            ]);

        if ($response->failed()) {
            $message = data_get($response->json(), 'message')
                ?: data_get($response->json(), 'error')
                ?: Str::limit($response->body(), 300);

            throw new RuntimeException(trim('Resend email request failed with status '.$response->status().': '.$message));
        }
    }
}
