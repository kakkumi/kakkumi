'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["감성", "심플", "일러스트", "다크모드", "캐릭터", "패턴"];
const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원"];

export default function RegisterForm({ authorName }: { authorName: string }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [colors, setColors] = useState<string[]>(["", ""]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [themeFile, setThemeFile] = useState<File | null>(null);
    const [androidFile, setAndroidFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const gradient = useMemo(() => {
        const filled = colors.filter(c => c !== "");
        if (filled.length === 0) return "linear-gradient(135deg, #e5e5e5, #f0f0f0)";
        if (filled.length === 1) return `linear-gradient(135deg, ${filled[0]}, ${filled[0]})`;
        return `linear-gradient(135deg, ${filled.join(", ")})`;
    }, [colors]);

    const handleColorChange = (index: number, value: string) => {
        const next = [...colors];
        next[index] = value;
        setColors(next);
    };

    const addColor = () => {
        if (colors.length >= 5) return;
        setColors([...colors, ""]);
    };

    const removeColor = (index: number) => {
        if (colors.length > 2) {
            // 3개 이상이면 슬롯 자체를 삭제
            setColors(colors.filter((_, i) => i !== index));
        } else {
            // 2개일 때는 슬롯은 유지하고 빈값으로 초기화
            const next = [...colors];
            next[index] = "";
            setColors(next);
        }
    };

    const handlePreviewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPreviewFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !category || !description || !previewFile || (!themeFile && !androidFile)) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#FFE500" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>등록 신청 완료!</h2>
                    <p className="text-[14px]" style={{ color: "#8e8e93" }}>검토 후 스토어에 등록됩니다. 보통 1~2일 소요돼요.</p>
                </div>
                <button
                    onClick={() => router.push("/store")}
                    className="mt-2 px-8 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                    style={{ background: "#FFE500", color: "#3A1D1D" }}
                >
                    스토어 보러가기
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

            {/* ── 좌측: 폼 ── */}
            <div className="flex flex-col gap-3">

                {/* 테마 이름 */}
                <Row label="테마 이름" required>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="테마 이름을 입력해주세요"
                            maxLength={30}
                            required
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                            style={{ background: "rgba(0,0,0,0.04)", border: "1.5px solid transparent", color: "#1c1c1e" }}
                            onFocus={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)"}
                            onBlur={e => e.currentTarget.style.borderColor = "transparent"}
                        />
                        <span className="absolute bottom-3 right-4 text-[11px]" style={{ color: "#b0b0b5" }}>{name.length}/30</span>
                    </div>
                </Row>

                {/* 테마 설명 */}
                <Row label="테마 설명" required>
                    <div className="relative">
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="어떤 분위기의 테마인지 알려주세요"
                            rows={4}
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all resize-none"
                            style={{ background: "rgba(0,0,0,0.04)", border: "1.5px solid transparent", color: "#1c1c1e" }}
                            onFocus={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)"}
                            onBlur={e => e.currentTarget.style.borderColor = "transparent"}
                        />
                        <span className="absolute bottom-3 right-4 text-[11px]" style={{ color: "#b0b0b5" }}>{description.length}/200</span>
                    </div>
                </Row>

                {/* 구분선 */}
                <div className="my-1 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

                {/* 카테고리 */}
                <Row label="카테고리" required>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                                style={{
                                    background: category === cat ? "#1c1c1e" : "rgba(0,0,0,0.05)",
                                    color: category === cat ? "#fff" : "#3a3a3c",
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </Row>

                {/* 가격 */}
                <Row label="가격" required>
                    <div className="flex flex-wrap gap-2">
                        {PRICE_OPTIONS.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPrice(p)}
                                className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                                style={{
                                    background: price === p ? "#1c1c1e" : "rgba(0,0,0,0.05)",
                                    color: price === p ? "#fff" : "#3a3a3c",
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </Row>

                {/* 구분선 */}
                <div className="my-1 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

                {/* 대표 색상 */}
                <Row label="대표 색상" required>
                    <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                        {/* 색상 목록 */}
                        {colors.length > 0 ? (
                            <div className="flex flex-wrap items-end gap-6">
                                {colors.map((c, i) => (
                                    <div key={i} className="relative flex flex-col items-center gap-1.5 group">
                                        <div className="relative">
                                            {c === "" ? (
                                                /* 미선택 슬롯 */
                                                <div
                                                    className="w-10 h-10 rounded-full border-[2px] border-dashed flex items-center justify-center"
                                                    style={{ borderColor: "rgba(0,0,0,0.2)", background: "rgba(0,0,0,0.03)" }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                /* 선택된 슬롯 */
                                                <div
                                                    className="w-10 h-10 rounded-full shadow-md"
                                                    style={{ backgroundColor: c }}
                                                />
                                            )}
                                            <input
                                                type="color"
                                                value={c === "" ? "#ffffff" : c}
                                                onChange={e => handleColorChange(i, e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                                            />
                                            {c !== "" && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeColor(i)}
                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ background: "#e11d48" }}
                                                >
                                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium" style={{ color: "#8e8e93" }}>
                                            {c === "" ? "선택" : c}
                                        </span>
                                    </div>
                                ))}
                                {/* 추가 버튼 */}
                                {colors.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addColor}
                                        className="flex flex-col items-center gap-1.5"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full border-[2px] border-dashed flex items-center justify-center transition-all hover:border-black/40"
                                            style={{ borderColor: "rgba(0,0,0,0.2)" }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                        </div>
                                        <span className="text-[10px] font-medium" style={{ color: "#8e8e93" }}>추가</span>
                                    </button>
                                )}
                                {/* 그라디언트 미리보기 */}
                                <div className="ml-auto">
                                    <div className="w-24 h-10 rounded-lg shadow-sm" style={{ background: gradient }} />
                                </div>
                            </div>
                        ) : (
                            /* 빈 상태 */
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-70"
                                    style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                    <span className="text-[13px] font-medium">색상 추가</span>
                                </button>
                                <span className="text-[11px]" style={{ color: "#b0b0b5" }}>최소 2개 필수 · 최대 5개</span>
                            </div>
                        )}
                        {colors.length > 0 && colors.length < 2 && (
                            <p className="text-[11px]" style={{ color: "#e11d48" }}>색상을 최소 2개 선택해주세요.</p>
                        )}
                        {(() => {
                            const filled = colors.filter(c => c !== "").length;
                            return (
                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px]" style={{ color: "#56565a" }}>
                                        {filled}/5개 선택됨
                                    </p>
                                    {filled < 2 && (
                                        <p className="text-[11px] font-medium" style={{ color: "#e11d48" }}>최소 2가지 색상을 선택해주세요.</p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </Row>

                {/* 구분선 */}
                <div className="my-1 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

                {/* 미리보기 이미지 */}
                <Row label="미리보기 이미지" required>
                    <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80" style={{ background: "rgba(0,0,0,0.03)", border: "1.5px dashed rgba(0,0,0,0.12)" }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: previewUrl ? "transparent" : "rgba(0,0,0,0.06)" }}>
                            {previewUrl
                                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            }
                        </div>
                        <div>
                            <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>
                                {previewFile ? previewFile.name : "이미지 파일 업로드"}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>PNG, JPG, WEBP 권장</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handlePreviewFile} className="hidden" />
                    </label>
                </Row>

                {/* 테마 파일 */}
                <Row label="테마 파일" required>
                    <div className="flex flex-col gap-2">
                        {/* .ktheme */}
                        <label
                            className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
                            style={{
                                background: themeFile ? "rgba(255,229,0,0.12)" : "rgba(0,0,0,0.03)",
                                border: `1.5px dashed ${themeFile ? "#FFE500" : "rgba(0,0,0,0.12)"}`,
                            }}
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: themeFile ? "#FFE500" : "rgba(0,0,0,0.06)" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeFile ? "#3A1D1D" : "#8e8e93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>
                                    {themeFile ? themeFile.name : ".ktheme 파일 업로드"}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>
                                    {themeFile ? "파일이 선택되었습니다" : "iOS · PC용 테마 파일 (.ktheme)"}
                                </p>
                            </div>
                            {themeFile && (
                                <button
                                    type="button"
                                    onClick={e => { e.preventDefault(); setThemeFile(null); }}
                                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                                    style={{ background: "rgba(0,0,0,0.08)" }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            )}
                            <input type="file" accept=".ktheme" onChange={e => setThemeFile(e.target.files?.[0] ?? null)} className="hidden" />
                        </label>

                        {/* 안드로이드 */}
                        <label
                            className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
                            style={{
                                background: androidFile ? "rgba(255,229,0,0.12)" : "rgba(0,0,0,0.03)",
                                border: `1.5px dashed ${androidFile ? "#FFE500" : "rgba(0,0,0,0.12)"}`,
                            }}
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: androidFile ? "#FFE500" : "rgba(0,0,0,0.06)" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={androidFile ? "#3A1D1D" : "#8e8e93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>
                                    {androidFile ? androidFile.name : "안드로이드 파일 업로드"}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>
                                    {androidFile ? "파일이 선택되었습니다" : "안드로이드용 테마 파일 (.apk, .zip)"}
                                </p>
                            </div>
                            {androidFile && (
                                <button
                                    type="button"
                                    onClick={e => { e.preventDefault(); setAndroidFile(null); }}
                                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                                    style={{ background: "rgba(0,0,0,0.08)" }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            )}
                            <input type="file" accept=".apk,.zip" onChange={e => setAndroidFile(e.target.files?.[0] ?? null)} className="hidden" />
                        </label>
                    </div>
                </Row>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/store")}
                        className="px-6 py-3 rounded-xl text-[14px] font-medium transition-all hover:opacity-70"
                        style={{ background: "rgba(0,0,0,0.05)", color: "#3a3a3c" }}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                        style={{ background: "#FFE500", color: "#3A1D1D", boxShadow: "0 4px 20px rgba(255,220,0,0.3)" }}
                    >
                        등록 신청하기
                    </button>
                </div>
            </div>

            {/* ── 우측: 카드 미리보기 ── */}
            <aside className="lg:sticky lg:top-20 flex flex-col gap-3">
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#555555" }}>스토어 카드 미리보기 <span className="normal-case tracking-normal font-normal" style={{ color: "#959090" }}>(입력한 정보가 실시간으로 반영됩니다)</span></p>

                {/* 카드 */}
                <div
                    className="rounded-[22px] overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(0,0,0,0.07)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* 커버 */}
                    <div className="h-52 relative" style={{ background: previewUrl ? undefined : gradient }}>
                        {previewUrl && <img src={previewUrl} alt="" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                            {category && (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.9)", color: "#1c1c1e" }}>
                                    {category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 정보 */}
                    <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[16px] font-bold leading-tight" style={{ color: "#1c1c1e" }}>
                                    {name || "테마 이름"}
                                </h3>
                                <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>by {authorName}</p>
                            </div>
                            <span className="text-[15px] font-extrabold" style={{ color: price ? "#1c1c1e" : "#c0c0c0" }}>
                                {price || "—"}
                            </span>
                        </div>

                        <p className="text-[12px] leading-relaxed" style={{ color: "#6b6b6b" }}>
                            {description || "테마 설명이 여기에 표시됩니다."}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-1.5">
                                {colors.map((c, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#8e8e93" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l7.78 7.78 7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                0
                            </div>
                        </div>
                    </div>
                </div>

                {/* 등록 완성도 */}
                <div className="rounded-[18px] p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <p className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: "#1c1c1e" }}>
                        <span>✓</span> 등록 완성도
                    </p>
                    <div className="flex flex-col gap-2">
                        {[
                            { label: "테마 이름", done: !!name },
                            { label: "테마 설명", done: !!description },
                            { label: "카테고리", done: !!category },
                            { label: "가격 설정", done: !!price },
                            { label: "대표 색상", done: colors.filter(c => c !== "").length >= 2 },
                            { label: "미리보기 이미지", done: !!previewFile },
                            { label: "테마 파일", done: !!(themeFile || androidFile) },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2.5">
                                <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: item.done ? "#34c759" : "rgba(0,0,0,0.08)" }}
                                >
                                    {item.done && (
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[12px] font-medium" style={{ color: item.done ? "#1c1c1e" : "#b0b0b5" }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* 진행 바 */}
                    <div className="mt-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold" style={{ color: "#8e8e93" }}>완성도</span>
                            <span className="text-[12px] font-bold" style={{ color: "#e11d48" }}>
                                {Math.round(([!!name, !!description, !!category, !!price, colors.filter(c => c !== "").length >= 2, !!previewFile, !!(themeFile || androidFile)].filter(Boolean).length / 7) * 100)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.round(([!!name, !!description, !!category, !!price, colors.filter(c => c !== "").length >= 2, !!previewFile, !!(themeFile || androidFile)].filter(Boolean).length / 7) * 100)}%`,
                                    background: "#e11d48",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 등록 절차 안내 */}
                <div className="rounded-[18px] p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <p className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: "#1c1c1e" }}>
                        등록 절차 안내
                    </p>
                    <div className="flex flex-col gap-3">
                        {[
                            { step: "1", title: "정보 입력", desc: "테마 정보를 모두 입력해주세요." },
                            { step: "2", title: "검토 (1~2일)", desc: "운영팀이 테마를 검토합니다." },
                            { step: "3", title: "스토어 출시", desc: "승인 후 자동으로 등록됩니다." },
                        ].map((item, i, arr) => (
                            <div key={item.step} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold" style={{ background: "#1c1c1e", color: "#fff" }}>
                                        {item.step}
                                    </div>
                                    {i < arr.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "rgba(0,0,0,0.08)", minHeight: 16 }} />}
                                </div>
                                <div className="pb-3">
                                    <p className="text-[12px] font-bold" style={{ color: "#1c1c1e" }}>{item.title}</p>
                                    <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 주의사항 */}
                <div className="rounded-[18px] p-5 flex flex-col gap-3" style={{ background: "rgba(255,235,235,0.7)", border: "1px solid rgba(225,29,72,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                    <p className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: "#e11d48" }}>
                        주의사항
                    </p>
                    <div className="flex flex-col gap-2.5">
                        {[
                            "타인의 저작물을 무단으로 사용한 테마는 등록이 거절될 수 있어요.",
                            "파일 내 악성코드가 탐지되면 계정이 정지될 수 있어요.",
                        ].map((text, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <span className="text-[11px] font-bold mt-0.5 shrink-0" style={{ color: "#e11d48" }}>!</span>
                                <p className="text-[11px] leading-relaxed" style={{ color: "#6b2030" }}>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </aside>
        </form>
    );
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 py-3">
            <label className="text-[13px] font-semibold flex items-center gap-1" style={{ color: "#1c1c1e" }}>
                {label}
                {required && <span style={{ color: "#e11d48" }}>*</span>}
            </label>
            {children}
        </div>
    );
}
