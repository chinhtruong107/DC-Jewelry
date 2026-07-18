"use client";

import { CalendarClock, Pencil, Plus, TicketPercent, ToggleLeft } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AdminCoupon, AdminModal, formatDateTime, SectionCard } from "./shared";
import { formatVND } from "@/lib/utils";

type CouponForm = {
  code: string;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  minimum_order_amount: string;
  maximum_discount_amount: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const emptyCouponForm: CouponForm = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "10",
  minimum_order_amount: "1000000",
  maximum_discount_amount: "500000",
  usage_limit: "100",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

function inputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function couponState(coupon: AdminCoupon) {
  const now = Date.now();
  if (!coupon.is_active) return { label: "Đã tắt", tone: "bg-slate-100 text-slate-600" };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) return { label: "Hết hạn", tone: "bg-rose-50 text-rose-700" };
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return { label: "Sắp diễn ra", tone: "bg-sky-50 text-sky-700" };
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.usage_count >= coupon.usage_limit) {
    return { label: "Hết lượt", tone: "bg-amber-50 text-amber-700" };
  }
  return { label: "Đang áp dụng", tone: "bg-emerald-50 text-emerald-700" };
}

export default function PromotionsView({
  coupons,
  token,
  onCouponsChange,
}: {
  coupons: AdminCoupon[];
  token: string | null;
  onCouponsChange: (coupons: AdminCoupon[]) => void;
}) {
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const activeCount = useMemo(() => coupons.filter((coupon) => couponState(coupon).label === "Đang áp dụng").length, [coupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCouponForm);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      minimum_order_amount: String(coupon.minimum_order_amount),
      maximum_discount_amount: coupon.maximum_discount_amount ? String(coupon.maximum_discount_amount) : "",
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      starts_at: inputDate(coupon.starts_at),
      expires_at: inputDate(coupon.expires_at),
      is_active: coupon.is_active,
    });
    setError("");
    setIsOpen(true);
  };

  const saveCoupon = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons", {
        method: editingId ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          minimum_order_amount: Number(form.minimum_order_amount || 0),
          maximum_discount_amount: form.maximum_discount_amount ? Number(form.maximum_discount_amount) : null,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          starts_at: form.starts_at || null,
          expires_at: form.expires_at || null,
          is_active: form.is_active,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const validationMessage = payload.errors ? Object.values(payload.errors as Record<string, string[]>).flat()[0] : null;
        throw new Error(validationMessage || payload.message || "Không thể lưu mã giảm giá.");
      }

      const nextCoupons = editingId
        ? coupons.map((coupon) => coupon.id === editingId ? payload : coupon)
        : [payload, ...coupons];
      onCouponsChange(nextCoupons);
      setIsOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu mã giảm giá.");
    } finally {
      setIsSaving(false);
    }
  };

  const disableCoupon = async (coupon: AdminCoupon) => {
    if (!window.confirm(`Ngừng sử dụng mã ${coupon.code}?`)) return;

    const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    if (response.ok) {
      onCouponsChange(coupons.map((item) => item.id === coupon.id ? { ...item, is_active: false } : item));
    }
  };

  const inputClass = "mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Commerce tools</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Mã giảm giá & khuyến mãi</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản lý thời hạn, điều kiện đơn và giới hạn sử dụng.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Tạo mã mới
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SectionCard className="p-4"><p className="text-xs text-slate-500">Tổng số mã</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{coupons.length}</p></SectionCard>
        <SectionCard className="p-4"><p className="text-xs text-slate-500">Đang áp dụng</p><p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p></SectionCard>
        <SectionCard className="p-4"><p className="text-xs text-slate-500">Lượt đã dùng</p><p className="mt-2 text-2xl font-bold text-orange-600">{coupons.reduce((sum, coupon) => sum + coupon.usage_count, 0)}</p></SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {coupons.map((coupon) => {
          const state = couponState(coupon);
          return (
            <SectionCard key={coupon.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-orange-500 px-3 py-1 text-sm font-bold tracking-[0.08em] text-white">{coupon.code}</span>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${state.tone}`}>{state.label}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950 dark:text-white">{coupon.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{coupon.description || "Không có mô tả"}</p>
                </div>
                <button type="button" onClick={() => openEdit(coupon)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-orange-100 text-orange-600 transition hover:bg-orange-50 dark:border-slate-700"><Pencil className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-orange-100 pt-4 text-xs dark:border-slate-700">
                <div><p className="text-slate-400">Mức giảm</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : formatVND(coupon.discount_value)}</p></div>
                <div><p className="text-slate-400">Đơn tối thiểu</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatVND(coupon.minimum_order_amount)}</p></div>
                <div><p className="text-slate-400">Lượt sử dụng</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{coupon.usage_count} / {coupon.usage_limit ?? "∞"}</p></div>
                <div><p className="text-slate-400">Hết hạn</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{coupon.expires_at ? formatDateTime(coupon.expires_at) : "Không giới hạn"}</p></div>
              </div>
              {coupon.is_active && <button type="button" onClick={() => disableCoupon(coupon)} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-rose-600"><ToggleLeft className="h-4 w-4" /> Ngừng mã</button>}
            </SectionCard>
          );
        })}
      </div>

      {coupons.length === 0 && <SectionCard className="p-8 text-center text-sm text-slate-500">Chưa có mã giảm giá. Hãy tạo mã đầu tiên.</SectionCard>}

      {isOpen && (
        <AdminModal title={editingId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"} description="Mã sẽ được backend kiểm tra lại khi khách đặt hàng." onClose={() => setIsOpen(false)} size="xl">
          <form onSubmit={saveCoupon} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Mã voucher<input required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} className={inputClass} placeholder="WELCOME10" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-1 xl:col-span-2">Tên chương trình<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Loại giảm<select value={form.discount_type} onChange={(event) => setForm((current) => ({ ...current, discount_type: event.target.value as CouponForm["discount_type"] }))} className={inputClass}><option value="percentage">Theo phần trăm</option><option value="fixed">Số tiền cố định</option></select></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Giá trị giảm<input required type="number" min={1} max={form.discount_type === "percentage" ? 100 : undefined} value={form.discount_value} onChange={(event) => setForm((current) => ({ ...current, discount_value: event.target.value }))} className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Đơn tối thiểu<input required type="number" min={0} value={form.minimum_order_amount} onChange={(event) => setForm((current) => ({ ...current, minimum_order_amount: event.target.value }))} className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Giảm tối đa<input type="number" min={1} value={form.maximum_discount_amount} onChange={(event) => setForm((current) => ({ ...current, maximum_discount_amount: event.target.value }))} className={inputClass} placeholder="Không giới hạn" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Số lượt dùng<input type="number" min={1} value={form.usage_limit} onChange={(event) => setForm((current) => ({ ...current, usage_limit: event.target.value }))} className={inputClass} placeholder="Không giới hạn" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Bắt đầu</span><input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Hết hạn</span><input type="datetime-local" value={form.expires_at} onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} className={inputClass} /></label>
              <label className="flex items-center gap-2 rounded-md border border-orange-100 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="accent-orange-500" /> Cho phép sử dụng</label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2 xl:col-span-4">Mô tả<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={`${inputClass} min-h-20 py-2`} /></label>
            </div>
            {error && <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-orange-100 pt-4 dark:border-slate-700">
              <button type="button" onClick={() => setIsOpen(false)} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold dark:border-slate-700">Hủy</button>
              <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white disabled:opacity-50"><TicketPercent className="h-4 w-4" /> {isSaving ? "Đang lưu..." : "Lưu mã"}</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
