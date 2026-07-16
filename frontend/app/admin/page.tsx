"use client";

import { formatVND, productImageUrl } from "@/lib/utils";
import { fetchProvinces, type ProvinceOption } from "@/lib/locations";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  Download,
  Eye,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Pencil,
  PanelLeft,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Trophy,
  Upload,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type AdminTab = "overview" | "products" | "orders" | "customers" | "reviews" | "settings";
type RevenueMode = "day" | "month";

type AdminProduct = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  raw_image?: string | null;
  description?: string | null;
  category?: string | null;
  stock?: number | null;
  status?: string | null;
  is_best_seller?: boolean;
  isBestSeller?: boolean;
};

type ProductFormState = {
  name: string;
  price: string;
  category: string;
  stock: string;
  status: "active" | "inactive";
  image: string;
  description: string;
  is_best_seller: boolean;
};

type ProductPayload = {
  name: string;
  price: number;
  category: string;
  stock: number;
  status: ProductFormState["status"];
  image: string | null;
  description: string | null;
  is_best_seller: boolean;
  image_data?: string;
};

type AdminOrderItem = {
  id: number;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  line_total: number;
};

type AdminOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string | null;
  customer_address_detail?: string | null;
  customer_province_code?: string | null;
  customer_province_name?: string | null;
  customer_ward_code?: string | null;
  customer_ward_name?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  recipient_address_detail?: string | null;
  recipient_province_code?: string | null;
  recipient_province_name?: string | null;
  recipient_ward_code?: string | null;
  recipient_ward_name?: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  total: number;
  note?: string | null;
  created_at: string;
  items?: AdminOrderItem[];
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  address_detail?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  ward_code?: string | null;
  ward_name?: string | null;
  role?: string;
  created_at: string;
};

type AdminReview = {
  id: number;
  rating: number;
  content?: string | null;
  created_at: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  product?: {
    name?: string;
  } | null;
  order?: {
    order_number?: string;
  } | null;
};

type DashboardData = {
  products: AdminProduct[];
  orders: AdminOrder[];
  users: AdminUser[];
  reviews: AdminReview[];
  summary: {
    revenue_today: number;
    revenue_total: number;
    orders_pending: number;
    orders_shipping: number;
    orders_completed: number;
    new_customers: number;
    low_stock: number;
    best_sellers: number;
  };
};

const API_URL = "/api";
const TOKEN_KEY = "bloom_admin_token";
const ADMIN_KEY = "bloom_admin_user";

const emptyProductForm: ProductFormState = {
  name: "",
  price: "",
  category: "Dây chuyền",
  stock: "100",
  status: "active",
  image: "",
  description: "",
  is_best_seller: false,
};

