'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원"];

export default function RegisterForm({ authorName, headerSlot }: { authorName: string; headerSlot?: React.ReactNode }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [price, setPrice] = useState("");
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [themeFile, setThemeFile] = useState<File | null>(null);
    const [androidFile, setAndroidFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handlePreviewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPreviewFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !categories.length || !description || !previewFile || (!themeFile && !androidFile)) return;
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
        <form onSubmit={handleSubmit} noValidate className="w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start" style={{ alignItems: "start" }}>

            {/* ── 좌측: 폼 ── */}
            <div className="flex flex-col gap-3">
                {headerSlot && <div className="mb-2">{headerSlot}</div>}

                {/* 테마 이름 */}
                <Row label="테마 이름" required>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="테마 이름을 입력해주세요"
                            maxLength={30}
                            className="w-full px-1 py-2 text-[14px] outline-none transition-all"
                            style={{ background: "transparent", borderBottom: "1.5px solid rgba(0,0,0,0.15)", color: "#1c1c1e" }}
                            onFocus={e => e.currentTarget.style.borderBottomColor = "#1c1c1e"}
                            onBlur={e => e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)"}
                        />
                        <span className="self-end text-[11px]" style={{ color: "#b0b0b5" }}>{name.length}/30</span>
                    </div>
                </Row>

                <Row label="테마 설명" required>
                    <div className="flex flex-col gap-1">
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="어떤 분위기의 테마인지 알려주세요"
                            rows={1}
                            maxLength={200}
                            className="w-full px-1 py-2 text-[14px] outline-none transition-all resize-none"
                            style={{ background: "transparent", borderBottom: "1.5px solid rgba(0,0,0,0.15)", color: "#1c1c1e" }}
                            onFocus={e => e.currentTarget.style.borderBottomColor = "#1c1c1e"}
                            onBlur={e => e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)"}
                        />
                        <span className="self-end text-[11px]" style={{ color: "#b0b0b5" }}>{description.length}/200</span>
                    </div>
                </Row>

                {/* 카테고리 */}
                <Row label="카테고리" required>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={categoryInput}
                                onChange={e => setCategoryInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const trimmed = categoryInput.trim();
                                        if (trimmed && !categories.includes(trimmed) && categories.length < 10) {
                                            setCategories(prev => [...prev, trimmed]);
                                        }
                                        setCategoryInput("");
                                    }
                                }}
                                placeholder={categories.length >= 10 ? "최대 10개까지 추가할 수 있어요" : "카테고리 입력 후 Enter"}
                                maxLength={10}
                                className="flex-1 px-1 py-2 text-[13px] outline-none transition-all"
                                style={{ background: "transparent", borderBottom: "1.5px solid rgba(0,0,0,0.15)", color: "#1c1c1e" }}
                                onFocus={e => e.currentTarget.style.borderBottomColor = "#1c1c1e"}
                                onBlur={e => e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)"}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const trimmed = categoryInput.trim();
                                    if (trimmed && !categories.includes(trimmed) && categories.length < 10) {
                                        setCategories(prev => [...prev, trimmed]);
                                    }
                                    setCategoryInput("");
                                }}
                                disabled={categories.length >= 10}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: "rgba(28,28,30,0.75)", color: "#fff" }}
                            >
                                추가
                            </button>
                        </div>
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {categories.map(cat => (
                                    <span
                                        key={cat}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                                        style={{ background: "rgba(0,0,0,0.12)", color: "#1c1c1e" }}
                                    >
                                        {cat}
                                        <button
                                            type="button"
                                            onClick={() => setCategories(prev => prev.filter(c => c !== cat))}
                                            className="flex items-center justify-center w-4 h-4 rounded-full transition-all hover:opacity-70"
                                            style={{ background: "rgba(0,0,0,0.12)" }}
                                        >
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round">
                                                <path d="M18 6L6 18M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="text-[11px] mt-0.5" style={{ color: categories.length >= 10 ? "#e11d48" : "#b0b0b5" }}>
                            {categories.length}/10
                        </p>
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
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                                style={{
                                    background: price === p ? "rgba(28,28,30,0.75)" : "rgba(0,0,0,0.12)",
                                    color: price === p ? "#fff" : "#1c1c1e",
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </Row>

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
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { window.location.href = "/store"; }}
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

            {/* ── 우측 ── */}
            <aside className="lg:sticky lg:top-[48px] flex flex-col gap-3">
                {/* 등록 완성도 */}
                <div className="rounded-[18px] p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <p className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: "#1c1c1e" }}>
                        <span>✓</span> 등록 완성도
                    </p>
                    <div className="flex flex-col gap-2">
                        {[
                            { label: "테마 이름", done: !!name },
                            { label: "테마 설명", done: !!description },
                            { label: "카테고리", done: categories.length > 0 },
                            { label: "가격 설정", done: !!price },
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
                    <div className="mt-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold" style={{ color: "#8e8e93" }}>완성도</span>
                            <span className="text-[12px] font-bold" style={{ color: "#e11d48" }}>
                                {Math.round(([!!name, !!description, categories.length > 0, !!price, !!previewFile, !!(themeFile || androidFile)].filter(Boolean).length / 6) * 100)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.round(([!!name, !!description, categories.length > 0, !!price, !!previewFile, !!(themeFile || androidFile)].filter(Boolean).length / 6) * 100)}%`,
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
            <div className="text-[13px] font-semibold flex items-center gap-1" style={{ color: "#1c1c1e" }}>
                {label}
                {required && <span style={{ color: "#e11d48" }}>*</span>}
            </div>
            {children}
        </div>
    );
}
