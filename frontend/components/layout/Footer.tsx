"use client";

import { ArrowRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { user, isAuthReady } = useAuth();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const showNewsletter = isAuthReady && !user && pathname !== "/checkout";
  const handleNewsletterSubmit = (event: React.FormEvent) => { event.preventDefault(); setEmail(""); };

  const links = [
    { title: "Collections", items: [["/category/day-chuyen", "Dây chuyền"], ["/category/bong-tai", "Bông tai"], ["/category/vong-tay", "Vòng tay"]] },
    { title: "Client care", items: [["/contact", "Đặt lịch tư vấn"], ["/cart", "Giỏ hàng"], ["/profile", "Tài khoản"]] },
  ];

  return (
    <footer className="editorial-footer bg-[#681a28] text-[#fff9ef]">
      {showNewsletter && (
        <div className="border-b border-white/15">
          <div className="mx-auto grid max-w-[1600px] gap-8 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:px-16 xl:px-24">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#e7c7b4]">Private access</p><h3 className="mt-4 max-w-2xl font-serif text-4xl font-normal leading-tight sm:text-5xl">Những câu chuyện mới,<br /><span className="italic text-[#e9c6b2]">gửi riêng đến bạn.</span></h3></div>
            <form onSubmit={handleNewsletterSubmit} className="flex border-b border-white/45 pb-3">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email của bạn" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55" required />
              <button type="submit" className="grid h-10 w-10 place-items-center rounded-full bg-[#fff9ef] text-[#681a28] transition hover:translate-x-1" aria-label="Đăng ký"><ArrowRight className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <Link href="/" className="inline-block"><span className="block font-serif text-5xl tracking-[-0.05em]">Đức Chính</span><span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.5em] text-[#e7c7b4]">Fine Jewelry</span></Link>
            <p className="mt-8 max-w-md text-sm leading-7 text-white/68">Những thiết kế mang tinh thần đương đại, được chọn lựa để đồng hành cùng bạn qua nhiều thế hệ.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/70"><span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Hà Nội</span><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> 0389794445</span><span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> hello@ducchinhjewelry.vn</span></div>
          </div>
          {links.map((section) => <div key={section.title}><h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#e7c7b4]">{section.title}</h4><ul className="mt-6 space-y-4">{section.items.map(([href, label]) => <li key={label}><Link href={href} className="font-serif text-xl text-white/78 transition hover:text-white">{label}</Link></li>)}</ul></div>)}
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-white/15 pt-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Đức Chính Jewelry</span><span className="inline-flex items-center gap-2"><Instagram className="h-3.5 w-3.5" /> Instagram</span><span>Saigon · Vietnam</span>
        </div>
      </div>
    </footer>
  );
}
