"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Application = {
    id: string; status: string; reason: string;
    portfolio: string | null; adminNote: string | null; createdAt: string;
    experience: boolean; tools: string[]; sampleImages: string[];
};

const TOOLS = ["포토샵", "일러스트", "프로크리에이트", "카꾸미"];

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; desc: string; icon: string }> = {
    PENDING:  { label: "검토 중이에요",       color: "#c97000", bg: "rgba(255,149,0,0.10)",  desc: "신청서를 검토 중입니다. 영업일 기준 3일 이내에 결과를 안내해 드려요.", icon: "⏳" },
    APPROVED: { label: "크리에이터가 되었어요!", color: "#1a7a3a", bg: "rgba(52,199,89,0.10)",  desc: "크리에이터 권한이 부여되었습니다. 이제 테마를 등록할 수 있어요!", icon: "🎉" },
    REJECTED: { label: "반려되었어요",          color: "#c0392b", bg: "rgba(255,59,48,0.08)",   desc: "신청이 반려되었습니다. 아래 사유를 확인하고 재신청해 주세요.", icon: "😔" },
};

function FieldLabel({ num, label, required, sub }: { num: string; label: string; required?: boolean; sub?: string }) {
    return (
        <div className="flex flex-col gap-0.5 mb-3">
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#FF9500" }}>{num}</span>
                <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>{label}</span>
                {required && <span style={{ color: "#ff3b30", fontSize: 13 }}>*</span>}
            </div>
            {sub && <p className="text-[12px] pl-5" style={{ color: "#a8a29e" }}>{sub}</p>}
        </div>
    );
}

function inputStyle(focused: boolean) {
    return {
        color: "#1c1c1e",
        borderBottom: `1.5px solid ${focused ? "#FF9500" : "rgba(0,0,0,0.12)"}`,
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderRadius: 0, outline: "none", background: "transparent",
        transition: "border-color 0.15s",
    } as React.CSSProperties;
}

