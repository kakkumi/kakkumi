'use client';

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원"];
const MAX_MINI_PREVIEWS = 5;
const MAX_FILES = 5;

type FileOption = {
    id: string;
    name: string;   // 옵션 이름 (예: "핑크 ver.")
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
        if (!value.trim()) {
            setNameError(null);
            setNameChecked(false);
            return;
        }
        setNameChecking(true);
        setNameChecked(false);
        try {
            const res = await fetch(`/api/themes/check-name?title=${encodeURIComponent(value.trim())}`);
            const data = await res.json() as { isDuplicate: boolean };
            if (data.isDuplicate) {
                setNameError("이미 사용 중인 테마 이름입니다.");
                setNameChecked(false);
            } else {
                setNameError(null);
                setNameChecked(true);
            }
        } catch {
            setNameError(null);
            setNameChecked(false);
        } finally {
            setNameChecking(false);
        }
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setNameChecked(false);
        setNameError(null);
        if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current);
        if (value.trim().length > 0) {
            nameCheckTimer.current = setTimeout(() => {
                checkNameDuplicate(value);
            }, 600);
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

    // iOS 옵션 조작
    const addIosOption = () => { if (iosOptions.length < MAX_FILES) setIosOptions(prev => [...prev, newFileOption()]); };
    const removeIosOption = (id: string) => { setIosOptions(prev => prev.filter(o => o.id !== id)); };
    const updateIosName = (id: string, name: string) => setIosOptions(prev => prev.map(o => o.id === id ? { ...o, name } : o));
    const updateIosFile = (id: string, file: File | null) => setIosOptions(prev => prev.map(o => o.id === id ? { ...o, file } : o));

    // Android 옵션 조작
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

            // iOS 옵션별 파일 전송
            iosOptions.forEach((opt, idx) => {
                formData.append(`iosName_${idx}`, opt.name.trim() || `iOS 옵션 ${idx + 1}`);
                if (opt.file) formData.append(`iosFile_${idx}`, opt.file);
            });
            formData.append("iosCount", String(iosOptions.length));

            // Android 옵션별 파일 전송
            androidOptions.forEach((opt, idx) => {
                formData.append(`androidName_${idx}`, opt.name.trim() || `Android 옵션 ${idx + 1}`);
                if (opt.file) formData.append(`androidFile_${idx}`, opt.file);
            });
            formData.append("androidCount", String(androidOptions.length));

            const res = await fetch("/api/themes/register", {
                method: "POST",
                body: formData,
            });

            const data = await res.json() as { ok?: boolean; error?: string };

            if (!res.ok || !data.ok) {
                alert(data.error ?? "등록 신청 중 오류가 발생했습니다.");
                return;
            }

            setSubmitted(true);
        } catch {
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
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
                    <div className="flex flex-col gap-1">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="테마 이름을 입력해주세요"
                                maxLength={30}
                                className="flex-1 px-1 py-2 text-[14px] outline-none transition-all"
                                style={{
                                    background: "transparent",
                                    borderBottom: `1.5px solid ${nameError ? "#e11d48" : nameChecked ? "#34c759" : "rgba(0,0,0,0.15)"}`,
                                    color: "#1c1c1e",
                                }}
                                onFocus={e => {
                                    if (!nameError && !nameChecked) e.currentTarget.style.borderBottomColor = "#1c1c1e";
                                }}
                                onBlur={e => {
                                    if (!nameError && !nameChecked) e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)";
                                }}
                            />
                            {nameChecking && (
                                <span className="text-[11px] shrink-0" style={{ color: "#8e8e93" }}>확인 중...</span>
                            )}
                            {!nameChecking && nameChecked && (
                                <span className="text-[11px] shrink-0 flex items-center gap-0.5" style={{ color: "#34c759" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                    사용 가능
                                </span>
                            )}
                            {!nameChecking && nameError && (
                                <span className="text-[11px] shrink-0 flex items-center gap-0.5" style={{ color: "#e11d48" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    이미 사용 중
                                </span>
                            )}
                            <span className="self-end text-[11px] shrink-0" style={{ color: "#b0b0b5" }}>{name.length}/30</span>
                        </div>
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
                                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{ background: "#b1b1b1", boxShadow: "0 2px 8px" }}
                                title="추가"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
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

                {/* 미니 프리뷰 이미지 (선택, 최대 5개) */}
                <Row label="추가 프리뷰 이미지">
                    <div className="flex flex-col gap-3">
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>상세페이지에 표시되는 미니 프리뷰 이미지입니다. 최대 5개까지 등록할 수 있어요. (선택)</p>
                        <div className="flex flex-wrap gap-2">
                            {miniPreviewUrls.map((url, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 group" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                    <img src={url} alt={`미니 프리뷰 ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeMiniPreview(idx)}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        style={{ background: "rgba(0,0,0,0.45)" }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                            {miniPreviewFiles.length < MAX_MINI_PREVIEWS && (
                                <label className="w-16 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-70 shrink-0" style={{ background: "rgba(0,0,0,0.03)", border: "1.5px dashed rgba(0,0,0,0.12)" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                    <span className="text-[10px] mt-1" style={{ color: "#8e8e93" }}>추가</span>
                                    <input type="file" accept="image/*" multiple onChange={handleMiniPreviewFiles} className="hidden" />
                                </label>
                            )}
                        </div>
                        <p className="text-[11px]" style={{ color: miniPreviewFiles.length >= MAX_MINI_PREVIEWS ? "#e11d48" : "#b0b0b5" }}>
                            {miniPreviewFiles.length}/{MAX_MINI_PREVIEWS}
                        </p>
                    </div>
                </Row>

                {/* 테마 파일 옵션 */}
                <Row label="테마 파일" required>
                    <div className="flex flex-col gap-5">
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>
                            iOS · PC와 Android 각각 최대 {MAX_FILES}개 옵션을 등록할 수 있어요. 옵션 이름으로 색상·스타일을 구분하세요.
                        </p>

                        {/* iOS 섹션 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,149,0,0.12)", color: "#c97000" }}>iOS · PC</span>
                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>.ktheme · {iosOptions.length}/{MAX_FILES}</span>
                            </div>
                            {iosOptions.length === 0 && (
                                <p className="text-[11px] py-1" style={{ color: "#b0b0b5" }}>아직 추가된 iOS 옵션이 없어요.</p>
                            )}
                            {iosOptions.map((opt, idx) => (
                                <div key={opt.id} className="flex items-center gap-2 p-3 rounded-[14px]" style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "#1c1c1e", color: "#fff" }}>{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={opt.name}
                                        onChange={e => updateIosName(opt.id, e.target.value)}
                                        placeholder="옵션 이름 (예: 핑크 ver.)"
                                        maxLength={20}
                                        className="w-[140px] shrink-0 px-2 py-1 text-[12px] outline-none rounded-lg transition-all"
                                        style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1c1c1e" }}
                                        onFocus={e => e.currentTarget.style.borderColor = "#1c1c1e"}
                                        onBlur={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"}
                                    />
                                    <label className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-80"
                                        style={{ background: opt.file ? "rgba(255,229,0,0.10)" : "rgba(255,255,255,0.6)", border: `1.5px dashed ${opt.file ? "#FFE500" : "rgba(0,0,0,0.10)"}` }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={opt.file ? "#c97000" : "#8e8e93"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                        </svg>
                                        <span className="text-[12px] truncate" style={{ color: opt.file ? "#1c1c1e" : "#8e8e93" }}>
                                            {opt.file ? opt.file.name : "파일 선택"}
                                        </span>
                                        <input type="file" accept=".ktheme" className="hidden" onChange={e => updateIosFile(opt.id, e.target.files?.[0] ?? null)} />
                                    </label>
                                    {opt.file && (
                                        <button type="button" onClick={() => updateIosFile(opt.id, null)}
                                            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-70"
                                            style={{ background: "rgba(0,0,0,0.08)" }}>
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    )}
                                    <button type="button" onClick={() => removeIosOption(opt.id)}
                                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-70"
                                        style={{ background: "rgba(255,59,48,0.10)" }}>
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                            {iosOptions.length < MAX_FILES && (
                                <button type="button" onClick={addIosOption}
                                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-[12px] font-medium transition-all hover:opacity-70 self-start"
                                    style={{ background: "rgba(255,149,0,0.08)", color: "#c97000", border: "1px dashed rgba(255,149,0,0.3)" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c97000" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                    iOS 옵션 추가
                                </button>
                            )}
                        </div>

                        {/* Android 섹션 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(52,199,89,0.12)", color: "#1a7a3a" }}>Android</span>
                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>.apk, .zip · {androidOptions.length}/{MAX_FILES}</span>
                            </div>
                            {androidOptions.length === 0 && (
                                <p className="text-[11px] py-1" style={{ color: "#b0b0b5" }}>아직 추가된 Android 옵션이 없어요.</p>
                            )}
                            {androidOptions.map((opt, idx) => (
                                <div key={opt.id} className="flex items-center gap-2 p-3 rounded-[14px]" style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "#1c1c1e", color: "#fff" }}>{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={opt.name}
                                        onChange={e => updateAndroidName(opt.id, e.target.value)}
                                        placeholder="옵션 이름 (예: 핑크 ver.)"
                                        maxLength={20}
                                        className="w-[140px] shrink-0 px-2 py-1 text-[12px] outline-none rounded-lg transition-all"
                                        style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1c1c1e" }}
                                        onFocus={e => e.currentTarget.style.borderColor = "#1c1c1e"}
                                        onBlur={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"}
                                    />
                                    <label className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-80"
                                        style={{ background: opt.file ? "rgba(255,229,0,0.10)" : "rgba(255,255,255,0.6)", border: `1.5px dashed ${opt.file ? "#FFE500" : "rgba(0,0,0,0.10)"}` }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={opt.file ? "#1a7a3a" : "#8e8e93"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                        </svg>
                                        <span className="text-[12px] truncate" style={{ color: opt.file ? "#1c1c1e" : "#8e8e93" }}>
                                            {opt.file ? opt.file.name : "파일 선택"}
                                        </span>
                                        <input type="file" accept=".apk,.zip" className="hidden" onChange={e => updateAndroidFile(opt.id, e.target.files?.[0] ?? null)} />
                                    </label>
                                    {opt.file && (
                                        <button type="button" onClick={() => updateAndroidFile(opt.id, null)}
                                            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-70"
                                            style={{ background: "rgba(0,0,0,0.08)" }}>
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    )}
                                    <button type="button" onClick={() => removeAndroidOption(opt.id)}
                                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-70"
                                        style={{ background: "rgba(255,59,48,0.10)" }}>
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                            {androidOptions.length < MAX_FILES && (
                                <button type="button" onClick={addAndroidOption}
                                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-[12px] font-medium transition-all hover:opacity-70 self-start"
                                    style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a", border: "1px dashed rgba(52,199,89,0.3)" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a7a3a" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                    Android 옵션 추가
                                </button>
                            )}
                        </div>
                    </div>
                </Row>

                <div className="flex flex-col gap-2 pt-4">
                    <div className="flex gap-3">
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
                            disabled={
                                submitting ||
                                !nameChecked || !!nameError || nameChecking ||
                                !price ||
                                categories.length === 0 ||
                                !description.trim() ||
                                !previewFile ||
                                !(iosOptions.some(o => o.file) || androidOptions.some(o => o.file))
                            }
                            className="flex-1 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                            style={{ background: "#efde5c", color: "#3A1D1D", boxShadow: "0 4px 20px rgba(255,220,0,0.3)" }}
                        >
                            {submitting ? "신청 중..." : "등록 신청하기"}
                        </button>
                    </div>
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
                            { label: "테마 이름", done: nameChecked && !nameError },
                            { label: "테마 설명", done: !!description },
                            { label: "카테고리", done: categories.length > 0 },
                            { label: "가격 설정", done: !!price },
                            { label: "미리보기 이미지", done: !!previewFile },
                            { label: "테마 파일", done: iosOptions.some(o => o.file) || androidOptions.some(o => o.file) },
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
                                {Math.round(([nameChecked && !nameError, !!description, categories.length > 0, !!price, !!previewFile, iosOptions.some(o => o.file) || androidOptions.some(o => o.file)].filter(Boolean).length / 6) * 100)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.round(([nameChecked && !nameError, !!description, categories.length > 0, !!price, !!previewFile, iosOptions.some(o => o.file) || androidOptions.some(o => o.file)].filter(Boolean).length / 6) * 100)}%`,
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
