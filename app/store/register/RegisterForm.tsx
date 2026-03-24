'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원", "2,500원"];
const MAX_MINI_PREVIEWS = 5;
const MAX_OPTIONS_FREE = 3;
const MAX_OPTIONS_PRO = 10;

type OptionSource = "file" | "mytheme";

type ThemeOption = {
    id: string;
    name: string;
    os: "ios" | "android";
    source: OptionSource;
    file: File | null;
    myThemeId: string | null;
    myThemeName: string | null;
};

type MyThemeItem = {
    id: string;
    name: string;
    os: string;
    previewImageUrl: string | null;
    trashed: boolean;
};

function MyThemePickerModal({ myThemes, targetOs, onSelect, onClose }: {
    myThemes: MyThemeItem[];
    targetOs: "ios" | "android";
    onSelect: (theme: MyThemeItem) => void;
    onClose: () => void;
}) {
    const filtered = myThemes.filter(t => !t.trashed && t.os === targetOs);
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <div className="w-full sm:w-[440px] rounded-t-2xl sm:rounded-2xl flex flex-col"
                style={{ background: "#fff", maxHeight: "70vh" }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                    <div>
                        <p className="text-[15px] font-bold" style={{ color: "#1a1a1a" }}>내 테마에서 선택</p>
                        <p className="text-[12px] mt-0.5" style={{ color: "#aaa" }}>{targetOs === "ios" ? "iOS" : "Android"} 테마만 표시됩니다</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:opacity-60" style={{ background: "rgba(0,0,0,0.05)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <p className="text-[13px]" style={{ color: "#ccc" }}>{targetOs === "ios" ? "iOS" : "Android"} 테마가 없어요</p>
                            <p className="text-[11px]" style={{ color: "#ddd" }}>테마 제작소에서 테마를 만들어보세요</p>
                        </div>
                    ) : filtered.map(t => (
                        <button key={t.id} type="button" onClick={() => onSelect(t)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-80 active:scale-[0.98]"
                            style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                                {t.previewImageUrl
                                    ? <img src={t.previewImageUrl} alt="" className="w-full h-full object-cover" />
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <p className="text-[13px] font-semibold truncate" style={{ color: "#1a1a1a" }}>{t.name}</p>
                                <p className="text-[11px]" style={{ color: "#aaa" }}>{t.os === "ios" ? "iOS" : "Android"}</p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

type RegisterFormProps = {
    authorName?: string;
    headerSlot?: React.ReactNode;
    role?: string;
    isPro?: boolean;
};

export default function RegisterForm({ headerSlot, role, isPro = false }: RegisterFormProps) {
    const router = useRouter();
    const isUserOnly = role === "USER";
    const MAX_OPTIONS = isPro ? MAX_OPTIONS_PRO : MAX_OPTIONS_FREE;

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameChecking, setNameChecking] = useState(false);
    const [nameChecked, setNameChecked] = useState(false);
    const nameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryInput, setCategoryInput] = useState("");
    // USER는 무조건 무료로 고정
    const [price, setPrice] = useState(isUserOnly ? "무료" : "");
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [miniPreviewFiles, setMiniPreviewFiles] = useState<File[]>([]);
    const [miniPreviewUrls, setMiniPreviewUrls] = useState<string[]>([]);

    const [globalOs, setGlobalOs] = useState<"ios" | "android">("ios");
    const [options, setOptions] = useState<ThemeOption[]>([]);
    const [richContent, setRichContent] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 리치 에디터 내 이미지 업로드 → 임시 object URL (제출 시 서버 업로드)
    const richImageFiles = useRef<Map<string, File>>(new Map());
    const handleRichImageUpload = useCallback(async (file: File): Promise<string> => {
        const tempUrl = URL.createObjectURL(file);
        richImageFiles.current.set(tempUrl, file);
        return tempUrl;
    }, []);

    const [myThemes, setMyThemes] = useState<MyThemeItem[]>([]);
    const [myThemesLoaded, setMyThemesLoaded] = useState(false);
    const [pickerModal, setPickerModal] = useState<{ optionId: string; targetOs: "ios" | "android" } | null>(null);

    useEffect(() => {
        fetch("/api/my-themes")
            .then(r => r.json())
            .then((d: { themes?: MyThemeItem[] }) => { setMyThemes(d.themes ?? []); setMyThemesLoaded(true); })
            .catch(() => setMyThemesLoaded(true));
    }, []);

    const checkNameDuplicate = useCallback(async (value: string) => {
        if (!value.trim()) { setNameError(null); setNameChecked(false); return; }
        setNameChecking(true); setNameChecked(false);
        try {
            const res = await fetch(`/api/themes/check-name?title=${encodeURIComponent(value.trim())}`);
            const data = await res.json() as { isDuplicate: boolean };
            if (data.isDuplicate) { setNameError("이미 사용 중인 테마 이름입니다."); setNameChecked(false); }
            else { setNameError(null); setNameChecked(true); }
        } catch { setNameError(null); setNameChecked(false); }
        finally { setNameChecking(false); }
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value); setNameChecked(false); setNameError(null);
        if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current);
        if (value.trim().length > 0) nameCheckTimer.current = setTimeout(() => checkNameDuplicate(value), 600);
    };

    const handlePreviewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPreviewFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleMiniPreviewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const toAdd = Array.from(e.target.files ?? []).slice(0, MAX_MINI_PREVIEWS - miniPreviewFiles.length);
        setMiniPreviewFiles(prev => [...prev, ...toAdd]);
        setMiniPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
        e.target.value = "";
    };

    const removeMiniPreview = (idx: number) => {
        setMiniPreviewFiles(prev => prev.filter((_, i) => i !== idx));
        setMiniPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    };

    const addOption = () => {
        if (options.length < MAX_OPTIONS)
            setOptions(prev => [...prev, { id: crypto.randomUUID(), name: "", os: globalOs, source: "file", file: null, myThemeId: null, myThemeName: null }]);
    };

    const handleGlobalOsChange = (os: "ios" | "android") => {
        setGlobalOs(os);
        setOptions(prev => prev.map(o => ({ ...o, os, file: null, myThemeId: null, myThemeName: null })));
    };
    const removeOption = (id: string) => setOptions(prev => prev.filter(o => o.id !== id));
    const updateOption = (id: string, patch: Partial<ThemeOption>) =>
        setOptions(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));

    const handlePickMyTheme = (theme: MyThemeItem) => {
        if (!pickerModal) return;
        updateOption(pickerModal.optionId, { source: "mytheme", myThemeId: theme.id, myThemeName: theme.name, file: null });
        setPickerModal(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasAnyData = options.some(o => (o.source === "file" && o.file) || (o.source === "mytheme" && o.myThemeId));
        if (!name || !price || !categories.length || !description || !previewFile || !hasAnyData) return;
        if (nameError || nameChecking || !nameChecked) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", name.trim());
            formData.append("description", description.trim());
            formData.append("price", price);
            categories.forEach(cat => formData.append("categories", cat));
            formData.append("thumbnail", previewFile);
            miniPreviewFiles.forEach(f => formData.append("miniPreviews", f));
            formData.append("optionCount", String(options.length));
            options.forEach((opt, idx) => {
                formData.append(`optName_${idx}`, opt.name.trim() || `옵션 ${idx + 1}`);
                formData.append(`optOs_${idx}`, opt.os);
                if (opt.source === "file" && opt.file) formData.append(`optFile_${idx}`, opt.file);
                else if (opt.source === "mytheme" && opt.myThemeId) formData.append(`optMyThemeId_${idx}`, opt.myThemeId);
            });
            // richContent: object URL → 실제 업로드 URL로 치환
            const processedHtml = richContent;
            let imgIdx = 0;
            for (const [tempUrl, file] of richImageFiles.current.entries()) {
                if (processedHtml.includes(tempUrl)) {
                    formData.append(`richImg_${imgIdx}`, file);
                    formData.append(`richImgUrl_${imgIdx}`, tempUrl);
                    imgIdx++;
                }
            }
            formData.append("richContent", processedHtml);
            formData.append("richImgCount", String(imgIdx));
            const res = await fetch("/api/themes/register", { method: "POST", body: formData });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok || !data.ok) { alert(data.error ?? "등록 신청 중 오류가 발생했습니다."); return; }
            setSubmitted(true);
        } catch { alert("네트워크 오류가 발생했습니다. 다시 시도해주세요."); }
        finally { setSubmitting(false); }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,0,0.1)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-[22px] font-bold" style={{ color: "#1a1a1a" }}>등록 신청이 완료됐어요</h2>
                    <p className="text-[14px]" style={{ color: "#999" }}>검토 후 스토어에 등록됩니다. 보통 1~2일 소요돼요.</p>
                </div>
                <button onClick={() => router.push("/store")} className="mt-1 px-7 py-2.5 rounded-full text-[14px] font-semibold transition-all active:scale-95 hover:opacity-85" style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                    스토어 보러가기
                </button>
            </div>
        );
    }

    const hasAnyOptionData = options.some(o => (o.source === "file" && o.file) || (o.source === "mytheme" && o.myThemeId));
    const completionItems = [
        { label: "테마 이름", done: nameChecked && !nameError },
        { label: "테마 설명", done: !!description },
        { label: "카테고리", done: categories.length > 0 },
        { label: "가격 설정", done: !!price },
        { label: "미리보기 이미지", done: !!previewFile },
        { label: "테마 옵션", done: options.length > 0 && hasAnyOptionData },
    ];
    const doneCnt = completionItems.filter(i => i.done).length;
    const completionPct = Math.round((doneCnt / completionItems.length) * 100);
    const isSubmittable = nameChecked && !nameError && !nameChecking && !!price &&
        categories.length > 0 && !!description.trim() && !!previewFile && hasAnyOptionData;

    return (
        <>
            <form onSubmit={handleSubmit} noValidate className="w-full">
                {headerSlot && (
                    <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
                        <div className="mt-[20px]">{headerSlot}</div>
                    </div>
                )}
                <div className="flex gap-14 items-start">
                    <div className="flex-1 min-w-0 flex flex-col gap-0">

                        {/* 진행률 바 */}
                        <div className="mb-10 flex items-center gap-4">
                            <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${completionPct}%`, background: completionPct === 100 ? "#34c759" : "rgb(255,149,0)" }} />
                            </div>
                            <span className="text-[12px] font-semibold shrink-0" style={{ color: completionPct === 100 ? "#34c759" : "rgb(255,149,0)", minWidth: 36 }}>
                                {doneCnt}/{completionItems.length}
                            </span>
                        </div>

                        {/* 01 — 이름 + 설명 */}
                        <div className="flex gap-10 pb-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex flex-col gap-2" style={{ flex: "0 0 45%" }}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>01</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 이름</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                    {nameChecking && <span className="ml-auto text-[11px]" style={{ color: "#bbb" }}>확인 중</span>}
                                    {!nameChecking && nameChecked && <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium" style={{ color: "#34c759" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>사용 가능</span>}
                                    {!nameChecking && nameError && <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium" style={{ color: "#e11d48" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>이미 사용 중</span>}
                                    {!nameChecking && !nameChecked && !nameError && <span className="ml-auto text-[10px]" style={{ color: "#7e7e7e" }}>{name.length}/30</span>}
                                </div>
                                <input type="text" value={name} onChange={handleNameChange} placeholder="테마 이름 입력" maxLength={30}
                                    className="w-full bg-transparent outline-none text-[13px] placeholder:text-[#d0d0d0]"
                                    style={{ color: "#1a1a1a", border: "none", paddingBottom: 8, paddingLeft: 3 }} />
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>02</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 설명</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                    <span className="ml-auto text-[10px]" style={{ color: "#7e7e7e" }}>{description.length}/200</span>
                                </div>
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="어떤 분위기의 테마인지 알려주세요" rows={4} maxLength={200}
                                    className="w-full bg-transparent outline-none text-[13px] resize-none placeholder:text-[#d0d0d0]"
                                    style={{ color: "#1a1a1a", border: "none", lineHeight: "1.75", paddingLeft: 3 }} />
                            </div>
                        </div>

                        {/* 03 — 카테고리 + 가격 */}
                        <div className="flex gap-10 py-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex flex-col gap-3" style={{ flex: "0 0 45%" }}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>03</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>카테고리</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={categoryInput} onChange={e => setCategoryInput(e.target.value)}
                                        onKeyDown={e => { if (e.nativeEvent.isComposing) return; if (e.key === "Enter") { e.preventDefault(); const t = categoryInput.trim(); if (t && !categories.includes(t) && categories.length < 10) setCategories(prev => [...prev, t]); setCategoryInput(""); } }}
                                        placeholder={categories.length >= 10 ? "최대 10개" : "입력 후 Enter"} maxLength={10}
                                        className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#d0d0d0]"
                                        style={{ color: "#1a1a1a", border: "none", borderBottom: "1.5px solid rgba(0,0,0,0.1)", paddingBottom: 6 }} />
                                    <button type="button" onClick={() => { const t = categoryInput.trim(); if (t && !categories.includes(t) && categories.length < 10) setCategories(prev => [...prev, t]); setCategoryInput(""); }}
                                        disabled={categories.length >= 10}
                                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:opacity-75 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
                                        style={{ background: "rgb(255,149,0)" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                    </button>
                                </div>
                                {categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map(cat => (
                                            <span key={cat} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                                style={{ background: "rgba(255,149,0,0.07)", color: "rgb(190,100,0)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                                {cat}
                                                <button type="button" onClick={() => setCategories(prev => prev.filter(c => c !== cat))} className="opacity-40 hover:opacity-100 transition-opacity ml-0.5">
                                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <span className="text-[10px]" style={{ color: categories.length >= 10 ? "#e11d48" : "#7e7e7e" }}>{categories.length}/10</span>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>04</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>가격</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                </div>
                                {isUserOnly ? (
                                    // USER: 무료 고정 + 입점 안내
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-lg"
                                            style={{ background: "rgba(255,149,0,0.06)", color: "rgb(200,100,0)", border: "1px solid rgba(255,149,0,0.2)" }}>
                                            <span>무료</span>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                                        </div>
                                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(74,123,247,0.05)", border: "1px solid rgba(74,123,247,0.12)" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                                            </svg>
                                            <p className="text-[11px] leading-relaxed" style={{ color: "rgb(74,123,247)" }}>
                                                유료 테마 등록은 크리에이터 입점 신청 후 가능해요.{" "}
                                                <a href="/mypage/creator-apply" className="font-semibold underline">입점 신청하기</a>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // CREATOR / ADMIN: 전체 가격 옵션
                                    <div className="flex flex-col gap-1">
                                        {PRICE_OPTIONS.map(p => (
                                            <button key={p} type="button" onClick={() => setPrice(p)}
                                                className="flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all rounded-lg"
                                                style={{ background: price === p ? "rgba(255,149,0,0.06)" : "transparent", color: price === p ? "rgb(200,100,0)" : "#aaa", border: price === p ? "1px solid rgba(255,149,0,0.2)" : "1px solid transparent" }}>
                                                <span>{p}</span>
                                                {price === p && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 05 — 썸네일 + 추가 프리뷰 */}
                        <div className="flex gap-10 py-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex flex-col gap-3" style={{ flex: "0 0 45%" }}>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>05</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>미리보기 이미지</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                </div>
                                <label className="cursor-pointer group">
                                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all group-hover:opacity-80"
                                        style={{ background: previewUrl ? "transparent" : "rgba(0,0,0,0.03)", border: previewUrl ? "none" : "1.5px dashed rgba(0,0,0,0.12)" }}>
                                        {previewUrl ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                            : <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><span className="mt-2 text-[12px]" style={{ color: "#ccc" }}>클릭하여 업로드</span></>}
                                    </div>
                                    {previewFile && <p className="mt-1.5 text-[11px] truncate" style={{ color: "#aaa" }}>{previewFile.name}</p>}
                                    <input type="file" accept="image/*" onChange={handlePreviewFile} className="hidden" />
                                </label>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>06</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>추가 프리뷰</span>
                                    <span className="text-[11px]" style={{ color: "#7e7e7e" }}>선택 · 최대 5개</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {miniPreviewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeMiniPreview(idx)}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                style={{ background: "rgba(0,0,0,0.45)" }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {miniPreviewFiles.length < MAX_MINI_PREVIEWS && (
                                        <label className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-70"
                                            style={{ background: "rgba(0,0,0,0.03)", border: "1.5px dashed rgba(0,0,0,0.1)" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                            <input type="file" accept="image/*" multiple onChange={handleMiniPreviewFiles} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <span className="text-[10px]" style={{ color: miniPreviewFiles.length >= MAX_MINI_PREVIEWS ? "#e11d48" : "#d0d0d0" }}>{miniPreviewFiles.length}/{MAX_MINI_PREVIEWS}</span>
                            </div>
                        </div>

                        {/* 07 — 테마 옵션 */}
                        <div className="flex flex-col gap-5 py-10" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>07</span>
                                    <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 옵션</span>
                                    <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                    <span className="text-[11px]" style={{ color: "#aaa" }}>최대 {MAX_OPTIONS}개{!isPro && " (PRO는 10개)"}</span>
                                </div>
                                {options.length < MAX_OPTIONS ? (
                                    <button type="button" onClick={addOption}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:opacity-75 active:scale-95"
                                        style={{ background: "rgba(255,149,0,0.07)", color: "rgb(190,100,0)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                        옵션 추가
                                    </button>
                                ) : !isPro ? (
                                    <a href="/pricing" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:opacity-75"
                                        style={{ background: "rgba(74,123,247,0.07)", color: "rgb(60,100,220)", border: "1px solid rgba(74,123,247,0.2)" }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                        PRO로 업그레이드
                                    </a>
                                ) : null}
                            </div>

                            {/* 비PRO 한도 안내 배너 */}
                            {!isPro && options.length >= MAX_OPTIONS_FREE && (
                                <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                    style={{ background: "rgba(74,123,247,0.06)", border: "1px solid rgba(74,123,247,0.15)" }}>
                                    <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2" strokeLinecap="round">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-[12px] font-semibold" style={{ color: "rgb(60,100,220)" }}>
                                            무료 플랜은 옵션을 최대 3개까지 등록할 수 있어요.
                                        </p>
                                        <p className="text-[11px]" style={{ color: "#8899cc" }}>
                                            PRO 구독 시 옵션을 최대 10개까지 등록할 수 있습니다.{" "}
                                            <a href="/pricing" target="_blank" rel="noopener noreferrer"
                                                className="underline hover:opacity-70 transition-opacity font-medium">
                                                PRO 구독 보러가기 →
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 전역 OS 선택 */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] font-medium" style={{ color: "#888" }}>플랫폼 선택</span>
                                <div className="flex rounded-xl overflow-hidden w-fit" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                                    {(["ios", "android"] as const).map(os => (
                                        <button key={os} type="button"
                                            onClick={() => handleGlobalOsChange(os)}
                                            className="px-5 py-2 text-[13px] font-semibold transition-all"
                                            style={{
                                                background: globalOs === os
                                                    ? (os === "ios" ? "rgba(255,149,0,0.12)" : "rgba(74,123,247,0.12)")
                                                    : "transparent",
                                                color: globalOs === os
                                                    ? (os === "ios" ? "rgb(190,100,0)" : "rgb(60,100,220)")
                                                    : "#bbb",
                                            }}>
                                            {os === "ios" ? "iOS" : "Android"}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px]" style={{ color: "#bbb" }}>
                                    {globalOs === "ios" ? ".ktheme 파일을 업로드합니다." : ".apk 또는 .zip 파일을 업로드합니다."}
                                </p>
                            </div>

                            {options.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl"
                                    style={{ border: "1.5px dashed rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.015)" }}>
                                    <p className="text-[13px]" style={{ color: "#ccc" }}>아직 추가된 옵션이 없어요</p>
                                    <button type="button" onClick={addOption}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:opacity-75"
                                        style={{ background: "rgba(255,149,0,0.07)", color: "rgb(190,100,0)" }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                        첫 옵션 추가하기
                                    </button>
                                </div>
                            )}

                            {options.map((opt, idx) => (
                                <div key={opt.id} className="flex flex-col gap-3 p-4 rounded-xl"
                                    style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                    {/* 옵션 헤더 */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                            style={{ background: "rgb(255,149,0)", color: "#fff" }}>{idx + 1}</span>
                                        <input type="text" value={opt.name} onChange={e => updateOption(opt.id, { name: e.target.value })}
                                            placeholder="옵션 이름 (예: 핑크 버전)" maxLength={20}
                                            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#d0d0d0]"
                                            style={{ color: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 4 }} />
                                        <button type="button" onClick={() => removeOption(opt.id)} className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    {/* 소스 탭 */}
                                    <div className="flex gap-0 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", width: "fit-content" }}>
                                        <button type="button" onClick={() => updateOption(opt.id, { source: "file", myThemeId: null, myThemeName: null })}
                                            className="px-3 py-1.5 text-[11px] font-medium transition-all"
                                            style={{ background: opt.source === "file" ? "rgba(0,0,0,0.06)" : "transparent", color: opt.source === "file" ? "#1a1a1a" : "#aaa" }}>
                                            파일 업로드
                                        </button>
                                        <button type="button" onClick={() => updateOption(opt.id, { source: "mytheme", file: null })}
                                            className="px-3 py-1.5 text-[11px] font-medium transition-all"
                                            style={{ background: opt.source === "mytheme" ? "rgba(255,149,0,0.08)" : "transparent", color: opt.source === "mytheme" ? "rgb(190,100,0)" : "#aaa" }}>
                                            내 테마에서 선택
                                        </button>
                                    </div>

                                    {/* 소스별 UI */}
                                    {opt.source === "file" ? (
                                        <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:opacity-75"
                                            style={{ background: "rgba(0,0,0,0.025)", border: `1px dashed ${opt.file ? "rgba(255,149,0,0.3)" : "rgba(0,0,0,0.1)"}` }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={opt.file ? "rgb(255,149,0)" : "#ccc"} strokeWidth="2" strokeLinecap="round">
                                                <path d="M12 3v13M7 11l5 5 5-5" /><path d="M5 20h14" />
                                            </svg>
                                            <span className="text-[12px] flex-1 truncate" style={{ color: opt.file ? "#1a1a1a" : "#ccc" }}>
                                                {opt.file ? opt.file.name : `파일 선택 (${opt.os === "ios" ? ".ktheme" : ".apk, .zip"})`}
                                            </span>
                                            {opt.file && (
                                                <button type="button" onClick={e => { e.preventDefault(); updateOption(opt.id, { file: null }); }} className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                            <input type="file" accept={opt.os === "ios" ? ".ktheme" : ".apk,.zip"} className="hidden"
                                                onChange={e => updateOption(opt.id, { file: e.target.files?.[0] ?? null })} />
                                        </label>
                                    ) : (
                                        opt.myThemeId ? (
                                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                                                style={{ background: "rgba(255,149,0,0.04)", border: "1px solid rgba(255,149,0,0.2)" }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                                                <span className="text-[12px] flex-1 truncate font-medium" style={{ color: "rgb(190,100,0)" }}>{opt.myThemeName}</span>
                                                <button type="button" onClick={() => setPickerModal({ optionId: opt.id, targetOs: globalOs })} className="text-[11px] shrink-0 transition-all hover:opacity-70" style={{ color: "#aaa" }}>변경</button>
                                                <button type="button" onClick={() => updateOption(opt.id, { myThemeId: null, myThemeName: null })} className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setPickerModal({ optionId: opt.id, targetOs: globalOs })}
                                                disabled={!myThemesLoaded}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all hover:opacity-75 disabled:opacity-40"
                                                style={{ background: "rgba(0,0,0,0.025)", border: "1px dashed rgba(0,0,0,0.1)" }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                                                </svg>
                                                <span className="text-[12px]" style={{ color: "#ccc" }}>{myThemesLoaded ? "내 테마 선택하기" : "로딩 중..."}</span>
                                            </button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 08 — 테마 정보 (리치 텍스트) */}
                        <div className="flex flex-col gap-5 py-10" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>08</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 정보</span>
                                <span className="text-[11px]" style={{ color: "#aaa" }}>선택 · 이미지, 텍스트, 제목 등 자유롭게</span>
                            </div>
                            <RichTextEditor
                                content={richContent}
                                onChangeAction={setRichContent}
                                onImageUploadAction={handleRichImageUpload}
                            />
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-8">
                            <button type="button" onClick={() => { if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current); router.push("/store"); }}
                                className="px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-60"
                                style={{ color: "#aaa", background: "none", border: "1px solid rgba(0,0,0,0.1)" }}>
                                취소
                            </button>
                            <button type="submit" disabled={submitting || !isSubmittable}
                                className="flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                                {submitting ? "신청 중..." : "등록 신청하기"}
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽 플로팅 요약 */}
                    <aside className="lg:sticky lg:top-[64px] w-[200px] shrink-0 flex flex-col gap-6 pt-1">
                        <div className="flex flex-col gap-2">
                            {completionItems.map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all"
                                        style={{ background: item.done ? "rgb(255,149,0)" : "rgba(0,0,0,0.07)" }}>
                                        {item.done && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                                    </div>
                                    <span className="text-[12px]" style={{ color: item.done ? "#555" : "#ccc" }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />
                        <div className="flex flex-col gap-0">
                            {[{ n: "01", title: "정보 입력" }, { n: "02", title: "검토 1~2일" }, { n: "03", title: "스토어 출시" }].map((item, i, arr) => (
                                <div key={item.n} className="flex gap-2.5 items-start">
                                    <div className="flex flex-col items-center shrink-0">
                                        <span className="text-[10px] font-bold" style={{ color: "rgba(255,149,0,0.5)" }}>{item.n}</span>
                                        {i < arr.length - 1 && <div className="w-px mt-0.5" style={{ background: "rgba(255,149,0,0.12)", height: 18 }} />}
                                    </div>
                                    <span className="text-[12px] pb-2" style={{ color: "#bbb" }}>{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </form>

            {pickerModal && (
                <MyThemePickerModal
                    myThemes={myThemes}
                    targetOs={pickerModal.targetOs}
                    onSelect={handlePickMyTheme}
                    onClose={() => setPickerModal(null)}
                />
            )}
        </>
    );
}