export default function CreatorApplyClient() {
    const router = useRouter();
    const [application, setApplication] = useState<Application | null | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    // 폼 상태
    const [reason, setReason] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [experience, setExperience] = useState<boolean | null>(null);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [agrees, setAgrees] = useState([false, false, false]);
    const [dragging, setDragging] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/creator/apply")
            .then(r => r.json())
            .then((d: { application: Application | null }) => setApplication(d.application))
            .catch(() => setApplication(null));
    }, []);

    const addImages = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
        const remaining = 3 - images.length;
        const toAdd = arr.slice(0, remaining);
        const newPreviews = toAdd.map(f => URL.createObjectURL(f));
        setImages(prev => [...prev, ...toAdd].slice(0, 3));
        setPreviews(prev => [...prev, ...newPreviews].slice(0, 3));
    }, [images.length]);

    const removeImage = (i: number) => {
        URL.revokeObjectURL(previews[i]);
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const toggleTool = (t: string) => {
        setSelectedTools(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };
    const toggleAgree = (i: number) => {
        setAgrees(prev => prev.map((v, idx) => idx === i ? !v : v));
    };

    const reasonOk = reason.trim().length >= 10;
    const experienceOk = experience !== null;
    const imagesOk = images.length >= 1;
    const agreesOk = agrees.every(Boolean);
    const isValid = reasonOk && experienceOk && imagesOk && agreesOk;

    const handleSubmit = async () => {
        if (!isValid) { setError("필수 항목을 모두 입력해주세요."); return; }
        setSubmitting(true); setError("");
        try {
            const fd = new FormData();
            fd.append("reason", reason.trim());
            if (portfolio.trim()) fd.append("portfolio", portfolio.trim());
            fd.append("experience", String(experience));
            selectedTools.forEach(t => fd.append("tools", t));
            images.forEach(f => fd.append("sampleImages", f));

            const res = await fetch("/api/creator/apply", { method: "POST", body: fd });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
            setDone(true);
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── 로딩 ──
    if (application === undefined) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            </div>
        );
    }

    // ── 기존 신청 현황 ──
    if (application && !done) {
        const info = STATUS_INFO[application.status] ?? STATUS_INFO.PENDING;
        return (
            <div className="flex flex-col gap-8 pt-10">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#a8a29e" }}>Creator</p>
                    <h2 className="text-[24px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>입점 신청 현황</h2>
                </div>

                {/* 상태 카드 */}
                <div className="px-5 py-5 rounded-2xl flex flex-col gap-2" style={{ background: info.bg, border: `1px solid ${info.color}22` }}>
                    <div className="flex items-center gap-2">
                        <span className="text-[20px]">{info.icon}</span>
                        <span className="text-[15px] font-bold" style={{ color: info.color }}>{info.label}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#636366" }}>{info.desc}</p>
                </div>

                {/* 반려 사유 */}
                {application.status === "REJECTED" && application.adminNote && (
                    <div className="flex flex-col gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20 }}>
                        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#a8a29e" }}>반려 사유</span>
                        <p className="text-[14px] leading-relaxed" style={{ color: "#3a3a3c" }}>{application.adminNote}</p>
                    </div>
                )}

                {/* 제출한 정보 요약 */}
                <div className="flex flex-col gap-4" style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20 }}>
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#a8a29e" }}>제출한 내용</span>
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="text-[11px] font-medium mb-1" style={{ color: "#a8a29e" }}>자기소개</p>
                            <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{application.reason}</p>
                        </div>
                        {application.portfolio && (
                            <div>
                                <p className="text-[11px] font-medium mb-1" style={{ color: "#a8a29e" }}>포트폴리오</p>
                                <a href={application.portfolio} target="_blank" rel="noreferrer"
                                    className="text-[13px] underline" style={{ color: "rgb(74,123,247)" }}>
                                    {application.portfolio}
                                </a>
                            </div>
                        )}
                        <div>
                            <p className="text-[11px] font-medium mb-1" style={{ color: "#a8a29e" }}>제작 경험</p>
                            <p className="text-[13px]" style={{ color: "#3a3a3c" }}>{application.experience ? "있음" : "없음"}</p>
                        </div>
                        {application.tools?.length > 0 && (
                            <div>
                                <p className="text-[11px] font-medium mb-1.5" style={{ color: "#a8a29e" }}>사용 툴</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {application.tools.map(t => (
                                        <span key={t} className="px-2.5 py-1 rounded-full text-[12px] font-medium"
                                            style={{ background: "rgba(255,149,0,0.08)", color: "rgb(180,90,0)" }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {application.sampleImages?.length > 0 && (
                            <div>
                                <p className="text-[11px] font-medium mb-2" style={{ color: "#a8a29e" }}>샘플 이미지</p>
                                <div className="flex gap-2">
                                    {application.sampleImages.map((src, i) => (
                                        <a key={i} href={src} target="_blank" rel="noreferrer">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                                <Image src={src} alt="" fill className="object-cover" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>신청일</span>
                            <span className="text-[12px]" style={{ color: "#636366" }}>{new Date(application.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                    </div>
                </div>

                {/* 버튼 */}
                {application.status === "REJECTED" && (
                    <button onClick={() => setApplication(null)}
                        className="w-full py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.99]"
                        style={{ background: "#ff9500", borderRadius: 12 }}>
                        재신청하기
                    </button>
                )}
                {application.status === "APPROVED" && (
                    <Link href="/store/register">
                        <button className="w-full py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.99]"
                            style={{ background: "rgb(74,123,247)", borderRadius: 12 }}>
                            테마 등록하러 가기
                        </button>
                    </Link>
                )}
            </div>
        );
    }

    // ── 제출 완료 ──
    if (done) {
        return (
            <div className="flex flex-col items-center gap-6 py-24 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.12)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <div>
                    <p className="text-[20px] font-bold mb-1.5" style={{ color: "#1c1c1e" }}>신청이 완료되었어요!</p>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#8e8e93" }}>검토 후 이메일로 안내드릴게요.<br/>영업일 기준 3일 이내에 결과를 알려드려요.</p>
                </div>
                <button onClick={() => router.push("/mypage")}
                    className="mt-4 px-8 py-3 rounded-full text-[14px] font-medium transition-opacity hover:opacity-70"
                    style={{ background: "#1c1917", color: "#fafaf9" }}>
                    마이페이지로
                </button>
            </div>
        );
    }

    // ── 신청 폼 ──
    return (
        <div className="flex flex-col gap-10 pt-10">
            {/* 헤더 */}
            <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "#a8a29e" }}>Creator</p>
                <h2 className="text-[24px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>크리에이터 입점 신청</h2>
                <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>심사 후 영업일 기준 3일 이내에 결과를 이메일로 안내드립니다.</p>
            </div>

            <div className="flex flex-col gap-10" style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 32 }}>

                {/* 01 — 자기소개 */}
                <div>
                    <FieldLabel num="01" label="자기소개" required sub="테마 제작 스타일, 영감 등을 자유롭게 소개해주세요. (최대 200자)" />
                    <textarea rows={5} value={reason} onChange={e => setReason(e.target.value.slice(0, 200))}
                        placeholder="최소 10자 이상 입력해주세요."
                        className="w-full py-2 text-[14px] resize-none"
                        style={inputStyle(focusedField === "reason")}
                        onFocus={() => setFocusedField("reason")} onBlur={() => setFocusedField(null)} />
                    <div className="flex justify-end mt-1">
                        <span className="text-[11px]" style={{ color: reason.length > 180 ? "#ff3b30" : "#a8a29e" }}>{reason.length} / 200</span>
                    </div>
                </div>

                {/* 02 — 포트폴리오 */}
                <div>
                    <FieldLabel num="02" label="SNS / 포트폴리오 링크" sub="인스타그램, 블로그, 노션 등 작업물을 확인할 수 있는 링크 (선택)" />
                    <input type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)}
                        placeholder="https://..."
                        className="w-full py-2 text-[14px]"
                        style={inputStyle(focusedField === "portfolio")}
                        onFocus={() => setFocusedField("portfolio")} onBlur={() => setFocusedField(null)} />
                </div>

                {/* 03 — 제작 경험 */}
                <div>
                    <FieldLabel num="03" label="테마 제작 경험" required />
                    <div className="flex gap-3">
                        {[{ val: true, label: "있어요" }, { val: false, label: "없어요" }].map(({ val, label }) => (
                            <button key={String(val)} type="button" onClick={() => setExperience(val)}
                                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                                style={{
                                    background: experience === val ? "rgba(255,149,0,0.08)" : "rgba(0,0,0,0.03)",
                                    color: experience === val ? "rgb(180,90,0)" : "#78716c",
                                    border: experience === val ? "1.5px solid rgba(255,149,0,0.3)" : "1.5px solid transparent",
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 04 — 사용 툴 */}
                <div>
                    <FieldLabel num="04" label="주로 사용하는 툴" sub="복수 선택 가능 (선택)" />
                    <div className="flex flex-wrap gap-2">
                        {TOOLS.map(t => {
                            const on = selectedTools.includes(t);
                            return (
                                <button key={t} type="button" onClick={() => toggleTool(t)}
                                    className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                                    style={{
                                        background: on ? "rgba(255,149,0,0.08)" : "rgba(0,0,0,0.03)",
                                        color: on ? "rgb(180,90,0)" : "#78716c",
                                        border: on ? "1.5px solid rgba(255,149,0,0.3)" : "1.5px solid transparent",
                                    }}>
                                    {on && <span className="mr-1">✓</span>}{t}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 05 — 샘플 이미지 */}
                <div>
                    <FieldLabel num="05" label="대표 샘플 이미지" required sub="최소 1개, 최대 3개 업로드 (JPG/PNG)" />
                    {/* 드롭 존 */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files); }}
                        onClick={() => images.length < 3 && fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all"
                        style={{
                            border: `1.5px dashed ${dragging ? "#FF9500" : "rgba(0,0,0,0.15)"}`,
                            background: dragging ? "rgba(255,149,0,0.04)" : "rgba(0,0,0,0.02)",
                            padding: 28, display: images.length === 0 ? "flex" : "none",
                        }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <p className="text-[13px] mt-3" style={{ color: "#a8a29e" }}>클릭하거나 이미지를 드래그해서 업로드</p>
                        <p className="text-[11px] mt-1" style={{ color: "#d6d3d1" }}>최대 3장</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={e => addImages(e.target.files ?? [])} />
                    {/* 미리보기 */}
                    {images.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                            {previews.map((src, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
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
                            {images.length < 3 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-xl flex flex-col items-center justify-center transition-opacity hover:opacity-70"
                                    style={{ border: "1.5px dashed rgba(0,0,0,0.15)", background: "rgba(0,0,0,0.02)" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    <span className="text-[10px] mt-1.5" style={{ color: "#d6d3d1" }}>추가</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 06 — 동의 */}
                <div>
                    <FieldLabel num="06" label="동의 사항" required />
                    <div className="flex flex-col gap-3">
                        {[
                            "직접 제작한 오리지널 작품임을 확인합니다",
                            "타인의 저작권을 침해하지 않음을 확인합니다",
                            "카꾸미 크리에이터 운영 정책에 동의합니다",
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-3 cursor-pointer select-none"
                                onClick={() => toggleAgree(i)}>
                                <div
                                    className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                    style={{
                                        background: agrees[i] ? "#FF9500" : "transparent",
                                        border: agrees[i] ? "1.5px solid #FF9500" : "1.5px solid #d6d3d1",
                                    }}>
                                    {agrees[i] && (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 에러 */}
            {error && (
                <div className="px-4 py-3 rounded-xl text-[13px]"
                    style={{ background: "rgba(255,59,48,0.06)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.12)" }}>
                    {error}
                </div>
            )}

            {/* 미충족 항목 안내 */}
            {!isValid && !error && (
                <div className="flex flex-col gap-1 px-4 py-3 rounded-xl text-[12px]"
                    style={{ background: "rgba(0,0,0,0.03)", color: "#a8a29e" }}>
                    <p className="font-medium mb-0.5" style={{ color: "#78716c" }}>아직 필요한 항목이 있어요</p>
                    {!reasonOk && <p>• 자기소개를 10자 이상 입력해주세요</p>}
                    {!experienceOk && <p>• 테마 제작 경험을 선택해주세요</p>}
                    {!imagesOk && <p>• 샘플 이미지를 1개 이상 업로드해주세요</p>}
                    {!agreesOk && <p>• 동의 사항을 모두 체크해주세요</p>}
                </div>
            )}

            {/* 제출 버튼 */}
            <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3.5 text-[15px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-40"
                style={{ background: isValid ? "#FF9500" : "#c4b5a0", borderRadius: 14, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        신청 중…
                    </span>
                ) : "신청하기"}
            </button>
        </div>
    );
}
