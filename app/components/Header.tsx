import Image from "next/image";
import Link from "next/link";
import AuthStatus from "./AuthStatus";

export default function Header() {
    return (
        <header
            className="sticky top-0 z-50 flex items-center justify-between px-6 py-0 shrink-0"
            style={{
                background: "rgba(236, 236, 240, 0.72)",
                backdropFilter: "blur(40px) saturate(200%)",
                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
                height: 48,
            }}
        >
            <Link href="/">
                <Image src="/카꾸미.png" alt="카꾸미" width={110} height={44} quality={100} unoptimized style={{ objectFit: "contain" }} />
            </Link>
            <nav className="flex items-center gap-6">
                <Link href="/store" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 스토어</Link>
                <Link href="/create" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 만들기</Link>
                <Link href="/store/register" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 등록</Link>
                <Link href="/support" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>고객센터</Link>
                <div className="w-[1px] h-5 bg-[rgba(0,0,0,0.25)]" aria-hidden="true" />
                <AuthStatus />
            </nav>
        </header>
    );
}
