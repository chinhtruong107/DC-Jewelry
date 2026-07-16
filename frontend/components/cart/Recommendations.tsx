import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Recommendations() {
  return (
    <section className="mt-14 border border-[#d6bd7a]/18 bg-[#0d0b0a] px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d6bd7a]">Still browsing</p>
      <h2 className="mt-3 font-serif text-3xl font-light text-[#f7efe1]">Có thể bạn sẽ thích</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#cfc4ad]/75">Khám phá thêm những thiết kế phù hợp với phong cách của bạn.</p>
      <Button variant="outline" asChild className="mt-6 rounded-none border-[#d6bd7a]/35 bg-transparent px-7 text-xs font-bold uppercase tracking-[0.2em] text-[#f7efe1] hover:bg-[#d6bd7a] hover:text-black"><Link href="/">Xem sản phẩm</Link></Button>
    </section>
  );
}
