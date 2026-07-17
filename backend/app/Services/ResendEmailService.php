<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ResendEmailService
{
    public function canSendContactNotification(): bool
    {
        return filled(config('services.resend.key'))
            && filled(config('services.resend.from'))
            && filled(config('services.resend.contact_to'));
    }

    public function sendTemporaryPassword(string $to, string $name, string $temporaryPassword): void
    {
        $apiKey = config('services.resend.key');
        $from = config('services.resend.from');

        if (! $apiKey || ! $from) {
            throw new RuntimeException('Resend is not configured.');
        }

        $safeName = e($name ?: 'khách hàng');
        $safePassword = e($temporaryPassword);
        $subject = 'Mật khẩu mới cho tài khoản Đức Chính Jewelry';
        $text = "Xin chào {$name},\n\n"
            ."Mật khẩu tạm thời mới của bạn là: {$temporaryPassword}\n\n"
            ."Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.\n\n"
            .'Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ Đức Chính Jewelry để được hỗ trợ.';

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
                        <p>Đức Chính Jewelry đã tạo mật khẩu tạm thời mới cho tài khoản của bạn:</p>
                        <p style="display:inline-block;padding:12px 16px;background:#f3f4f6;border-radius:8px;font-size:20px;font-weight:700;letter-spacing:1px;color:#111827">{$safePassword}</p>
                        <p>Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.</p>
                        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ Đức Chính Jewelry để được hỗ trợ.</p>
                        <p style="margin-top:24px;color:#6b7280;font-size:13px">Đức Chính Jewelry</p>
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

    public function sendContactNotification(ContactMessage $contactMessage): void
    {
        if (! $this->canSendContactNotification()) {
            throw new RuntimeException('Resend contact notification is not configured.');
        }

        $safeName = e($contactMessage->name);
        $safeEmail = e($contactMessage->email);
        $safeSubject = e($contactMessage->subject);
        $safeMessage = nl2br(e($contactMessage->message));
        $reference = 'LH-'.str_pad((string) $contactMessage->id, 6, '0', STR_PAD_LEFT);

        $this->send([
            'from' => config('services.resend.from'),
            'to' => [config('services.resend.contact_to')],
            'reply_to' => $contactMessage->email,
            'subject' => "[{$reference}] {$contactMessage->subject}",
            'html' => <<<HTML
                <div style="font-family:Arial,sans-serif;line-height:1.65;color:#28171a;max-width:640px">
                    <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7a2130">Đức Chính Jewelry · Yêu cầu liên hệ mới</p>
                    <h1 style="font-size:24px">{$safeSubject}</h1>
                    <p><strong>Mã yêu cầu:</strong> {$reference}</p>
                    <p><strong>Khách hàng:</strong> {$safeName}</p>
                    <p><strong>Email:</strong> {$safeEmail}</p>
                    <div style="margin-top:20px;padding:18px;background:#fff9ef;border-left:4px solid #7a2130">{$safeMessage}</div>
                </div>
                HTML,
            'text' => "{$reference}\nKhách hàng: {$contactMessage->name}\nEmail: {$contactMessage->email}\nChủ đề: {$contactMessage->subject}\n\n{$contactMessage->message}",
        ]);
    }

    private function send(array $payload): void
    {
        $response = Http::withToken(config('services.resend.key'))
            ->acceptJson()
            ->asJson()
            ->post('https://api.resend.com/emails', $payload);

        if ($response->failed()) {
            $message = data_get($response->json(), 'message')
                ?: data_get($response->json(), 'error')
                ?: Str::limit($response->body(), 300);

            throw new RuntimeException(trim('Resend email request failed with status '.$response->status().': '.$message));
        }
    }
}
