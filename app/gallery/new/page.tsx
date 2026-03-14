"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";

type StoreTheme = { id: string; title: string; thumbnailUrl: string | null };

export default function GalleryNewPage() {
    const router = useRouter();

    const [themeName, setThemeName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 스토어 링크 관련
    const [linkMode, setLinkMode] = useState<"none" | "select">("none");
    const [storeThemes, setStoreThemes] = useState<StoreTheme[]>([]);
    const [selectedThemeId, setSelectedThemeId] = useState<string>("");
    const [loadingThemes, setLoadingThemes] = useState(false);

    useEffect(() => {
        // 로그인 확인
        fetch("/api/auth/session").then((r) => r.json()).then((d) => {
            if (!d?.session) router.replace("/gallery");
        }).catch(() => router.replace("/gallery"));
    }, [router]);

    useEffect(() => {
        if (linkMode !== "select") return;
        setLoadingThemes(true);
        fetch("/api/themes/my-store-themes")
            .then((r) => r.json())
            .then((d) => setStoreThemes(d.themes ?? []))
            .catch(() => {})
            .finally(() => setLoadingThemes(false));
    }, [linkMode]);

    const handleImages = (files: FileList | null) => {
        if (!files) return;
        const remaining = 3 - images.length;
        const arr = Array.from(files).slice(0, remaining);
        const newPreviews = arr.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...arr].slice(0, 3));
        setPreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
    };

    const removeImage = (i: number) => {
        URL.revokeObjectURL(previews[i]);
        setImages((prev) => prev.filter((_, idx) => idx !== i));
        setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!themeName.trim()) { setError("테마 이름을 입력해주세요."); return; }
        if (images.length === 0) { setError("이미지를 1장 이상 업로드해주세요."); return; }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("themeName", themeName.trim());
            if (description.trim()) fd.append("description", description.trim());
            images.forEach((f) => fd.append("images", f));
            if (linkMode === "select" && selectedThemeId) {
                fd.append("themeId", selectedThemeId);
            }

            const res = await fetch("/api/gallery", { method: "POST", body: fd });
            const data = await res.json() as { ok?: boolean; postId?: string; error?: string };

            if (!res.ok) {
                setError(data.error ?? "업로드에 실패했습니다.");
                return;
            }

            router.replace(`/gallery/${data.postId}`);
        } catch {
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <div className="flex-1 max-w-[600px] mx-auto w-full px-5 pt-12 pb-24">
                {/* 헤더 */}
                <div className="mb-10">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>Gallery</p>
                    <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>테마 소개하기</h1>
                    <p className="text-[14px] mt-1" style={{ color: "#78716c" }}>직접 만든 테마를 갤러리에 소개해보세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-10">

                    {/* 이미지 업로드 */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                            <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                                미리보기 이미지 <span style={{ color: "#FF3B30" }}>*</span>
                            </p>
                            <span className="text-[11px]" style={{ color: "#d6d3d1" }}>최대 3장</span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {previews.map((src, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0"
                                    style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                    <Image src={src} alt="" fill className="object-cover" />
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(0,0,0,0.55)" }}>
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {previews.length < 3 && (
                                <label className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer shrink-0 transition-opacity hover:opacity-70"
                                    style={{ border: "1.5px dashed #e7e5e4", background: "#fafaf9" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    <span className="text-[10px] mt-1.5" style={{ color: "#d6d3d1" }}>사진 추가</span>
                                    <input type="file" accept="image/*" multiple className="hidden"
                                        onChange={(e) => handleImages(e.target.files)} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 테마 이름 */}
                    <div className="flex flex-col gap-2" style={{ borderBottom: "1px solid #e7e5e4", paddingBottom: 14 }}>
                        <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                            테마 이름 <span style={{ color: "#FF3B30" }}>*</span>
                        </label>
                        <input
                            value={themeName}
                            onChange={(e) => setThemeName(e.target.value)}
                            placeholder="테마 이름을 입력하세요"
                            maxLength={50}
                            className="w-full text-[16px] outline-none bg-transparent placeholder:text-[#d6d3d1]"
                            style={{ color: "#1c1917" }}
                        />
                    </div>

                    {/* 설명 */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                                소개 <span className="normal-case font-normal">(선택)</span>
                            </label>
                            <span className="text-[11px]" style={{ color: description.length > 180 ? "#ef4444" : "#d6d3d1" }}>
                                {description.length} / 200
                            </span>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="테마에 대해 자유롭게 소개해주세요"
                            rows={4}
                            maxLength={200}
                            className="w-full text-[14px] outline-none bg-transparent resize-none leading-relaxed placeholder:text-[#d6d3d1]"
                            style={{ color: "#1c1917", borderBottom: "1px solid #e7e5e4", paddingBottom: 14 }}
                        />
                    </div>

                    {/* 스토어 링크 */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                            <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                                스토어 링크 <span className="normal-case font-normal">(선택)</span>
                            </label>
                        </div>
                        <p className="text-[12px]" style={{ color: "#a8a29e" }}>
                            내가 등록한 스토어 테마와 연결하면 방문자가 바로 구경할 수 있어요.
                        </p>
                        <div className="flex items-center gap-1.5">
                            {(["none", "select"] as const).map((m) => (
                                <button key={m} type="button"
                                    onClick={() => setLinkMode(m)}
                                    className="px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-150"
                                    style={{
                                        background: linkMode === m ? "rgb(74,123,247)" : "rgba(0,0,0,0.05)",
                                        color: linkMode === m ? "#fff" : "#6e6e73",
                                        fontWeight: linkMode === m ? 700 : 400,
                                    }}>
                                    {m === "none" ? "연결 안 함" : "내 스토어 테마 선택"}
                                </button>
                            ))}
                        </div>

                        {linkMode === "select" && (
                            <div className="mt-1">
                                {loadingThemes ? (
                                    <p className="text-[13px]" style={{ color: "#a8a29e" }}>불러오는 중…</p>
                                ) : storeThemes.length === 0 ? (
                                    <p className="text-[13px]" style={{ color: "#a8a29e" }}>
                                        등록된 스토어 테마가 없어요.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {storeThemes.map((t) => (
                                            <label key={t.id}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                                                style={{
                                                    background: selectedThemeId === t.id ? "rgba(74,123,247,0.06)" : "rgba(0,0,0,0.025)",
                                                    border: `1.5px solid ${selectedThemeId === t.id ? "rgba(74,123,247,0.3)" : "transparent"}`,
                                                }}>
                                                <input
                                                    type="radio"
                                                    name="storeTheme"
                                                    value={t.id}
                                                    checked={selectedThemeId === t.id}
                                                    onChange={() => setSelectedThemeId(t.id)}
                                                    className="hidden"
                                                />
                                                {t.thumbnailUrl ? (
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                        <Image src={t.thumbnailUrl} alt={t.title} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg shrink-0"
                                                        style={{ background: "rgba(0,0,0,0.06)" }} />
                                                )}
                                                <span className="text-[14px] font-medium" style={{ color: "#1c1917" }}>{t.title}</span>
                                                {selectedThemeId === t.id && (
                                                    <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6L9 17l-5-5"/>
                                                    </svg>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 에러 */}
                    {error && (
                        <div className="px-4 py-3 rounded-xl text-[13px]"
                            style={{ background: "rgba(255,59,48,0.06)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.15)" }}>
                            {error}
                        </div>
                    )}

                    {/* 버튼 */}
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => router.back()}
                            className="px-5 py-2.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-60"
                            style={{ background: "rgba(0,0,0,0.05)", color: "#78716c" }}>
                            취소
                        </button>
                        <button type="submit"
                            disabled={submitting || !themeName.trim() || images.length === 0}
                            className="px-6 py-2.5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
                            style={{ background: "#1c1917", color: "#fafaf9" }}>
                            {submitting ? "업로드 중…" : "갤러리에 올리기"}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
