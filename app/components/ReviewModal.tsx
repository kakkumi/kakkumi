"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

type Props = {
    themeId: string;
    themeName: string;
    thumbnailUrl?: string | null;
    initialRating?: number;
    initialContent?: string;
    initialImages?: string[];
    isEdit?: boolean;
    onCloseAction: () => void;
    onSuccessAction: () => void;
};

export default function ReviewModal({
    themeId,
    themeName,
    thumbnailUrl,
    initialRating = 0,
    initialContent = "",
    initialImages = [],
    isEdit = false,
    onCloseAction,
    onSuccessAction,
}: Props) {
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState(initialContent);
    // 이미 업로드된 URL (수정 시 기존 이미지)
    const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialImages);
    // 새로 선택한 파일 미리보기
    const [previews, setPreviews] = useState<{ file: File; dataUrl: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalCount = uploadedUrls.length + previews.length;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setError("");
        const remaining = MAX_IMAGES - totalCount;
        const toAdd = files.slice(0, remaining);
        for (const file of toAdd) {
            if (!file.type.startsWith("image/")) { setError("이미지 파일만 업로드할 수 있습니다."); return; }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`); return; }
        }
        toAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                setPreviews(prev => [...prev, { file, dataUrl: ev.target?.result as string }]);
            };
            reader.readAsDataURL(file);
        });
        // input 초기화
        e.target.value = "";
    };

    const removeUploaded = (idx: number) => {
        setUploadedUrls(prev => prev.filter((_, i) => i !== idx));
    };

    const removePreview = (idx: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (rating < 1) { setError("별점을 선택해주세요."); return; }
        setSaving(true);
        setError("");
        try {
            let newUrls: string[] = [];
            // 새 파일이 있으면 먼저 업로드
            if (previews.length > 0) {
                setUploading(true);
                const formData = new FormData();
                previews.forEach(p => formData.append("images", p.file));
                const uploadRes = await fetch(`/api/themes/${themeId}/review/images`, {
                    method: "POST",
                    body: formData,
                });
                const uploadData = await uploadRes.json() as { urls?: string[]; error?: string };
                setUploading(false);
                if (!uploadRes.ok) { setError(uploadData.error ?? "이미지 업로드 실패"); setSaving(false); return; }
                newUrls = uploadData.urls ?? [];
            }

            const finalImages = [...uploadedUrls, ...newUrls];
            const res = await fetch(`/api/themes/${themeId}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, content: content.trim() || null, images: finalImages }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setError(data.error ?? "저장 실패"); setSaving(false); return; }
            onSuccessAction();
        } catch {
            setError("서버 오류가 발생했습니다.");
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onCloseAction}
        >
            <div
                className="flex flex-col gap-6 p-8 rounded-3xl shadow-2xl w-full overflow-y-auto"
                style={{ background: "rgba(255,255,255,0.97)", maxWidth: 480, maxHeight: "90vh" }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-extrabold" style={{ color: "#1c1c1e" }}>
                        {isEdit ? "리뷰 수정" : "리뷰 작성"}
                    </h2>
                    <button onClick={onCloseAction} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* 테마 정보 */}
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(0,0,0,0.04)" }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
                        {thumbnailUrl ? (
                            <Image src={thumbnailUrl} alt={themeName} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[14px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{themeName}</span>
                </div>

                {/* 별점 */}
                <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>별점</span>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 active:scale-95"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24"
                                    fill={(hoverRating || rating) >= star ? "#FFB800" : "none"}
                                    stroke={(hoverRating || rating) >= star ? "#FFB800" : "#c8c8cd"}
                                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-[13px] font-semibold" style={{ color: "#FFB800" }}>
                                {["", "별로예요", "아쉬워요", "보통이에요", "좋아요", "최고예요"][rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* 내용 */}
                <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                        리뷰 내용 <span className="text-[11px] font-normal" style={{ color: "#8e8e93" }}>(필수, 10자 이상)</span>
                    </span>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        maxLength={200}
                        rows={4}
                        placeholder="테마 사용 후기를 자유롭게 작성해주세요."
                        className="resize-none px-4 py-3 rounded-2xl text-[14px] outline-none"
                        style={{ border: "1.5px solid rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.02)", color: "#1c1c1e" }}
                    />
                    <div className="flex justify-end">
                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>{content.length} / 200</span>
                    </div>
                </div>

                {/* 이미지 업로드 */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                            사진 <span className="text-[11px] font-normal" style={{ color: "#8e8e93" }}>(선택 · 최대 5장)</span>
                        </span>
                        <span className="text-[11px]" style={{ color: totalCount >= MAX_IMAGES ? "#ff3b30" : "#8e8e93" }}>
                            {totalCount} / {MAX_IMAGES}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* 기존 업로드된 이미지 */}
                        {uploadedUrls.map((url, i) => (
                            <div key={`uploaded-${i}`} className="relative w-[80px] h-[80px] rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" unoptimized />
                                <button
                                    type="button"
                                    onClick={() => removeUploaded(i)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.55)" }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {/* 새 이미지 미리보기 */}
                        {previews.map((p, i) => (
                            <div key={`preview-${i}`} className="relative w-[80px] h-[80px] rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                <Image src={p.dataUrl} alt={`미리보기 ${i + 1}`} fill className="object-cover" unoptimized />
                                <button
                                    type="button"
                                    onClick={() => removePreview(i)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.55)" }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {/* 추가 버튼 */}
                        {totalCount < MAX_IMAGES && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-[80px] h-[80px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:opacity-70"
                                style={{ border: "1.5px dashed rgba(0,0,0,0.2)", background: "rgba(0,0,0,0.02)" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span className="text-[10px]" style={{ color: "#c8c8cd" }}>사진 추가</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="text-[11px]" style={{ color: "#8e8e93" }}>JPG, PNG, GIF · 각 최대 5MB</p>
                </div>

                {error && <p className="text-[12px]" style={{ color: "#ff3b30" }}>{error}</p>}

                {/* 버튼 */}
                <div className="flex gap-2">
                    <button
                        onClick={onCloseAction}
                        className="flex-1 py-3 rounded-2xl text-[14px] font-medium transition-all hover:opacity-70"
                        style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || rating < 1}
                        className="flex-1 py-3 rounded-2xl text-[14px] font-medium transition-all hover:opacity-80 disabled:opacity-40"
                        style={{ background: "rgb(255,149,0)", color: "#fff" }}
                    >
                        {uploading ? "이미지 업로드 중..." : saving ? "저장 중..." : isEdit ? "수정 완료" : "리뷰 등록"}
                    </button>
                </div>
            </div>
        </div>
    );
}
