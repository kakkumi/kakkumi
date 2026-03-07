"use client";

import { useEffect, useState, startTransition } from "react";
import Header from "../components/Header";
import Link from "next/link";

export type SavedTheme = {
  id: string;
  name: string;
  savedAt: string;
  previewImageUrl: string | null; // base64 or null
  os: "ios" | "android";
};

export default function MyThemesPage() {
  const [themes, setThemes] = useState<SavedTheme[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kakkumi_my_themes");
      if (raw) {
        const parsed = JSON.parse(raw) as SavedTheme[];
        startTransition(() => { setThemes(parsed); });
      }
    } catch {
      // ignore
    }
    startTransition(() => { setLoaded(true); });
  }, []);

  const handleDelete = (id: string) => {
    const updated = themes.filter((t) => t.id !== id);
    setThemes(updated);
    localStorage.setItem("kakkumi_my_themes", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f8" }}>
      <Header />

      <div className="mx-auto max-w-[1100px] px-6 py-16">
        {/* 헤더 */}
        <div className="mb-14">
          <h1 className="text-[32px] font-bold tracking-tight" style={{ color: "#1a1a1a" }}>
            내 테마
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: "#8e8e93" }}>
            카꾸미에서 직접 만든 테마들이 여기에 저장돼요
          </p>
        </div>

        {!loaded ? null : themes.length === 0 ? (
          /* ── 빈 상태 ── */
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,149,0,0.08)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[17px] font-semibold" style={{ color: "#1a1a1a" }}>아직 저장된 테마가 없어요</p>
              <p className="text-[14px]" style={{ color: "#8e8e93" }}>테마 만들기에서 테마를 만들고 저장해보세요</p>
            </div>
            <Link
              href="/create"
              className="mt-1 px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all hover:opacity-85 active:scale-95"
              style={{ background: "rgb(255,149,0)", color: "#fff" }}
            >
              테마 만들기
            </Link>
          </div>
        ) : (
          /* ── 테마 목록 ── */
          <div>
            {/* 상단 우측 */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-[13px]" style={{ color: "#8e8e93" }}>
                총 {themes.length}개
              </span>
              <Link
                href="/create"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-70 active:scale-95"
                style={{ background: "transparent", color: "rgb(255,149,0)" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                새 테마 만들기
              </Link>
            </div>

            <div
              className="grid gap-x-8 gap-y-12"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
            >
              {themes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme, onDelete }: { theme: SavedTheme; onDelete: (id: string) => void }) {
  const [hover, setHover] = useState(false);

  const formattedDate = (() => {
    try {
      return new Date(theme.savedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative" }}
    >
      {/* 미리보기 이미지 */}
      <div
        className="w-full rounded-2xl overflow-hidden transition-transform duration-300"
        style={{
          aspectRatio: "9/16",
          background: "rgba(0,0,0,0.05)",
          transform: hover ? "translateY(-3px)" : "translateY(0)",
        }}
      >
        {theme.previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.previewImageUrl}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,149,0,0.05)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,149,0,0.4)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.2)" }}>미리보기 없음</span>
          </div>
        )}
      </div>

      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={() => onDelete(theme.id)}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: hover ? 1 : 0,
          backdropFilter: "blur(6px)",
        }}
        title="삭제"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* OS 배지 */}
      <div
        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
        style={{
          background: theme.os === "ios" ? "rgba(255,149,0,0.85)" : "rgba(74,123,247,0.85)",
          color: "#fff",
          backdropFilter: "blur(6px)",
        }}
      >
        {theme.os === "ios" ? "iOS" : "Android"}
      </div>

      {/* 테마 이름 + 날짜 */}
      <div className="mt-3 px-0.5">
        <p
          className="text-[14px] font-semibold truncate"
          style={{ color: "#1a1a1a" }}
        >
          {theme.name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#aeaeb2" }}>
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
