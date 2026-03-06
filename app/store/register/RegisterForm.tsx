'use client';

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원", "2,500원"];
const MAX_MINI_PREVIEWS = 5;
const MAX_FILES = 5;

type FileOption = {
    id: string;
    name: string;
    file: File | null;
};

function newFileOption(): FileOption {
    return { id: crypto.randomUUID(), name: "", file: null };
}

export default function RegisterForm({ authorName, headerSlot }: { authorName: string; headerSlot?: React.ReactNode }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameChecking, setNameChecking] = useState(false);
    const [nameChecked, setNameChecked] = useState(false);
    const nameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [price, setPrice] = useState("");
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [miniPreviewFiles, setMiniPreviewFiles] = useState<File[]>([]);
    const [miniPreviewUrls, setMiniPreviewUrls] = useState<string[]>([]);
    const [iosOptions, setIosOptions] = useState<FileOption[]>([]);
    const [androidOptions, setAndroidOptions] = useState<FileOption[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
        if (value.trim().length > 0) {
            nameCheckTimer.current = setTimeout(() => { checkNameDuplicate(value); }, 600);
        }
    };

    const handlePreviewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPreviewFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleMiniPreviewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = MAX_MINI_PREVIEWS - miniPreviewFiles.length;
        const toAdd = files.slice(0, remaining);
        setMiniPreviewFiles(prev => [...prev, ...toAdd]);
        setMiniPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
        e.target.value = "";
    };

    const removeMiniPreview = (idx: number) => {
        setMiniPreviewFiles(prev => prev.filter((_, i) => i !== idx));
        setMiniPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    };

    const addIosOption = () => { if (iosOptions.length < MAX_FILES) setIosOptions(prev => [...prev, newFileOption()]); };
    const removeIosOption = (id: string) => { setIosOptions(prev => prev.filter(o => o.id !== id)); };
    const updateIosName = (id: string, name: string) => setIosOptions(prev => prev.map(o => o.id === id ? { ...o, name } : o));
    const updateIosFile = (id: string, file: File | null) => setIosOptions(prev => prev.map(o => o.id === id ? { ...o, file } : o));

    const addAndroidOption = () => { if (androidOptions.length < MAX_FILES) setAndroidOptions(prev => [...prev, newFileOption()]); };
    const removeAndroidOption = (id: string) => { setAndroidOptions(prev => prev.filter(o => o.id !== id)); };
    const updateAndroidName = (id: string, name: string) => setAndroidOptions(prev => prev.map(o => o.id === id ? { ...o, name } : o));
    const updateAndroidFile = (id: string, file: File | null) => setAndroidOptions(prev => prev.map(o => o.id === id ? { ...o, file } : o));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasAnyFile = iosOptions.some(o => o.file) || androidOptions.some(o => o.file);
        if (!name || !price || !categories.length || !description || !previewFile || !hasAnyFile) return;
        if (nameError || nameChecking || !nameChecked) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", name.trim());
            formData.append("description", description.trim());
            formData.append("price", price);
            categories.forEach((cat) => formData.append("categories", cat));
            if (previewFile) formData.append("thumbnail", previewFile);
            miniPreviewFiles.forEach((f) => formData.append("miniPreviews", f));
            iosOptions.forEach((opt, idx) => {
                formData.append(`iosName_${idx}`, opt.name.trim() || `iOS 옵션 ${idx + 1}`);
                if (opt.file) formData.append(`iosFile_${idx}`, opt.file);
            });
            formData.append("iosCount", String(iosOptions.length));
            androidOptions.forEach((opt, idx) => {
                formData.append(`androidName_${idx}`, opt.name.trim() || `Android 옵션 ${idx + 1}`);
                if (opt.file) formData.append(`androidFile_${idx}`, opt.file);
            });
            formData.append("androidCount", String(androidOptions.length));
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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-[22px] font-bold" style={{ color: "#1a1a1a" }}>등록 신청이 완료됐어요</h2>
                    <p className="text-[14px]" style={{ color: "#999" }}>검토 후 스토어에 등록됩니다. 보통 1~2일 소요돼요.</p>
                </div>
                <button onClick={() => router.push("/store")}
                    className="mt-1 px-7 py-2.5 rounded-full text-[14px] font-semibold transition-all active:scale-95 hover:opacity-85"
                    style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                    스토어 보러가기
                </button>
            </div>
        );
    }

    const completionItems = [
        { label: "테마 이름", done: nameChecked && !nameError },
        { label: "테마 설명", done: !!description },
        { label: "카테고리", done: categories.length > 0 },
        { label: "가격 설정", done: !!price },
        { label: "미리보기 이미지", done: !!previewFile },
        { label: "테마 파일", done: iosOptions.some(o => o.file) || androidOptions.some(o => o.file) },
    ];
    const doneCnt = completionItems.filter(i => i.done).length;
    const completionPct = Math.round((doneCnt / completionItems.length) * 100);

    const isSubmittable = nameChecked && !nameError && !nameChecking && !!price &&
        categories.length > 0 && !!description.trim() && !!previewFile &&
        (iosOptions.some(o => o.file) || androidOptions.some(o => o.file));

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full">

            {/* ── 상단 헤더 영역 ── */}
            {headerSlot && (
                <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
                    <div className="mt-[20px]">{headerSlot}</div>
                </div>
            )}

            {/* ── 메인 그리드: 2/3 폼 + 1/3 사이드 ── */}
            <div className="flex gap-14 items-start">

                {/* 왼쪽 폼 */}
                <div className="flex-1 min-w-0 flex flex-col gap-0">

                    {/* ── 진행률 바 ── */}
                    <div className="mb-10 flex items-center gap-4">
                        <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${completionPct}%`, background: completionPct === 100 ? "#34c759" : "rgb(255,149,0)" }} />
                        </div>
                        <span className="text-[12px] font-semibold shrink-0" style={{ color: completionPct === 100 ? "#34c759" : "rgb(255,149,0)", minWidth: 36 }}>
                            {doneCnt}/{completionItems.length}
                        </span>
                    </div>

                    {/* 01 — 기본 정보: 이름 + 설명을 나란히 */}
                    <div className="flex gap-10 pb-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                        {/* 이름 */}
                        <div className="flex flex-col gap-2" style={{ flex: "0 0 45%" }}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>01</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 이름</span>
                                <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                {nameChecking && <span className="ml-auto text-[11px]" style={{ color: "#bbb" }}>확인 중</span>}
                                {!nameChecking && nameChecked && (
                                    <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium" style={{ color: "#34c759" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                                        사용 가능
                                    </span>
                                )}
                                {!nameChecking && nameError && (
                                    <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium" style={{ color: "#e11d48" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        이미 사용 중
                                    </span>
                                )}
                                {!nameChecking && !nameChecked && !nameError && (
                                    <span className="ml-auto text-[10px]" style={{ color: "#7e7e7e" }}>{name.length}/30</span>
                                )}
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="테마 이름 입력"
                                maxLength={30}
                                className="w-full bg-transparent outline-none text-[13px] placeholder:text-[#d0d0d0]"
                                style={{ color: "#1a1a1a", border: "none", paddingBottom: 8, paddingLeft: 3 }}
                            />
                        </div>

                        {/* 설명 */}
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>02</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 설명</span>
                                <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                                <span className="ml-auto text-[10px]" style={{ color: "#7e7e7e" }}>{description.length}/200</span>
                            </div>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="어떤 분위기의 테마인지 알려주세요"
                                rows={4}
                                maxLength={200}
                                className="w-full bg-transparent outline-none text-[13px] resize-none placeholder:text-[#d0d0d0]"
                                style={{ color: "#1a1a1a", border: "none", lineHeight: "1.75", paddingLeft: 3 }}
                            />
                        </div>
                    </div>

                    {/* 03 — 카테고리 + 가격 나란히 */}
                    <div className="flex gap-10 py-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                        {/* 카테고리 */}
                        <div className="flex flex-col gap-3" style={{ flex: "0 0 45%" }}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>03</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>카테고리</span>
                                <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={e => setCategoryInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const trimmed = categoryInput.trim();
                                            if (trimmed && !categories.includes(trimmed) && categories.length < 10) setCategories(prev => [...prev, trimmed]);
                                            setCategoryInput("");
                                        }
                                    }}
                                    placeholder={categories.length >= 10 ? "최대 10개" : "입력 후 Enter"}
                                    maxLength={10}
                                    className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#d0d0d0]"
                                    style={{ color: "#1a1a1a", border: "none", borderBottom: "1.5px solid rgba(0,0,0,0.1)", paddingBottom: 6 }}
                                />
                                <button type="button"
                                    onClick={() => {
                                        const trimmed = categoryInput.trim();
                                        if (trimmed && !categories.includes(trimmed) && categories.length < 10) setCategories(prev => [...prev, trimmed]);
                                        setCategoryInput("");
                                    }}
                                    disabled={categories.length >= 10}
                                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:opacity-75 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
                                    style={{ background: "rgb(255,149,0)" }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                            </div>
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map(cat => (
                                        <span key={cat} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                            style={{ background: "rgba(255,149,0,0.07)", color: "rgb(190,100,0)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                            {cat}
                                            <button type="button" onClick={() => setCategories(prev => prev.filter(c => c !== cat))}
                                                className="opacity-40 hover:opacity-100 transition-opacity ml-0.5">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <span className="text-[10px]" style={{ color: categories.length >= 10 ? "#e11d48" : "#7e7e7e" }}>{categories.length}/10</span>
                        </div>

                        {/* 가격 */}
                        <div className="flex flex-col gap-3 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>04</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>가격</span>
                                <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {PRICE_OPTIONS.map(p => (
                                    <button key={p} type="button" onClick={() => setPrice(p)}
                                        className="flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all rounded-lg"
                                        style={{
                                            background: price === p ? "rgba(255,149,0,0.06)" : "transparent",
                                            color: price === p ? "rgb(200,100,0)" : "#aaa",
                                            border: price === p ? "1px solid rgba(255,149,0,0.2)" : "1px solid transparent",
                                        }}>
                                        <span>{p}</span>
                                        {price === p && (
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 05 — 이미지: 썸네일 + 추가 프리뷰 나란히 */}
                    <div className="flex gap-10 py-10 items-start" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                        {/* 썸네일 */}
                        <div className="flex flex-col gap-3" style={{ flex: "0 0 45%" }}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>05</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>미리보기 이미지</span>
                                <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                            </div>
                            <label className="cursor-pointer group">
                                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all group-hover:opacity-80"
                                    style={{ background: previewUrl ? "transparent" : "rgba(0,0,0,0.03)", border: previewUrl ? "none" : "1.5px dashed rgba(0,0,0,0.12)" }}>
                                    {previewUrl
                                        ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                        : <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                            <span className="mt-2 text-[12px]" style={{ color: "#ccc" }}>클릭하여 업로드</span>
                                        </>
                                    }
                                </div>
                                {previewFile && (
                                    <p className="mt-1.5 text-[11px] truncate" style={{ color: "#aaa" }}>{previewFile.name}</p>
                                )}
                                <input type="file" accept="image/*" onChange={handlePreviewFile} className="hidden" />
                            </label>
                        </div>

                        {/* 추가 프리뷰 */}
                        <div className="flex flex-col gap-3 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>06</span>
                                <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>추가 프리뷰</span>
                                <span className="text-[11px]" style={{ color: "#7e7e7e" }}>선택 · 최대 5개</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {miniPreviewUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group"
                                        style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeMiniPreview(idx)}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            style={{ background: "rgba(0,0,0,0.45)" }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                {miniPreviewFiles.length < MAX_MINI_PREVIEWS && (
                                    <label className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-70"
                                        style={{ background: "rgba(0,0,0,0.03)", border: "1.5px dashed rgba(0,0,0,0.1)" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                        <input type="file" accept="image/*" multiple onChange={handleMiniPreviewFiles} className="hidden" />
                                    </label>
                                )}
                            </div>
                            <span className="text-[10px]" style={{ color: miniPreviewFiles.length >= MAX_MINI_PREVIEWS ? "#e11d48" : "#d0d0d0" }}>
                                {miniPreviewFiles.length}/{MAX_MINI_PREVIEWS}
                            </span>
                        </div>
                    </div>

                    {/* 07 — 테마 파일 (iOS + Android 세로로) */}
                    <div className="flex flex-col gap-6 py-10" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgb(255,149,0)" }}>07</span>
                            <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>테마 파일</span>
                            <span style={{ color: "#e11d48", fontSize: 12 }}>*</span>
                        </div>

                        {/* iOS + Android 가로 나란히 */}
                        <div className="flex gap-10 items-start">
                            {/* iOS */}
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: "rgba(255,149,0,0.07)", color: "rgb(190,100,0)" }}>iOS · PC</span>
                                    <span className="text-[11px]" style={{ color: "#ccc" }}>.ktheme · {iosOptions.length}/{MAX_FILES}</span>
                                </div>
                                {iosOptions.length === 0 && (
                                    <p className="text-[12px] py-1" style={{ color: "#d0d0d0" }}>추가된 옵션 없음</p>
                                )}
                                {iosOptions.map((opt, idx) => (
                                    <div key={opt.id} className="flex items-center gap-2 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                            style={{ background: "rgb(255,149,0)", color: "#fff" }}>{idx + 1}</span>
                                        <input type="text" value={opt.name} onChange={e => updateIosName(opt.id, e.target.value)}
                                            placeholder="옵션 이름" maxLength={20}
                                            className="w-[100px] shrink-0 bg-transparent outline-none text-[12px] placeholder:text-[#d0d0d0]"
                                            style={{ color: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)" }} />
                                        <label className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-75"
                                            style={{ background: "rgba(0,0,0,0.025)", border: `1px dashed ${opt.file ? "rgba(255,149,0,0.3)" : "rgba(0,0,0,0.1)"}` }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={opt.file ? "rgb(255,149,0)" : "#ccc"} strokeWidth="2" strokeLinecap="round">
                                                <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                            </svg>
                                            <span className="text-[11px] truncate" style={{ color: opt.file ? "#1a1a1a" : "#ccc" }}>
                                                {opt.file ? opt.file.name : "파일 선택"}
                                            </span>
                                            <input type="file" accept=".ktheme" className="hidden" onChange={e => updateIosFile(opt.id, e.target.files?.[0] ?? null)} />
                                        </label>
                                        {opt.file && (
                                            <button type="button" onClick={() => updateIosFile(opt.id, null)}
                                                className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        )}
                                        <button type="button" onClick={() => removeIosOption(opt.id)}
                                            className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                {iosOptions.length < MAX_FILES && (
                                    <button type="button" onClick={addIosOption}
                                        className="flex items-center gap-1 text-[12px] font-medium transition-all hover:opacity-60 self-start mt-1"
                                        style={{ color: "rgb(255,149,0)", background: "none", border: "none" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                        iOS 옵션 추가
                                    </button>
                                )}
                            </div>

                            {/* Android */}
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: "rgba(74,123,247,0.07)", color: "rgb(60,100,220)" }}>Android</span>
                                    <span className="text-[11px]" style={{ color: "#ccc" }}>.apk, .zip · {androidOptions.length}/{MAX_FILES}</span>
                                </div>
                                {androidOptions.length === 0 && (
                                    <p className="text-[12px] py-1" style={{ color: "#d0d0d0" }}>추가된 옵션 없음</p>
                                )}
                                {androidOptions.map((opt, idx) => (
                                    <div key={opt.id} className="flex items-center gap-2 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                            style={{ background: "rgb(74,123,247)", color: "#fff" }}>{idx + 1}</span>
                                        <input type="text" value={opt.name} onChange={e => updateAndroidName(opt.id, e.target.value)}
                                            placeholder="옵션 이름" maxLength={20}
                                            className="w-[100px] shrink-0 bg-transparent outline-none text-[12px] placeholder:text-[#d0d0d0]"
                                            style={{ color: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)" }} />
                                        <label className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-75"
                                            style={{ background: "rgba(0,0,0,0.025)", border: `1px dashed ${opt.file ? "rgba(74,123,247,0.3)" : "rgba(0,0,0,0.1)"}` }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={opt.file ? "rgb(74,123,247)" : "#ccc"} strokeWidth="2" strokeLinecap="round">
                                                <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                            </svg>
                                            <span className="text-[11px] truncate" style={{ color: opt.file ? "#1a1a1a" : "#ccc" }}>
                                                {opt.file ? opt.file.name : "파일 선택"}
                                            </span>
                                            <input type="file" accept=".apk,.zip" className="hidden" onChange={e => updateAndroidFile(opt.id, e.target.files?.[0] ?? null)} />
                                        </label>
                                        {opt.file && (
                                            <button type="button" onClick={() => updateAndroidFile(opt.id, null)}
                                                className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        )}
                                        <button type="button" onClick={() => removeAndroidOption(opt.id)}
                                            className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                {androidOptions.length < MAX_FILES && (
                                    <button type="button" onClick={addAndroidOption}
                                        className="flex items-center gap-1 text-[12px] font-medium transition-all hover:opacity-60 self-start mt-1"
                                        style={{ color: "rgb(74,123,247)", background: "none", border: "none" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                        Android 옵션 추가
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-8">
                        <button type="button"
                            onClick={() => { if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current); router.push("/store"); }}
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

                    {/* 체크리스트 */}
                    <div className="flex flex-col gap-2">
                        {completionItems.map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all"
                                    style={{ background: item.done ? "rgb(255,149,0)" : "rgba(0,0,0,0.07)" }}>
                                    {item.done && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                                </div>
                                <span className="text-[12px]" style={{ color: item.done ? "#555" : "#ccc" }}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

                    {/* 절차 */}
                    <div className="flex flex-col gap-0">
                        {[
                            { n: "01", title: "정보 입력" },
                            { n: "02", title: "검토 1~2일" },
                            { n: "03", title: "스토어 출시" },
                        ].map((item, i, arr) => (
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
    );
}

