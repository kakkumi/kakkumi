"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/app/store/register/RichTextEditor"), { ssr: false });

const PRICE_OPTIONS = ["무료", "500원", "1,000원", "1,500원", "2,000원", "2,500원"];
const MAX_MINI_PREVIEWS = 5;

type OptionSource = "file" | "mytheme";

type EditOption = {
    id: string; // 기존 옵션 id (기존) 또는 신규 uuid
    name: string;
    os: "ios" | "android";
    source: OptionSource;
    file: File | null;
    myThemeId: string | null;
    myThemeName: string | null;
    isNew: boolean; // 신규 추가 옵션 여부
    originalFileUrl?: string | null;
};

type MyThemeItem = { id: string; name: string; os: string; previewImageUrl: string | null; trashed: boolean };

type ThemeOptionData = {
    id: string; name: string; os: string;
    fileUrl: string | null; configJson: unknown; imageData: unknown;
    myThemeId: string | null; status: string;
};
type ThemeData = {
    id: string; title: string; description: string | null; price: number;
    status: string; thumbnailUrl: string | null; images: string[];
    tags: string[]; contentBlocks: unknown; isPublic: boolean;
};

function MyThemePickerModal({ myThemes, targetOs, onSelect, onClose }: {
    myThemes: MyThemeItem[]; targetOs: "ios" | "android";
    onSelect: (t: MyThemeItem) => void; onClose: () => void;
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
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:opacity-60" style={{ background: "rgba(0,0,0,0.05)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <p className="text-[13px]" style={{ color: "#ccc" }}>{targetOs === "ios" ? "iOS" : "Android"} 테마가 없어요</p>
                        </div>
                    ) : filtered.map(t => (
                        <button key={t.id} type="button" onClick={() => onSelect(t)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-80"
                            style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                                {t.previewImageUrl
                                    ? <img src={t.previewImageUrl} alt="" className="w-full h-full object-cover" />
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>}
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

export default function ThemeEditForm({ themeId }: { themeId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [originalData, setOriginalData] = useState<{ title: string; description: string; price: string; tags: string[] } | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("무료");
    const [categories, setCategories] = useState<string[]>([]);
    const [catInput, setCatInput] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [miniPreviewFiles, setMiniPreviewFiles] = useState<File[]>([]);
    const [miniPreviewUrls, setMiniPreviewUrls] = useState<string[]>([]);
    const [options, setOptions] = useState<EditOption[]>([]);
    const [richContent, setRichContent] = useState("");
    const [reviewVisibility, setReviewVisibility] = useState<"keep" | "hide">("keep");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [myThemes, setMyThemes] = useState<MyThemeItem[]>([]);
    const [pickerModal, setPickerModal] = useState<{ optId: string; targetOs: "ios" | "android" } | null>(null);

    const richImageMapRef = useRef<Map<string, File>>(new Map());

    useEffect(() => {
        Promise.all([
            fetch(`/api/themes/edit/${themeId}`, { cache: "no-store" }).then(r => r.json()),
            fetch("/api/my-themes").then(r => r.json()),
        ]).then(([d, mt]: [{ theme: ThemeData; options: ThemeOptionData[] }, { themes?: MyThemeItem[] }]) => {
            if (!d.theme) { router.push("/mypage"); return; }
            const priceStr = d.theme.price === 0 ? "무료" : `${d.theme.price.toLocaleString()}원`;
            setTitle(d.theme.title);
            setDescription(d.theme.description ?? "");
            setPrice(priceStr);
            setCategories(d.theme.tags ?? []);
            setThumbnailPreview(d.theme.thumbnailUrl);
            setRichContent(typeof d.theme.contentBlocks === "string" ? d.theme.contentBlocks : "");
            setOriginalData({ title: d.theme.title, description: d.theme.description ?? "", price: priceStr, tags: d.theme.tags ?? [] });
            setOptions((d.options ?? []).map(o => ({
                id: o.id,
                name: o.name,
                os: (o.os === "android" ? "android" : "ios") as "ios" | "android",
                source: (o.myThemeId ? "mytheme" : "file") as OptionSource,
                file: null,
                myThemeId: o.myThemeId,
                myThemeName: null,
                isNew: false,
                originalFileUrl: o.fileUrl,
            })));
            setMyThemes(mt.themes ?? []);
        }).catch(() => router.push("/mypage"))
            .finally(() => setLoading(false));
    }, [themeId, router]);

    const handleRichImageUpload = useCallback(async (file: File): Promise<string> => {
        const tempUrl = URL.createObjectURL(file);
        richImageMapRef.current.set(tempUrl, file);
        return tempUrl;
    }, []);

    const addOption = () => setOptions(prev => [...prev, {
        id: crypto.randomUUID(), name: "", os: "ios", source: "file",
        file: null, myThemeId: null, myThemeName: null, isNew: true,
    }]);
    const removeOption = (id: string) => setOptions(prev => prev.filter(o => o.id !== id));
    const updateOption = (id: string, patch: Partial<EditOption>) =>
        setOptions(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));

    const handlePickMyTheme = (theme: MyThemeItem) => {
        if (!pickerModal) return;
        updateOption(pickerModal.optId, { source: "mytheme", myThemeId: theme.id, myThemeName: theme.name, file: null });
        setPickerModal(null);
    };

    const handleMiniPreviews = (e: React.ChangeEvent<HTMLInputElement>) => {
        const toAdd = Array.from(e.target.files ?? []).slice(0, MAX_MINI_PREVIEWS - miniPreviewFiles.length);
        setMiniPreviewFiles(prev => [...prev, ...toAdd]);
        setMiniPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError("테마 이름을 입력해주세요."); return; }
        if (!description.trim()) { setError("테마 설명을 입력해주세요."); return; }
        setSubmitting(true); setError("");

        const formData = new FormData();
        formData.set("title", title.trim());
        formData.set("description", description.trim());
        formData.set("price", price);
        categories.forEach(c => formData.append("categories", c));
        formData.set("reviewVisibility", reviewVisibility);
        if (thumbnailFile) formData.set("thumbnail", thumbnailFile);
        miniPreviewFiles.forEach(f => formData.append("miniPreviews", f));

        let htmlContent = richContent;
        let richImgCount = 0;
        for (const [tempUrl, file] of richImageMapRef.current.entries()) {
            if (htmlContent.includes(tempUrl)) {
                formData.set(`richImg_${richImgCount}`, file);
                formData.set(`richImgUrl_${richImgCount}`, tempUrl);
                richImgCount++;
            }
        }
        formData.set("richContent", htmlContent);
        formData.set("richImgCount", String(richImgCount));

        formData.set("optionCount", String(options.length));
        options.forEach((opt, i) => {
            formData.set(`optId_${i}`, opt.isNew ? "" : opt.id);
            formData.set(`optName_${i}`, opt.name);
            formData.set(`optOs_${i}`, opt.os);
            formData.set(`optIsNew_${i}`, String(opt.isNew));
            if (opt.file) formData.set(`optFile_${i}`, opt.file);
            if (opt.myThemeId) formData.set(`optMyThemeId_${i}`, opt.myThemeId);
        });

        try {
            const res = await fetch(`/api/themes/edit/${themeId}`, { method: "POST", body: formData });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok || !data.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
            setSuccess(true);
            setTimeout(() => router.push("/mypage?menu=업로드+테마"), 1800);
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const thumbSrc = thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnailPreview;

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
        </div>
    );

    if (success) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.12)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="text-[18px] font-bold" style={{ color: "#1c1917" }}>수정 신청 완료!</h2>
            <p className="text-[13px] text-center" style={{ color: "#a8a29e" }}>관리자 검토 후 승인되면 스토어에 반영됩니다.<br />마이페이지로 이동합니다...</p>
        </div>
    );

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-16 items-start">
                    <div className="flex-1 flex flex-col gap-10 min-w-0">

                        {/* 검토 중 공개 설정 */}
                        <div className="rounded-2xl p-5" style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                            <p className="text-[13px] font-semibold mb-3" style={{ color: "#FF9500" }}>수정 검토 중 테마 공개 설정</p>
                            <div className="flex flex-col gap-2.5">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="radio" name="reviewVisibility" value="keep" checked={reviewVisibility === "keep"} onChange={() => setReviewVisibility("keep")} className="mt-0.5 accent-orange-400" />
                                    <div>
                                        <p className="text-[13px] font-medium" style={{ color: "#1c1917" }}>기존 버전 계속 공개</p>
                                        <p className="text-[11px]" style={{ color: "#a8a29e" }}>승인 후 새 버전으로 교체됩니다.</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input type="radio" name="reviewVisibility" value="hide" checked={reviewVisibility === "hide"} onChange={() => setReviewVisibility("hide")} className="mt-0.5 accent-orange-400" />
                                    <div>
                                        <p className="text-[13px] font-medium" style={{ color: "#1c1917" }}>검토 중에는 비공개 처리</p>
                                        <p className="text-[11px]" style={{ color: "#a8a29e" }}>승인 후 자동으로 공개됩니다.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 1. 테마 이름 */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>테마 이름 <span style={{ color: "#ff3b30" }}>*</span></label>
                                {originalData && originalData.title !== title && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>변경됨</span>
                                )}
                            </div>
                            {originalData && (
                                <p className="text-[11px]" style={{ color: "#a8a29e" }}>기존: <span style={{ color: "#78716c" }}>{originalData.title}</span></p>
                            )}
                            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={40}
                                placeholder="테마 이름을 입력해주세요"
                                className="px-0 py-2 text-[14px] outline-none bg-transparent"
                                style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }} />
                        </div>

                        {/* 2. 설명 */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>테마 설명 <span style={{ color: "#ff3b30" }}>*</span></label>
                                {originalData && originalData.description !== description && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>변경됨</span>
                                )}
                            </div>
                            {originalData && (
                                <p className="text-[11px]" style={{ color: "#a8a29e" }}>기존: <span style={{ color: "#78716c" }}>{originalData.description}</span></p>
                            )}
                            <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={300} rows={3}
                                placeholder="테마 설명을 입력해주세요"
                                className="px-0 py-2 text-[14px] outline-none bg-transparent resize-none"
                                style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }} />
                        </div>

                        {/* 3. 카테고리 */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>카테고리</label>
                            <div className="flex flex-wrap gap-1.5 mb-1">
                                {categories.map(c => (
                                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium"
                                        style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>
                                        {c}
                                        <button type="button" onClick={() => setCategories(prev => prev.filter(x => x !== c))} className="text-[10px] opacity-60 hover:opacity-100">✕</button>
                                    </span>
                                ))}
                            </div>
                            <input value={catInput} onChange={e => setCatInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === "Enter" || e.key === ",") && catInput.trim()) {
                                        e.preventDefault();
                                        const tag = catInput.trim().replace(/,/g, "");
                                        if (tag && !categories.includes(tag)) setCategories(prev => [...prev, tag]);
                                        setCatInput("");
                                    }
                                }}
                                placeholder="태그 입력 후 Enter"
                                className="px-0 py-2 text-[13px] outline-none bg-transparent"
                                style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }} />
                        </div>

                        {/* 4. 가격 */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>가격</label>
                                {originalData && originalData.price !== price && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>변경됨 (기존: {originalData.price})</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PRICE_OPTIONS.map(p => (
                                    <button type="button" key={p} onClick={() => setPrice(p)}
                                        className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                                        style={{ background: price === p ? "#FF9500" : "rgba(0,0,0,0.05)", color: price === p ? "#fff" : "#78716c" }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. 대표 이미지 */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>대표 이미지</label>
                            <div className="flex items-center gap-3">
                                {thumbSrc && (
                                    <Image src={thumbSrc} alt="썸네일" width={72} height={72} className="rounded-xl object-cover" unoptimized style={{ width: 72, height: 72 }} />
                                )}
                                <label className="cursor-pointer px-4 py-2 rounded-xl text-[13px] font-medium hover:opacity-70 transition-all"
                                    style={{ background: "rgba(0,0,0,0.05)", color: "#78716c" }}>
                                    {thumbnailFile ? "변경하기" : "이미지 교체"}
                                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setThumbnailFile(f); }} />
                                </label>
                            </div>
                        </div>

                        {/* 6. 미니 프리뷰 */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>추가 프리뷰 이미지 (최대 {MAX_MINI_PREVIEWS}장)</label>
                            <div className="flex gap-2 flex-wrap">
                                {miniPreviewUrls.map((url, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                                        <Image src={url} alt="" fill className="object-cover" unoptimized />
                                        <button type="button" onClick={() => { setMiniPreviewFiles(p => p.filter((_, j) => j !== i)); setMiniPreviewUrls(p => p.filter((_, j) => j !== i)); }}
                                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {miniPreviewFiles.length < MAX_MINI_PREVIEWS && (
                                    <label className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-70 transition-all"
                                        style={{ border: "1.5px dashed #d6d3d1" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleMiniPreviews} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 7. 옵션 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>테마 옵션</label>
                                <button type="button" onClick={addOption}
                                    className="text-[12px] font-medium px-3 py-1.5 rounded-full transition-all hover:opacity-70"
                                    style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>
                                    + 옵션 추가
                                </button>
                            </div>
                            {options.map((opt, i) => (
                                <div key={opt.id} className="flex flex-col gap-3 p-4 rounded-2xl" style={{ background: opt.isNew ? "rgba(52,199,89,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${opt.isNew ? "rgba(52,199,89,0.2)" : "rgba(0,0,0,0.07)"}` }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-semibold" style={{ color: opt.isNew ? "#34c759" : "#a8a29e" }}>
                                            옵션 {i + 1} {opt.isNew ? "(신규)" : ""}
                                        </span>
                                        <button type="button" onClick={() => removeOption(opt.id)}
                                            className="text-[11px] transition-opacity hover:opacity-50" style={{ color: "#ff3b30" }}>삭제</button>
                                    </div>
                                    <input value={opt.name} onChange={e => updateOption(opt.id, { name: e.target.value })}
                                        placeholder="옵션 이름 (예: 핑크 ver.)"
                                        className="px-0 py-1.5 text-[13px] outline-none bg-transparent"
                                        style={{ borderBottom: "1px solid #e7e5e4", color: "#1c1917" }} />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>OS</span>
                                        {(["ios", "android"] as const).map(os => (
                                            <button type="button" key={os} onClick={() => updateOption(opt.id, { os })}
                                                className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                                                style={{ background: opt.os === os ? (os === "ios" ? "rgba(74,123,247,0.12)" : "rgba(52,199,89,0.12)") : "rgba(0,0,0,0.04)", color: opt.os === os ? (os === "ios" ? "#4a7bf7" : "#34c759") : "#a8a29e" }}>
                                                {os === "ios" ? "iOS" : "Android"}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>파일 방식</span>
                                        {(["file", "mytheme"] as const).map(src => (
                                            <button type="button" key={src} onClick={() => updateOption(opt.id, { source: src, file: null, myThemeId: null, myThemeName: null })}
                                                className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                                                style={{ background: opt.source === src ? "rgba(255,149,0,0.12)" : "rgba(0,0,0,0.04)", color: opt.source === src ? "#FF9500" : "#a8a29e" }}>
                                                {src === "file" ? "파일 업로드" : "내 테마 선택"}
                                            </button>
                                        ))}
                                    </div>
                                    {opt.source === "file" ? (
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer px-3 py-1.5 rounded-xl text-[12px] font-medium hover:opacity-70 transition-all"
                                                style={{ background: "rgba(0,0,0,0.05)", color: "#78716c" }}>
                                                {opt.file ? opt.file.name : (opt.originalFileUrl ? "파일 교체" : "파일 선택")}
                                                <input type="file" accept=".ktheme,.apk,application/octet-stream,application/zip" className="hidden"
                                                    onChange={e => { const f = e.target.files?.[0]; if (f) updateOption(opt.id, { file: f }); }} />
                                            </label>
                                            {!opt.file && opt.originalFileUrl && (
                                                <span className="text-[11px]" style={{ color: "#a8a29e" }}>기존 파일 유지됨</span>
                                            )}
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setPickerModal({ optId: opt.id, targetOs: opt.os })}
                                            className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all hover:opacity-80"
                                            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                            {opt.myThemeName ? (
                                                <span className="font-medium" style={{ color: "#1a1a1a" }}>{opt.myThemeName}</span>
                                            ) : (
                                                <span style={{ color: "#ccc" }}>내 테마에서 선택...</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 8. 테마 정보 */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-semibold" style={{ color: "#57534e" }}>테마 정보</label>
                            <RichTextEditor content={richContent} onChangeAction={setRichContent} onImageUploadAction={handleRichImageUpload} />
                        </div>

                        {error && <p className="text-[13px]" style={{ color: "#ff3b30" }}>{error}</p>}

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => router.back()}
                                className="px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-60"
                                style={{ color: "#aaa", background: "none", border: "1px solid rgba(0,0,0,0.1)" }}>
                                취소
                            </button>
                            <button type="submit" disabled={submitting || !title.trim() || !description.trim()}
                                className="flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed"
                                style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                                {submitting ? "신청 중..." : "수정 신청하기"}
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽 플로팅 요약 */}
                    <aside className="lg:sticky lg:top-[64px] w-[200px] shrink-0 flex flex-col gap-6 pt-1">
                        <div className="flex flex-col gap-2">
                            {[
                                { label: "테마 이름", done: !!title.trim() },
                                { label: "테마 설명", done: !!description.trim() },
                                { label: "대표 이미지", done: !!thumbnailPreview || !!thumbnailFile },
                                { label: "옵션", done: options.length > 0 },
                            ].map(item => (
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
                            {[{ n: "01", title: "수정 신청" }, { n: "02", title: "검토 1~2일" }, { n: "03", title: "스토어 반영" }].map((item, i, arr) => (
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