const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "products", label: "Sản phẩm", icon: Boxes },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "reviews", label: "Đánh giá", icon: Star },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
  processing: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-500/30",
  shipping: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30",
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value?: string) {
  if (!value) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCompactVND(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

function monthLabel(date: Date) {
  return `T${date.getMonth() + 1}/${date.getFullYear()}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}

function orderDateInRange(order: AdminOrder, startDate?: string, endDate?: string) {
  const orderDate = new Date(order.created_at);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && orderDate < start) return false;
  if (end && orderDate > end) return false;
  return true;
}

function orderProvinceCodeForOrder(order: AdminOrder) {
  return order.recipient_province_code || order.customer_province_code || "";
}

function orderProvinceName(order: AdminOrder) {
  return order.recipient_province_name || order.customer_province_name || "Chưa xác định";
}

function excelCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadExcel(filename: string, sheets: Array<{ title: string; rows: unknown[][] }>) {
  const workbook = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    h2 { margin: 20px 0 8px; }
    table { border-collapse: collapse; margin-bottom: 24px; width: 100%; }
    th, td { border: 1px solid #d9d9d9; padding: 6px 8px; mso-number-format:"\\@"; }
    th { background: #f3f4f6; font-weight: 700; }
  </style>
</head>
<body>
${sheets
  .map(
    (sheet) => `<h2>${excelCell(sheet.title)}</h2>
<table>
${sheet.rows
  .map((row, rowIndex) => {
    const tag = rowIndex === 0 ? "th" : "td";
    return `<tr>${row.map((cell) => `<${tag}>${excelCell(cell)}</${tag}>`).join("")}</tr>`;
  })
  .join("\n")}
</table>`
  )
  .join("\n")}
</body>
</html>`;
  const blob = new Blob([`\uFEFF${workbook}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function productInventoryStatus(product: AdminProduct) {
  const stock = product.stock ?? 0;

  if (product.status === "inactive") {
    return {
      key: "hidden",
      label: "Tạm ẩn",
      tone: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (stock <= 0) {
    return {
      key: "out",
      label: "Hết hàng",
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
    };
  }

  if (stock <= 10) {
    return {
      key: "low",
      label: `Sắp hết: ${stock}`,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    };
  }

  return {
    key: "available",
    label: `Còn ${stock}`,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  };
}

function orderItemsText(order: AdminOrder) {
  return (
    order.items
      ?.map((item) => `${item.product_name} x${item.quantity} (${item.line_total.toLocaleString("vi-VN")} VND)`)
      .join("; ") || "Chưa có sản phẩm"
  );
}

function orderExportRows(orders: AdminOrder[]) {
  return [
    [
      "Mã đơn",
      "Ngày tạo",
      "Khách hàng",
      "Email",
      "Số điện thoại",
      "Tỉnh/Thành",
      "Phường/Xã",
      "Địa chỉ giao",
      "Sản phẩm",
      "Trạng thái",
      "Phương thức thanh toán",
      "Trạng thái thanh toán",
      "Tạm tính",
      "Phí ship",
      "Giảm giá",
      "Tổng tiền",
      "Ghi chú",
    ],
    ...orders.map((order) => [
      order.order_number,
      formatDateTime(order.created_at),
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      orderProvinceName(order),
      order.recipient_ward_name || order.customer_ward_name || "Chưa xác định",
      order.recipient_address || order.customer_address || "Chưa có địa chỉ",
      orderItemsText(order),
      statusLabels[order.status] || order.status,
      order.payment_method?.toUpperCase(),
      order.payment_status,
      order.subtotal ?? 0,
      order.shipping_fee ?? 0,
      order.discount ?? 0,
      order.total,
      order.note || "",
    ]),
  ];
}

function revenueOverviewRows(orders: AdminOrder[], startDate?: string, endDate?: string) {
  const validOrders = orders.filter((order) => order.status !== "cancelled");
  const completedOrders = validOrders.filter((order) => order.status === "completed");
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = validOrders.length ? Math.round(revenue / validOrders.length) : 0;

  return [
    ["Chỉ tiêu", "Giá trị"],
    ["Từ ngày", startDate || "Không giới hạn"],
    ["Đến ngày", endDate || "Không giới hạn"],
    ["Tổng số đơn trong bộ lọc", orders.length],
    ["Đơn hợp lệ", validOrders.length],
    ["Đơn hoàn thành", completedOrders.length],
    ["Đơn đã hủy", orders.filter((order) => order.status === "cancelled").length],
    ["Tổng doanh thu", revenue],
    ["Giá trị đơn trung bình", averageOrderValue],
  ];
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 ${className}`}>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function AdminModal({
  title,
  description,
  children,
  onClose,
  size = "lg",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass = {
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }[size];

  return (
    <div className="admin-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm">
      <div className={`admin-modal-panel max-h-[90vh] w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 ${sizeClass}`}>
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Đóng modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loginError, setLoginError] = useState("");
  const [dataError, setDataError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("day");
  const [revenueStartDate, setRevenueStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return toDateInputValue(date);
  });
  const [revenueEndDate, setRevenueEndDate] = useState(() => toDateInputValue(new Date()));
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [productError, setProductError] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<AdminProduct | null>(null);
  const [selectedProductImageFile, setSelectedProductImageFile] = useState<File | null>(null);
  const [selectedProductImagePreview, setSelectedProductImagePreview] = useState("");
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);

  useEffect(() => {
    setMounted(true);
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!selectedProductImageFile) {
      setSelectedProductImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedProductImageFile);
    setSelectedProductImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedProductImageFile]);

  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      setIsLoadingData(true);
      setDataError("");

      try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Không thể tải dữ liệu quản trị.");
        }

        setData(payload as DashboardData);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "Không thể tải dữ liệu.");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
        setToken(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboard();
  }, [token]);

  const searchText = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.products;
    return data.products.filter((product) =>
      [product.name, product.category, product.status]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.orders;
    return data.orders.filter((order) =>
      [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.customer_address,
        order.recipient_address,
        orderProvinceName(order),
        statusLabels[order.status],
      ]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.users;
    return data.users.filter((user) =>
      [user.name, user.email, user.phone, user.address, user.province_name, user.ward_name]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Doanh thu hôm nay",
        value: formatVND(data.summary.revenue_today),
        change: `Tổng doanh thu ${formatVND(data.summary.revenue_total)}`,
        icon: CircleDollarSign,
      },
      {
        label: "Đơn cần xử lý",
        value: String(data.summary.orders_pending),
        change: `${data.orders.length} đơn trong hệ thống`,
        icon: PackageCheck,
      },
      {
        label: "Khách hàng mới",
        value: String(data.summary.new_customers),
        change: `${data.users.length} tài khoản khách hàng`,
        icon: Users,
      },
      {
        label: "Sản phẩm sắp hết",
        value: String(data.summary.low_stock),
        change: `${data.products.length} sản phẩm trong kho`,
        icon: WalletCards,
      },
    ];
  }, [data]);

  const revenueBars = useMemo(() => {
    if (!data) return [];

    const start = revenueStartDate ? new Date(`${revenueStartDate}T00:00:00`) : null;
    const end = revenueEndDate ? new Date(`${revenueEndDate}T23:59:59`) : null;
    const totals = data.orders.reduce<Record<string, { label: string; total: number }>>((result, order) => {
      if (order.status === "cancelled") return result;
      const orderDate = new Date(order.created_at);
      if (start && orderDate < start) return result;
      if (end && orderDate > end) return result;

      const key =
        revenueMode === "day"
          ? toDateInputValue(orderDate)
          : `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
      const label =
        revenueMode === "day"
          ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(orderDate)
          : monthLabel(orderDate);

      result[key] = {
        label,
        total: (result[key]?.total || 0) + order.total,
      };
      return result;
    }, {});

    const entries = Object.entries(totals)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value)
      .slice(-10);
    const max = Math.max(...entries.map((item) => item.total), 1);

    return entries.map((item) => ({
      ...item,
      value: Math.max((item.total / max) * 100, 3),
    }));
  }, [data, revenueEndDate, revenueMode, revenueStartDate]);

  const selectedRevenue = useMemo(
    () => revenueBars.reduce((sum, item) => sum + item.total, 0),
    [revenueBars]
  );
  const revenueMax = useMemo(() => Math.max(...revenueBars.map((item) => item.total), 0), [revenueBars]);
  const revenueTicks = useMemo(() => {
    if (revenueMax <= 0) return [0, 0, 0, 0, 0];
    return [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(revenueMax * ratio));
  }, [revenueMax]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Tài khoản hoặc mật khẩu không đúng.");
      }

      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(payload.admin));
      setToken(payload.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Không thể đăng nhập.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setData(null);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: AdminOrder["status"]) => {
    if (!token) return;

    if (status === "cancelled" && !window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...(status === "completed" ? { payment_status: "paid" } : {}),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Không thể cập nhật trạng thái đơn hàng.");
      }

      const updatedOrder = payload as AdminOrder;

      setData((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
              summary: {
                ...current.summary,
                orders_pending: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => ["pending", "processing"].includes(order.status)).length,
                orders_shipping: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => order.status === "shipping").length,
                orders_completed: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => order.status === "completed").length,
              },
            }
          : current
      );
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openCreateProduct = () => {
    const nextId = data?.products.length ? Math.max(...data.products.map((product) => product.id)) + 1 : 1;
    setEditingProductId(null);
    setProductForm({
      ...emptyProductForm,
      image: `products/product-${String(nextId).padStart(2, "0")}.jpg`,
    });
    setSelectedProductImageFile(null);
    setProductError("");
    setIsProductFormOpen(true);
    setActiveTab("products");
  };

  const openEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "Dây chuyền",
      stock: String(product.stock ?? 0),
      status: product.status === "inactive" ? "inactive" : "active",
      image: product.raw_image || product.image || "",
      description: product.description || "",
      is_best_seller: Boolean(product.is_best_seller ?? product.isBestSeller),
    });
    setSelectedProductImageFile(null);
    setProductError("");
    setIsProductFormOpen(true);
    setActiveTab("products");
  };

  const closeProductForm = () => {
    setIsProductFormOpen(false);
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setSelectedProductImageFile(null);
    setProductError("");
  };

  const productPayload = async (): Promise<ProductPayload> => {
    const payload: ProductPayload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      category: productForm.category.trim(),
      stock: Number(productForm.stock),
      status: productForm.status,
      image: productForm.image.trim() || null,
      description: productForm.description.trim() || null,
      is_best_seller: productForm.is_best_seller,
    };

    if (selectedProductImageFile) {
      payload.image_data = await fileToDataUrl(selectedProductImageFile);
    }

    return payload;
  };

  const handleProductImageFileChange = (file: File | null) => {
    setProductError("");

    if (!file) {
      setSelectedProductImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProductError("Vui lòng chọn đúng file ảnh.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setProductError("Ảnh tối đa 4MB.");
      return;
    }

    setSelectedProductImageFile(file);
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductError("");

    setIsSavingProduct(true);

    try {
      const payload = await productPayload();
      if (!payload.name || !payload.category || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        setProductError("Vui lòng nhập đầy đủ tên, danh mục, giá và tồn kho.");
        return;
      }

      const response = await fetch(
        editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`,
        {
          method: editingProductId ? "PUT" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );
      const savedProduct = {
        ...((await response.json()) as AdminProduct & { message?: string }),
        raw_image: payload.image,
      };

      if (!response.ok) {
        throw new Error(savedProduct?.message || "Không thể lưu sản phẩm.");
      }

      setData((current) => {
        if (!current) return current;
        const nextProducts = editingProductId
          ? current.products.map((product) => (product.id === savedProduct.id ? savedProduct : product))
          : [savedProduct, ...current.products];

        return {
          ...current,
          products: nextProducts,
          summary: {
            ...current.summary,
            low_stock: nextProducts.filter((product) => (product.stock ?? 0) <= 10).length,
            best_sellers: nextProducts.filter((product) => product.is_best_seller || product.isBestSeller).length,
          },
        };
      });

      closeProductForm();
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Không thể lưu sản phẩm.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProductId(productId);
    setProductError("");

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể xóa sản phẩm.");
      }

      setData((current) => {
        if (!current) return current;
        const nextProducts = current.products.filter((product) => product.id !== productId);

        return {
          ...current,
          products: nextProducts,
          summary: {
            ...current.summary,
            low_stock: nextProducts.filter((product) => (product.stock ?? 0) <= 10).length,
            best_sellers: nextProducts.filter((product) => product.is_best_seller || product.isBestSeller).length,
          },
        };
      });

      if (editingProductId === productId) {
        closeProductForm();
      }
      setProductPendingDelete(null);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Không thể xóa sản phẩm.");
    } finally {
      setDeletingProductId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f0e7] text-[#7a2130]">
        Đang khởi tạo trang quản trị...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="dc-admin-redesign min-h-screen bg-[#f5f0e7] text-[#28171a]">
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)]">
          <section className="hidden border-r border-[#d6bd7a]/20 bg-[#070607] p-8 text-[#f7efe1] lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 border border-[#d6bd7a]/30 bg-[#d6bd7a]/8 px-4 py-2">
                <span className="flex h-9 w-9 items-center justify-center bg-[#7a2130] text-sm font-black text-[#fffaf2]">ĐC</span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">Đức Chính Jewelry Admin</p>
                  <p className="text-xs text-[#cfc4ad]/70">Bảng điều phối cửa hàng</p>
                </div>
              </div>
              <div className="mt-20 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d6bd7a]">Khu vực quản trị</p>
                <h1 className="mt-5 font-serif text-6xl font-light leading-tight tracking-normal text-[#f7efe1]">
                  Điều hành Đức Chính Jewelry rõ ràng, nhanh và gọn hơn.
                </h1>
                <p className="mt-6 text-base leading-7 text-[#cfc4ad]/78">
                  Theo dõi doanh thu, sản phẩm, đơn hàng và khách hàng trong một không gian quản trị mới.
                </p>
              </div>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {["Doanh thu", "Đơn hàng", "Tồn kho"].map((item) => (
                <div key={item} className="border border-[#d6bd7a]/18 bg-[#0d0b0a] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6bd7a]">{item}</p>
                  <p className="mt-2 text-sm text-[#cfc4ad]/75">Sẵn sàng kiểm tra</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-md border border-[#d6bd7a]/25 bg-[#0d0b0a] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-[#d6bd7a] text-black">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-light tracking-normal text-[#f7efe1]">Đăng nhập quản trị</h1>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6bd7a]">Đức Chính Jewelry Admin</p>
                </div>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Tài khoản
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-black/25 px-4 text-sm text-[#f7efe1] outline-none transition placeholder:text-[#cfc4ad]/45 focus:border-[#d6bd7a]/65 focus:ring-2 focus:ring-[#d6bd7a]/25"
                  placeholder="admin hoặc admin@ducchinhjewelry.local"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Mật khẩu
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-black/25 px-4 text-sm text-[#f7efe1] outline-none transition placeholder:text-[#cfc4ad]/45 focus:border-[#d6bd7a]/65 focus:ring-2 focus:ring-[#d6bd7a]/25"
                  placeholder="Nhập mật khẩu quản trị"
                />
              </label>

              {loginError && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex h-12 w-full items-center justify-center border border-[#d6bd7a] bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-[#f4df9b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </section>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="dc-admin-redesign min-h-screen bg-[#f5f0e7] text-[#28171a]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#d6bd7a]/18 bg-[#070607] px-5 py-6 text-[#f7efe1] lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#d6bd7a] text-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-serif text-2xl font-light tracking-normal">
                ĐỨC CHÍNH <span className="italic text-[#d6bd7a]">JEWELRY</span>
              </p>
              <p className="text-xs text-[#cfc4ad]/65">Quản trị cửa hàng Đức Chính Jewelry</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-[#d6bd7a]/45 bg-[#d6bd7a]/12 text-[#d6bd7a]"
                      : "text-[#cfc4ad]/75 hover:bg-[#d6bd7a]/8 hover:text-[#f7efe1]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="fixed bottom-6 left-5 z-40 w-[15.5rem] border border-[#d6bd7a]/18 bg-[#0d0b0a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#d6bd7a]">
              <Star className="h-4 w-4 fill-[#d6bd7a] text-[#d6bd7a]" />
              Kế hoạch hôm nay
            </div>
            <p className="mt-2 text-sm leading-6 text-[#cfc4ad]/75">
              Kiểm tra {data?.summary.best_sellers ?? 0} sản phẩm bán chạy và các mẫu sắp hết hàng.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#d6bd7a]/18 bg-[#070607]/94 shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <button className="flex h-10 w-10 items-center justify-center border border-[#d6bd7a]/25 bg-black/35 text-[#f7efe1] lg:hidden">
                <PanelLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6bd7a]">
                  {navItems.find((item) => item.id === activeTab)?.label}
                </p>
                <h1 className="truncate font-serif text-2xl font-light tracking-normal text-[#f7efe1] sm:text-3xl">
                  Đức Chính Jewelry Admin
                </h1>
              </div>

              <div className="order-3 flex w-full items-center gap-2 border border-[#d6bd7a]/25 bg-black/30 px-3 py-2 shadow-sm sm:order-none sm:w-80">
                <Search className="h-4 w-4 text-[#d6bd7a]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-[#f7efe1] outline-none placeholder:text-[#cfc4ad]/50"
                  placeholder="Tìm trong mục hiện tại..."
                />
              </div>

              <button className="flex h-10 w-10 items-center justify-center border border-[#d6bd7a]/25 bg-black/30 text-[#f7efe1] transition hover:border-[#d6bd7a]/55 hover:text-[#d6bd7a]">
                <Bell className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 border border-[#d6bd7a]/25 bg-black/30 px-2 text-sm font-medium text-[#f7efe1] transition hover:border-[#d6bd7a]/55 hover:text-[#d6bd7a]"
              >
                <span className="flex h-7 w-7 items-center justify-center bg-[#d6bd7a] text-xs font-bold text-black">
                  AD
                </span>
                <span className="hidden sm:inline">Admin</span>
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "border border-[#d6bd7a]/45 bg-[#d6bd7a]/12 text-[#d6bd7a]"
                        : "text-[#cfc4ad]/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {isLoadingData && (
              <div className="rounded-lg border border-orange-100 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Đang tải dữ liệu từ cơ sở dữ liệu...
              </div>
            )}

            {dataError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {dataError}
              </div>
            )}

            {data && activeTab === "overview" && (
              <OverviewView
                data={data}
                stats={stats}
                revenueBars={revenueBars}
                revenueTicks={revenueTicks}
                selectedRevenue={selectedRevenue}
                revenueMode={revenueMode}
                setRevenueMode={setRevenueMode}
                revenueStartDate={revenueStartDate}
                revenueEndDate={revenueEndDate}
                setRevenueStartDate={setRevenueStartDate}
                setRevenueEndDate={setRevenueEndDate}
              />
            )}

            {data && activeTab === "products" && (
              <ProductsView
                products={filteredProducts}
                orders={data.orders}
                productForm={productForm}
                isProductFormOpen={isProductFormOpen}
                editingProductId={editingProductId}
                productError={productError}
                isSavingProduct={isSavingProduct}
                deletingProductId={deletingProductId}
                productPendingDelete={productPendingDelete}
                selectedProductImageFile={selectedProductImageFile}
                selectedProductImagePreview={selectedProductImagePreview}
                setProductForm={setProductForm}
                openCreateProduct={openCreateProduct}
                openEditProduct={openEditProduct}
                closeProductForm={closeProductForm}
                onProductImageFileChange={handleProductImageFileChange}
                onRequestDeleteProduct={setProductPendingDelete}
                onCloseDeleteProduct={() => setProductPendingDelete(null)}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {data && activeTab === "orders" && (
              <OrdersView
                orders={filteredOrders}
                provinces={provinces}
                updatingOrderId={updatingOrderId}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {data && activeTab === "customers" && <CustomersView users={filteredUsers} orders={data.orders} />}

            {data && activeTab === "reviews" && <ReviewsView reviews={data.reviews || []} />}

            {data && activeTab === "settings" && <SettingsView />}
          </main>
        </div>
      </div>
    </div>
  );
}

function OverviewView({
  data,
  stats,
  revenueBars,
  revenueTicks,
  selectedRevenue,
  revenueMode,
  setRevenueMode,
  revenueStartDate,
  revenueEndDate,
  setRevenueStartDate,
  setRevenueEndDate,
}: {
  data: DashboardData;
  stats: Array<{ label: string; value: string; change: string; icon: typeof CircleDollarSign }>;
  revenueBars: Array<{ label: string; total: number; value: number }>;
  revenueTicks: number[];
  selectedRevenue: number;
  revenueMode: RevenueMode;
  setRevenueMode: (mode: RevenueMode) => void;
  revenueStartDate: string;
  revenueEndDate: string;
  setRevenueStartDate: (value: string) => void;
  setRevenueEndDate: (value: string) => void;
}) {
  const lowStockProducts = useMemo(
    () =>
      [...data.products]
        .filter((product) => (product.stock ?? 0) <= 10 || product.status === "inactive")
        .sort((left, right) => (left.stock ?? 0) - (right.stock ?? 0))
        .slice(0, 5),
    [data.products]
  );

  const handleExportRevenueExcel = () => {
    const revenueOrders = data.orders
      .filter((order) => order.status !== "cancelled")
      .filter((order) => orderDateInRange(order, revenueStartDate, revenueEndDate));

    downloadExcel(`ducchinh-bao-cao-doanh-thu-${revenueStartDate || "start"}-${revenueEndDate || "end"}.xls`, [
      {
        title: "Tổng quan doanh thu",
        rows: revenueOverviewRows(
          data.orders.filter((order) => orderDateInRange(order, revenueStartDate, revenueEndDate)),
          revenueStartDate,
          revenueEndDate
        ),
      },
      {
        title: revenueMode === "day" ? "Doanh thu theo ngày" : "Doanh thu theo tháng",
        rows: [
          ["Kỳ", "Doanh thu"],
          ...revenueBars.map((bar) => [bar.label, bar.total]),
        ],
      },
      {
        title: "Chi tiết đơn hàng",
        rows: orderExportRows(revenueOrders),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 truncate text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-200">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-orange-600 dark:text-orange-300">{stat.change}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <SectionCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Biểu đồ doanh thu</h2>
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Doanh thu (VND)</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] lg:max-w-xl">
              <div className="inline-flex h-8 w-fit items-center rounded-full border border-slate-300 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setRevenueMode("day")}
                  className={`flex h-7 w-11 items-center justify-center rounded-full transition ${
                    revenueMode === "day" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  aria-label="Xem doanh thu theo ngày"
                  title="Theo ngày"
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setRevenueMode("month")}
                  className={`flex h-7 w-11 items-center justify-center rounded-full transition ${
                    revenueMode === "month" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  aria-label="Xem doanh thu theo tháng"
                  title="Theo tháng"
                >
                  <CalendarRange className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Từ ngày
                  <input
                    type="date"
                    value={revenueStartDate}
                    onChange={(event) => setRevenueStartDate(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Đến ngày
                  <input
                    type="date"
                    value={revenueEndDate}
                    onChange={(event) => setRevenueEndDate(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleExportRevenueExcel}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/30 dark:bg-slate-950 dark:text-orange-200 dark:hover:bg-orange-500/10 sm:w-fit"
                title="Xuất báo cáo doanh thu Excel"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng doanh thu trong khoảng chọn</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{formatVND(selectedRevenue)}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {revenueMode === "day" ? "Đang xem theo ngày" : "Đang xem theo tháng"}
            </p>
          </div>

          <div className="mt-6 grid h-[340px] grid-cols-[52px_minmax(0,1fr)] gap-2">
            <div className="flex h-[292px] flex-col justify-between text-right text-xs text-slate-700 dark:text-slate-300">
              {revenueTicks.map((tick, index) => (
                <span key={`${tick}-${index}`}>{formatCompactVND(tick)}</span>
              ))}
            </div>
            <div className="min-w-0">
              <div className="relative h-[292px] border-b border-slate-300 dark:border-slate-700">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="absolute left-0 right-0 border-t border-slate-200 dark:border-slate-800"
                    style={{ top: `${line * 25}%` }}
                  />
                ))}
                {revenueBars.length > 0 ? (
                  <div className="absolute inset-0 flex items-end gap-2 px-2 sm:gap-3 sm:px-4">
                    {revenueBars.map((bar) => (
                      <div key={bar.label} className="group flex h-full min-w-0 flex-1 items-end justify-center">
                        <div
                          className="relative w-full max-w-8 rounded-t-sm bg-orange-300 transition group-hover:bg-orange-500 dark:bg-orange-400"
                          style={{ height: `${bar.value}%` }}
                        >
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-medium text-white shadow group-hover:block">
                            {formatVND(bar.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chưa có doanh thu trong khoảng ngày đã chọn.
                  </div>
                )}
              </div>
              <div className="flex gap-2 px-2 pt-3 sm:px-4">
                {revenueBars.map((bar) => (
                  <div key={bar.label} className="min-w-0 flex-1 truncate text-center text-xs text-slate-700 dark:text-slate-300">
                    {bar.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Kho hàng</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan dữ liệu hiện tại</p>
            </div>
            <Boxes className="h-5 w-5 text-orange-500" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Sản phẩm</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{data.products.length}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Bán chạy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{data.summary.best_sellers}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-orange-100 p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Đơn đã hoàn thành</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{data.summary.orders_completed}</p>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-200" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-100">Cảnh báo tồn kho thấp</p>
                {lowStockProducts.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-amber-900 dark:text-amber-50">{product.name}</span>
                        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-900 dark:text-amber-200">
                          {product.status === "inactive" ? "Tạm ẩn" : `${product.stock ?? 0} còn`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-amber-700 dark:text-amber-100/80">Chưa có sản phẩm nào cần bổ sung gấp.</p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ProductsView({
  products,
  orders,
  productForm,
  isProductFormOpen,
  editingProductId,
  productError,
  isSavingProduct,
  deletingProductId,
  productPendingDelete,
  selectedProductImageFile,
  selectedProductImagePreview,
  setProductForm,
  openCreateProduct,
  openEditProduct,
  closeProductForm,
  onProductImageFileChange,
  onRequestDeleteProduct,
  onCloseDeleteProduct,
  onSaveProduct,
  onDeleteProduct,
}: {
  products: AdminProduct[];
  orders: AdminOrder[];
  productForm: ProductFormState;
  isProductFormOpen: boolean;
  editingProductId: number | null;
  productError: string;
  isSavingProduct: boolean;
  deletingProductId: number | null;
  productPendingDelete: AdminProduct | null;
  selectedProductImageFile: File | null;
  selectedProductImagePreview: string;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  openCreateProduct: () => void;
  openEditProduct: (product: AdminProduct) => void;
  closeProductForm: () => void;
  onProductImageFileChange: (file: File | null) => void;
  onRequestDeleteProduct: (product: AdminProduct) => void;
  onCloseDeleteProduct: () => void;
  onSaveProduct: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteProduct: (productId: number) => void;
}) {
  const [productView, setProductView] = useState<"all" | "bestSeller" | "topSold" | "lowStock" | "outOfStock">("all");
  const imagePreviewSrc = selectedProductImagePreview || productImageUrl(productForm.image);
  const productSales = useMemo(() => {
    return orders.reduce<Record<number, { quantity: number; revenue: number }>>((result, order) => {
      if (order.status === "cancelled") return result;

      (order.items || []).forEach((item) => {
        const productId = item.product_id;
        if (!productId) return;

        result[productId] = {
          quantity: (result[productId]?.quantity || 0) + item.quantity,
          revenue: (result[productId]?.revenue || 0) + item.line_total,
        };
      });

      return result;
    }, {});
  }, [orders]);
  const productsWithStats = useMemo(
    () =>
      products.map((product) => ({
        product,
        sold: productSales[product.id]?.quantity || 0,
        revenue: productSales[product.id]?.revenue || 0,
        isBestSeller: Boolean(product.is_best_seller ?? product.isBestSeller),
        inventoryStatus: productInventoryStatus(product),
      })),
    [productSales, products]
  );
  const bestSellerProducts = productsWithStats.filter((item) => item.isBestSeller);
  const lowStockProducts = productsWithStats.filter((item) => item.inventoryStatus.key === "low");
  const unavailableProducts = productsWithStats.filter((item) =>
    ["out", "hidden"].includes(item.inventoryStatus.key)
  );
  const topSoldProducts = [...productsWithStats]
    .filter((item) => item.sold > 0)
    .sort((left, right) => right.sold - left.sold || right.revenue - left.revenue)
    .slice(0, 3);
  const visibleProductStats = productsWithStats
    .filter((item) => {
      if (productView === "bestSeller") return item.isBestSeller;
      if (productView === "topSold") return item.sold > 0;
      if (productView === "lowStock") return item.inventoryStatus.key === "low";
      if (productView === "outOfStock") return ["out", "hidden"].includes(item.inventoryStatus.key);
      return true;
    })
    .sort((left, right) => {
      if (productView === "topSold") return right.sold - left.sold || right.revenue - left.revenue;
      if (productView === "bestSeller") return right.sold - left.sold;
      if (productView === "lowStock" || productView === "outOfStock") {
        return (left.product.stock ?? 0) - (right.product.stock ?? 0);
      }
      return 0;
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý sản phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi bán chạy, sản phẩm sắp hết, hết hàng và cập nhật tồn kho.</p>
        </div>
        <button
          type="button"
          onClick={openCreateProduct}
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng sản phẩm</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{productsWithStats.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sắp hết hàng</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-200">{lowStockProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hết hàng / tạm ẩn</p>
              <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">{unavailableProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang bán chạy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{bestSellerProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {topSoldProducts.length > 0 ? (
          topSoldProducts.map((item, index) => (
            <SectionCard key={item.product.id} className="p-4">
              <div className="flex gap-3">
                <Image
                  src={productImageUrl(item.product.image)}
                  alt={item.product.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg border border-orange-100 object-cover dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-orange-500">Bán nhiều #{index + 1}</p>
                  <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">{item.product.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Đã bán {item.sold} - {formatVND(item.revenue)}
                  </p>
                </div>
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard className="p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Chưa có dữ liệu bán hàng</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Khi có đơn hàng, sản phẩm bán nhiều nhất sẽ hiện tại đây.</p>
          </SectionCard>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-orange-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {[
          { id: "all", label: "Tất cả", count: productsWithStats.length },
          { id: "bestSeller", label: "Đang bán chạy", count: bestSellerProducts.length },
          { id: "topSold", label: "Bán nhiều nhất", count: productsWithStats.filter((item) => item.sold > 0).length },
          { id: "lowStock", label: "Sắp hết", count: lowStockProducts.length },
          { id: "outOfStock", label: "Hết hàng / tạm ẩn", count: unavailableProducts.length },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setProductView(item.id as typeof productView)}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${
              productView === item.id
                ? "bg-orange-500 text-white"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {productError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {productError}
        </div>
      )}

      {isProductFormOpen && (
        <AdminModal
          title={editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          description="Ảnh có thể nhập dạng products/product-61.jpg hoặc URL ảnh."
          onClose={closeProductForm}
          size="xl"
        >
          <form className="space-y-3" onSubmit={onSaveProduct}>
            <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-orange-100 bg-orange-50/60 dark:border-slate-700 dark:bg-slate-950">
                  <img
                    src={imagePreviewSrc}
                    alt="Xem trước ảnh sản phẩm"
                    className="h-36 w-full object-cover"
                  />
                </div>
                <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                  <Upload className="h-4 w-4" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => onProductImageFileChange(event.target.files?.[0] || null)}
                  />
                </label>
                {selectedProductImageFile && (
                  <button
                    type="button"
                    onClick={() => onProductImageFileChange(null)}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Bỏ ảnh đã chọn
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 xl:col-span-2">
                  Tên sản phẩm
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Nhẫn vàng đính đá"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Giá bán
                  <input
                    type="number"
                    min={0}
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="1200000"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tồn kho
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Danh mục
                  <select
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="Dây chuyền">Dây chuyền</option>
                    <option value="Bông tai">Bông tai</option>
                    <option value="Vòng tay">Vòng tay</option>
                    <option value="Trang sức đôi">Trang sức đôi</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Đường dẫn ảnh
                <input
                  value={productForm.image}
                  onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="products/product-61.jpg"
                />
                  {selectedProductImageFile && (
                    <span className="mt-1 block truncate text-xs text-emerald-600 dark:text-emerald-300">
                      Ảnh mới: {selectedProductImageFile.name}
                    </span>
                  )}
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Trạng thái
                <select
                  value={productForm.status}
                  onChange={(event) => setProductForm((current) => ({ ...current, status: event.target.value as ProductFormState["status"] }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </label>

              <label className="flex items-end gap-2 rounded-md border border-orange-100 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={productForm.is_best_seller}
                  onChange={(event) => setProductForm((current) => ({ ...current, is_best_seller: event.target.checked }))}
                  className="h-4 w-4 accent-orange-500"
                />
                Bán chạy
              </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2 xl:col-span-4">
                  Mô tả
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                    className="mt-1.5 min-h-16 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Mô tả ngắn về sản phẩm"
                  />
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap justify-end gap-2 border-t border-orange-100 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
              <button
                type="button"
                onClick={closeProductForm}
                className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSavingProduct}
                className="h-10 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProduct ? "Đang lưu..." : editingProductId ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {productPendingDelete && (
        <AdminModal title="Xác nhận xóa sản phẩm" onClose={onCloseDeleteProduct} size="md">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
              <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-200" />
              <div>
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-100">
                  Bạn chắc chắn muốn xóa sản phẩm này?
                </p>
                <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-100/80">
                  Sản phẩm {productPendingDelete.name} sẽ bị xóa khỏi danh sách.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onCloseDeleteProduct}
                className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onDeleteProduct(productPendingDelete.id)}
                disabled={deletingProductId === productPendingDelete.id}
                className="h-10 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingProductId === productPendingDelete.id ? "Đang xóa..." : "Xóa sản phẩm"}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProductStats.map(({ product, sold, revenue, isBestSeller, inventoryStatus }) => {
          return (
            <SectionCard key={product.id} className="p-4">
              <div className="flex gap-4">
                <Image
                  src={productImageUrl(product.image)}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-lg border border-orange-100 object-cover dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{product.name}</h3>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${inventoryStatus.tone}`}>
                      {inventoryStatus.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{product.category || "Chưa phân loại"}</p>
                  <p className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatVND(product.price)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {isBestSeller && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                        <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                        Bán chạy
                      </span>
                    )}
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      Đã bán {sold}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {formatVND(revenue)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProduct(product)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-orange-100 px-3 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-200 dark:hover:bg-orange-500/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDeleteProduct(product)}
                      disabled={deletingProductId === product.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-100 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingProductId === product.id ? "Đang xóa" : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
      {visibleProductStats.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {productView === "bestSeller"
            ? "Chưa có sản phẩm nào được đánh dấu bán chạy."
            : productView === "topSold"
              ? "Chưa có sản phẩm nào phát sinh số lượng bán."
              : productView === "lowStock"
                ? "Không có sản phẩm nào sắp hết hàng."
                : productView === "outOfStock"
                  ? "Không có sản phẩm nào hết hàng hoặc tạm ẩn."
              : "Không tìm thấy sản phẩm phù hợp."}
        </SectionCard>
      )}
    </div>
  );
}
function OrdersView({
  orders,
  provinces,
  updatingOrderId,
  onUpdateOrderStatus,
}: {
  orders: AdminOrder[];
  provinces: ProvinceOption[];
  updatingOrderId: number | null;
  onUpdateOrderStatus: (orderId: number, status: AdminOrder["status"]) => void;
}) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<AdminOrder["status"] | "all">("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [orderProvinceCode, setOrderProvinceCode] = useState("all");
  const statusFilters: { id: AdminOrder["status"] | "all"; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Cần xác nhận" },
    { id: "processing", label: "Đang xử lý" },
    { id: "shipping", label: "Đang giao" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];
  const statusCounts = statusFilters.reduce<Record<string, number>>((result, item) => {
    result[item.id] =
      item.id === "all" ? orders.length : orders.filter((order) => order.status === item.id).length;
    return result;
  }, {});
  const localOrderQuery = orderQuery.trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) return false;
    if (!orderDateInRange(order, orderStartDate, orderEndDate)) return false;
    if (orderProvinceCode !== "all" && orderProvinceCode !== orderProvinceCodeForOrder(order)) return false;

    if (!localOrderQuery) return true;

    return [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.recipient_phone,
      order.customer_address,
      order.recipient_address,
      orderProvinceName(order),
    ]
      .filter(Boolean)
      .some((item) => item?.toLowerCase().includes(localOrderQuery));
  });
  const visibleRevenue = visibleOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const handleExportOrdersExcel = () => {
    downloadExcel(`ducchinh-don-hang-${toDateInputValue(new Date())}.xls`, [
      {
        title: "Danh sách đơn hàng",
        rows: orderExportRows(visibleOrders),
      },
      {
        title: "Tổng quan bộ lọc",
        rows: revenueOverviewRows(visibleOrders, orderStartDate, orderEndDate),
      },
    ]);
  };
  const handleExportOrderRevenueExcel = () => {
    const revenueOrders = visibleOrders.filter((order) => order.status !== "cancelled");
    const statusBreakdown = statusFilters
      .filter((item) => item.id !== "all")
      .map((item) => [
        item.label,
        visibleOrders.filter((order) => order.status === item.id).length,
        visibleOrders
          .filter((order) => order.status === item.id && order.status !== "cancelled")
          .reduce((sum, order) => sum + order.total, 0),
      ]);
    const paymentBreakdown = Object.values(
      revenueOrders.reduce<Record<string, { method: string; count: number; total: number }>>((result, order) => {
        const key = order.payment_method || "unknown";
        result[key] = {
          method: key.toUpperCase(),
          count: (result[key]?.count || 0) + 1,
          total: (result[key]?.total || 0) + order.total,
        };
        return result;
      }, {})
    );

    downloadExcel(`ducchinh-bao-cao-doanh-thu-don-hang-${toDateInputValue(new Date())}.xls`, [
      {
        title: "Tổng quan doanh thu",
        rows: revenueOverviewRows(visibleOrders, orderStartDate, orderEndDate),
      },
      {
        title: "Doanh thu theo trạng thái",
        rows: [["Trạng thái", "Số đơn", "Doanh thu"], ...statusBreakdown],
      },
      {
        title: "Doanh thu theo thanh toán",
        rows: [
          ["Phương thức", "Số đơn", "Doanh thu"],
          ...paymentBreakdown.map((item) => [item.method, item.count, item.total]),
        ],
      },
      {
        title: "Chi tiết đơn tính doanh thu",
        rows: orderExportRows(revenueOrders),
      },
    ]);
  };
  const clearOrderFilters = () => {
    setOrderQuery("");
    setOrderStartDate("");
    setOrderEndDate("");
    setOrderStatusFilter("all");
    setOrderProvinceCode("all");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý đơn hàng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật trạng thái để khách hàng theo dõi và đánh giá khi đã nhận hàng.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOrderStatusFilter(item.id)}
            className={`rounded-lg border p-3 text-left transition ${
              orderStatusFilter === item.id
                ? "border-orange-300 bg-orange-100 text-orange-800 shadow-sm dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-100"
                : "border-orange-100 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="block text-xs font-semibold uppercase">{item.label}</span>
            <span className="mt-1 block text-xl font-semibold">{statusCounts[item.id] || 0}</span>
          </button>
        ))}
      </div>

      <SectionCard className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_180px_180px_auto] lg:items-end">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tìm đơn hàng
            <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-orange-100 bg-orange-50/60 px-3 dark:border-slate-700 dark:bg-slate-950">
              <Search className="h-4 w-4 text-orange-500" />
              <input
                value={orderQuery}
                onChange={(event) => setOrderQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Email, số điện thoại, mã đơn..."
              />
            </div>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tỉnh/Thành
            <select
              value={orderProvinceCode}
              onChange={(event) => setOrderProvinceCode(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="all">Tất cả tỉnh/thành</option>
              <option value="">Chưa xác định</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.full_name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Từ ngày
            <input
              type="date"
              value={orderStartDate}
              onChange={(event) => setOrderStartDate(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Đến ngày
            <input
              type="date"
              value={orderEndDate}
              onChange={(event) => setOrderEndDate(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <button
            type="button"
            onClick={clearOrderFilters}
            className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Xóa lọc
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Đơn đang hiển thị</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Doanh thu trong bộ lọc</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{formatVND(visibleRevenue)}</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Đơn đã hoàn thành</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              {visibleOrders.filter((order) => order.status === "completed").length}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-orange-100 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            File xuất theo đúng bộ lọc trạng thái, ngày và tỉnh/thành hiện tại.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleExportOrdersExcel}
              disabled={visibleOrders.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500/30 dark:bg-slate-950 dark:text-orange-200 dark:hover:bg-orange-500/10"
              title="Xuất danh sách đơn hàng Excel"
            >
              <Download className="h-4 w-4" />
              Xuất đơn hàng
            </button>
            <button
              type="button"
              onClick={handleExportOrderRevenueExcel}
              disabled={visibleOrders.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Xuất báo cáo doanh thu Excel"
            >
              <CircleDollarSign className="h-4 w-4" />
              Báo cáo doanh thu
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleOrders.map((order) => {
          const isUpdating = updatingOrderId === order.id;
          const nextAction =
            order.status === "pending"
              ? { label: "Xác nhận đơn", loading: "Đang xác nhận...", status: "processing" }
              : order.status === "processing"
                ? { label: "Chuyển sang đang giao", loading: "Đang cập nhật...", status: "shipping" }
                : order.status === "shipping"
                  ? { label: "Đánh dấu đã giao", loading: "Đang hoàn tất...", status: "completed" }
                  : null;

          return (
          <SectionCard key={order.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-950 dark:text-white">{order.order_number}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{order.customer_name}</p>
                <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                  {order.customer_email} - {order.customer_phone}
                </p>
                <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-200">
                  Giao tới: {orderProvinceName(order)}
                  {(order.recipient_ward_name || order.customer_ward_name) ? ` - ${order.recipient_ward_name || order.customer_ward_name}` : ""}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {order.items?.map((item) => `${item.product_name} x${item.quantity}`).join(", ") || "Chưa có sản phẩm"}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{formatVND(order.total)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Thanh toán: {order.payment_method?.toUpperCase()} - {order.payment_status}
              </span>
              {nextAction ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "cancelled")}
                    disabled={isUpdating}
                    className="rounded-md border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/10"
                  >
                    {isUpdating ? "Đang hủy..." : "Hủy đơn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, nextAction.status)}
                    disabled={isUpdating}
                    className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdating ? nextAction.loading : nextAction.label}
                  </button>
                </div>
              ) : (
                <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {order.status === "completed" ? "Đã giao cho khách" : "Đã đóng"}
                </span>
              )}
            </div>
          </SectionCard>
          );
        })}
      </div>
      {visibleOrders.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không có đơn hàng nào khớp với bộ lọc hiện tại.
        </SectionCard>
      )}
    </div>
  );
}

function CustomersView({ users, orders }: { users: AdminUser[]; orders: AdminOrder[] }) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [customerSort, setCustomerSort] = useState<"orders" | "spent" | "recent">("orders");
  const customerStats = useMemo(
    () =>
      users.map((user) => {
        const userOrders = orders.filter((order) => order.customer_email?.toLowerCase() === user.email?.toLowerCase());
        const validOrders = userOrders.filter((order) => order.status !== "cancelled");
        const orderCount = validOrders.length;
        const orderTotal = validOrders.reduce((sum, order) => sum + order.total, 0);
        const itemCount = validOrders.reduce(
          (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + item.quantity, 0),
          0
        );
        const lastOrderAt = userOrders
          .map((order) => new Date(order.created_at).getTime())
          .filter((value) => !Number.isNaN(value))
          .sort((left, right) => right - left)[0] || 0;

        return { user, userOrders, orderCount, orderTotal, itemCount, lastOrderAt };
      }),
    [orders, users]
  );
  const sortedCustomerStats = useMemo(() => {
    return [...customerStats].sort((left, right) => {
      if (customerSort === "spent") return right.orderTotal - left.orderTotal;
      if (customerSort === "recent") return right.lastOrderAt - left.lastOrderAt;
      return right.orderCount - left.orderCount || right.orderTotal - left.orderTotal;
    });
  }, [customerSort, customerStats]);
  const topCustomers = useMemo(
    () =>
      [...customerStats]
        .filter((item) => item.orderCount > 0)
        .sort((left, right) => right.orderCount - left.orderCount || right.orderTotal - left.orderTotal)
        .slice(0, 3),
    [customerStats]
  );
  const selectedUserOrders = selectedUser
    ? orders.filter((order) => order.customer_email?.toLowerCase() === selectedUser.email?.toLowerCase())
    : [];
  const selectedUserTotal = selectedUserOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý khách hàng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Xem khách mua nhiều nhất, tổng chi tiêu và lịch sử đơn hàng.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {topCustomers.length > 0 ? (
          topCustomers.map((item, index) => (
            <SectionCard key={item.user.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-orange-500">Top {index + 1}</p>
                    <h3 className="truncate font-semibold text-slate-950 dark:text-white">{item.user.name}</h3>
                  </div>
                </div>
                <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                  {item.orderCount} đơn
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tổng chi tiêu</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">{formatVND(item.orderTotal)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sản phẩm</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">{item.itemCount}</p>
                </div>
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard className="p-5 text-sm text-slate-500 dark:text-slate-400 lg:col-span-3">
            Chưa có khách hàng nào phát sinh đơn hàng.
          </SectionCard>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-orange-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sắp xếp danh sách khách hàng</span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "orders", label: "Mua nhiều nhất" },
            { id: "spent", label: "Chi tiêu cao nhất" },
            { id: "recent", label: "Mua gần đây" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCustomerSort(option.id as typeof customerSort)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                customerSort === option.id
                  ? "bg-orange-500 text-white"
                  : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedCustomerStats.map(({ user, orderCount, orderTotal, itemCount, lastOrderAt }) => {
          return (
            <SectionCard key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
                  {user.name?.slice(0, 2).toUpperCase() || "KH"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-950 dark:text-white">{user.name}</h3>
                  <p className="break-words text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.phone || "Chưa có SĐT"}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.province_name || user.address || "Chưa có địa chỉ"}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-orange-50 px-2 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                      {orderCount} đơn hàng
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {formatVND(orderTotal)}
                    </span>
                    <span className="rounded-md bg-sky-50 px-2 py-1 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                      {itemCount} sản phẩm
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {lastOrderAt ? `Mua gần nhất ${formatDateTime(new Date(lastOrderAt).toISOString())}` : formatDateTime(user.created_at)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-orange-100 px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-200 dark:hover:bg-orange-500/10"
                  >
                    <Eye className="h-4 w-4" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
      {users.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không tìm thấy khách hàng phù hợp.
        </SectionCard>
      )}

      {selectedUser && (
        <AdminModal
          title={`Khách hàng: ${selectedUser.name}`}
          description="Thông tin liên hệ và lịch sử đơn hàng đã mua."
          onClose={() => setSelectedUser(null)}
          size="xl"
        >
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.email}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Số điện thoại</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.phone || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Tỉnh/Thành</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.province_name || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Phường/Xã</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.ward_name || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Số đơn đã mua</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUserOrders.length} đơn</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Tổng giá trị</p>
                <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatVND(selectedUserTotal)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-950 dark:text-white">Chi tiết đơn hàng</h4>
              {selectedUserOrders.length > 0 ? (
                selectedUserOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-orange-100 p-4 dark:border-slate-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950 dark:text-white">{order.order_number}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.created_at)} - {order.payment_method?.toUpperCase()} - {order.payment_status}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Giao tới: {order.recipient_address || order.customer_address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-300">{formatVND(order.total)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Giá trị đơn hàng</p>
                      </div>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                      {(order.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1fr)_72px_120px] gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 dark:border-slate-700"
                        >
                          <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{item.product_name}</span>
                          <span className="text-center text-slate-500 dark:text-slate-400">x{item.quantity}</span>
                          <span className="text-right font-semibold text-slate-900 dark:text-white">{formatVND(item.line_total)}</span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Đơn hàng chưa có sản phẩm.</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-orange-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Khách hàng này chưa có đơn hàng nào.
                </div>
              )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

function ReviewsView({ reviews }: { reviews: AdminReview[] }) {
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
  const filteredReviews =
    ratingFilter === "all" ? reviews : reviews.filter((review) => review.rating === ratingFilter);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Đánh giá sản phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dữ liệu đánh giá thật từ khách hàng đã mua và nhận hàng.</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="font-semibold text-slate-950 dark:text-white">{reviews.length}</span>
          <span className="text-slate-500 dark:text-slate-400"> đánh giá</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-semibold text-orange-600 dark:text-orange-300">
            {averageRating ? averageRating.toFixed(1) : "0.0"} sao trung bình
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-orange-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setRatingFilter("all")}
          className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${
            ratingFilter === "all"
              ? "bg-orange-500 text-white"
              : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Tất cả ({reviews.length})
        </button>
        {ratingCounts.map(({ rating, count }) => (
          <button
            key={rating}
            type="button"
            onClick={() => setRatingFilter(rating)}
            className={`flex shrink-0 items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              ratingFilter === rating
                ? "bg-orange-500 text-white"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {rating}
            <Star className={`h-4 w-4 ${ratingFilter === rating ? "fill-white text-white" : "fill-orange-400 text-orange-400"}`} />
            ({count})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {filteredReviews.map((review) => (
          <SectionCard key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-950 dark:text-white">{review.user?.name || "Khách hàng"}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{review.product?.name || "Sản phẩm"}</p>
                {review.order?.order_number && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Đơn {review.order.order_number}</p>
                )}
              </div>
              <span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                Đã gửi
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${index < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {review.content || "Khách hàng chỉ chấm sao, chưa để lại nội dung."}
            </p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(review.created_at)}</p>
          </SectionCard>
        ))}
      </div>
      {reviews.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có đánh giá nào từ khách hàng.
        </SectionCard>
      )}
      {reviews.length > 0 && filteredReviews.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không có đánh giá nào ở mức {ratingFilter} sao.
        </SectionCard>
      )}
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Cài đặt</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Khu vực demo cho cấu hình quản trị.</p>
      </div>
      <SectionCard className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Tài khoản quản trị</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">admin</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Trạng thái hệ thống</p>
            <p className="mt-1 text-sm text-emerald-600">Đang hoạt động</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
