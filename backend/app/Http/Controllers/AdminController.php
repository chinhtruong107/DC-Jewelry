<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = trim($validated['username']);
        $admin = User::query()
            ->where('role', 'admin')
            ->where(function ($query) use ($login) {
                $query
                    ->where('email', $login)
                    ->orWhere('name', $login);
            })
            ->first();

        if (! $admin && strtolower($login) === 'admin') {
            $admin = User::where('role', 'admin')->oldest('id')->first();
        }

        if (! $admin || ! Hash::check($validated['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'username' => ['Tài khoản hoặc mật khẩu không đúng.'],
            ]);
        }

        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập quản trị thành công.',
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
            'token' => $token,
        ]);
    }

    public function dashboard(Request $request)
    {
        $products = Product::latest()
            ->get()
            ->map(function (Product $product) {
                return array_merge($product->toArray(), [
                    'raw_image' => $product->getRawImagePath(),
                ]);
            });
        $orders = Order::with('items')->latest()->get();
        $users = User::where('role', 'customer')->latest()->get();
        $reviews = ProductReview::with(['user:id,name,email', 'product:id,name,image', 'order:id,order_number'])
            ->latest()
            ->get();
        $today = Carbon::today();

        return response()->json([
            'products' => $products,
            'orders' => $orders,
            'users' => $users,
            'reviews' => $reviews,
            'summary' => [
                'revenue_today' => Order::whereDate('created_at', $today)->sum('total'),
                'revenue_total' => Order::where('status', '!=', 'cancelled')->sum('total'),
                'orders_pending' => Order::whereIn('status', ['pending', 'processing'])->count(),
                'orders_shipping' => Order::where('status', 'shipping')->count(),
                'orders_completed' => Order::where('status', 'completed')->count(),
                'new_customers' => User::where('role', 'customer')->whereDate('created_at', $today)->count(),
                'low_stock' => Product::where('stock', '<=', 10)->count(),
                'best_sellers' => Product::where('is_best_seller', true)->count(),
            ],
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipping,completed,cancelled'],
            'payment_status' => ['sometimes', 'string', 'in:unpaid,paid,refunded'],
        ]);

        if ($validated['status'] === 'cancelled') {
            if (! $order->canBeCancelledByAdmin()) {
                throw ValidationException::withMessages([
                    'status' => ['Đơn hàng này không thể hủy ở trạng thái hiện tại.'],
                ]);
            }

            return response()->json($order->cancelAndRestoreStock()->load('items'));
        }

        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => ['Không thể mở lại đơn hàng đã hủy.'],
            ]);
        }

        $order->update($validated);

        return response()->json($order->load('items'));
    }
}
