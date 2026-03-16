"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";

type Comment = {
    id: string; content: string; isDeleted: boolean; createdAt: string; parentId: string | null;
    userId: string; userNickname: string | null; userName: string;
    userAvatar: string | null; userImage: string | null; userRole: string;
    reportCount: number; myReported: boolean;
};
type PostDetail = {
    id: string; userId: string; themeName: string; description: string | null;
    images: string[]; storeLink: string | null; themeId: string | null; createdAt: string;
    userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
    userRole: string;
    likeCount: number; commentCount: number; liked: boolean;
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}일 전`;
    const dt = new Date(iso);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

function getAvatarSrc(role: string, avatarUrl: string | null): string {
    // 커스텀 업로드 사진 (PRO 유저 - '/'로 시작하지 않는 data URL 등)
    if (avatarUrl && !avatarUrl.startsWith("/")) return avatarUrl;
    // 역할별 기본 이미지
    if (role === "CREATOR" || role === "ADMIN") return "/creator.png";
    return "/user.png";
}

function Avatar({ avatar, name, role, size = 32 }: { avatar: string | null; image?: string | null; name: string; role: string; size?: number }) {
    const src = getAvatarSrc(role, avatar);
    return (
        <Image
            src={src} alt={name} width={size} height={size}
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
            unoptimized={!!avatar && !avatar.startsWith("/")}
        />
    );
}

function Toast({ msg }: { msg: string }) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-[13px] font-medium shadow-lg"
            style={{ background: "#1c1917", color: "#fafaf9" }}>
            {msg}
        </div>
    );
}

// ── 댓글 아이템 ───────────────────────────────────
function CommentItem({
    comment, myId, isPostOwner, depth,
    onDelete, onReport, onReply,
    replies,
}: {
    comment: Comment; myId: string | null; isPostOwner: boolean; depth: number;
    onDelete: (id: string) => void;
    onReport: (id: string) => void;
    onReply: (parentId: string, parentName: string) => void;
    replies: Comment[];
}) {
    const name = comment.userNickname ?? comment.userName;
    const canDelete = myId === comment.userId || isPostOwner;
    const canReport = !!myId && myId !== comment.userId;

    return (
        <div>
            <div className="flex items-start gap-3 py-3.5" style={{
                borderBottom: depth === 0 && replies.length === 0 ? "1px solid #f5f5f4" : "none",
                paddingLeft: depth > 0 ? 40 : 0,
            }}>
                {comment.isDeleted ? (
                    <p className="text-[13px] py-1 ml-1" style={{ color: "#d6d3d1" }}>삭제된 댓글입니다.</p>
                ) : (
                    <>
                        {depth > 0 && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        )}
                        <Link href={`/creator/${comment.userId}`} className="shrink-0">
                            <Avatar avatar={comment.userAvatar} image={comment.userImage} name={name} role={comment.userRole} size={28} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <Link href={`/creator/${comment.userId}`} className="text-[13px] font-semibold hover:underline" style={{ color: "#1c1917" }}>
                                    {name}
                                </Link>
                                <span className="text-[11px]" style={{ color: "#d6d3d1" }}>{timeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-[13px] leading-relaxed" style={{ color: "#78716c" }}>{comment.content}</p>
                            {/* 답글 버튼 (depth 0만) */}
                            {myId && depth === 0 && (
                                <button onClick={() => onReply(comment.id, name)}
                                    className="mt-1.5 text-[11px] font-medium transition-opacity hover:opacity-60"
                                    style={{ color: "#a8a29e" }}>
                                    답글
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {canDelete && (
                                <button onClick={() => onDelete(comment.id)}
                                    className="text-[11px] transition-opacity hover:opacity-60"
                                    style={{ color: "#d6d3d1" }}>삭제</button>
                            )}
                            {canReport && (
                                <button onClick={() => !comment.myReported && onReport(comment.id)}
                                    disabled={comment.myReported}
                                    className="text-[11px] transition-opacity hover:opacity-60 disabled:opacity-30"
                                    style={{ color: comment.myReported ? "#d6d3d1" : "#a8a29e" }}>
                                    {comment.myReported ? "신고됨" : "신고"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* 대댓글 */}
            {replies.length > 0 && (
                <div style={{ borderBottom: "1px solid #f5f5f4" }}>
                    {replies.map((r) => (
                        <CommentItem key={r.id} comment={r} myId={myId} isPostOwner={isPostOwner}
                            depth={1} onDelete={onDelete} onReport={onReport} onReply={onReply} replies={[]} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── 메인 페이지 ──────────────────────────────────
export default function GalleryDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const postId = params.id;

    const [post, setPost] = useState<PostDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const [toast, setToast] = useState<string | null>(null);

    // 대댓글 관련
    const [replyTo, setReplyTo] = useState<{ parentId: string; parentName: string } | null>(null);

    // 수정 관련
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    useEffect(() => {
        fetch("/api/auth/session").then((r) => r.json()).then((d) => {
            if (d?.session) setMyId(d.session.dbId ?? null);
        }).catch(() => {});
    }, []);

    const fetchPost = useCallback(async () => {
        try {
            const res = await fetch(`/api/gallery/${postId}`);
            if (!res.ok) { router.replace("/gallery"); return; }
            const data = await res.json() as { post: PostDetail; comments: Comment[] };
            setPost(data.post);
            setComments(data.comments);
            setEditName(data.post.themeName);
            setEditDesc(data.post.description ?? "");
        } finally {
            setLoading(false);
        }
    }, [postId, router]);

    useEffect(() => { fetchPost(); }, [fetchPost]);

    const handleLike = async () => {
        if (!myId || !post) return;
        const res = await fetch(`/api/gallery/${postId}/like`, { method: "POST" });
        const data = await res.json() as { liked: boolean };
        setPost((p) => p ? { ...p, liked: data.liked, likeCount: p.likeCount + (data.liked ? 1 : -1) } : p);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !myId) return;
        setSubmitting(true);
        try {
            const body: { content: string; parentId?: string } = { content: commentText.trim() };
            if (replyTo) body.parentId = replyTo.parentId;
            const res = await fetch(`/api/gallery/${postId}/comments`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            });
            if (res.ok) {
                const data = await res.json() as { comment: Comment };
                setComments((prev) => [...prev, data.comment]);
                setCommentText("");
                setReplyTo(null);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const res = await fetch(`/api/gallery/${postId}/comments/${commentId}`, { method: "DELETE" });
        if (res.ok) setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, isDeleted: true } : c));
    };

    const handleReportComment = async (commentId: string) => {
        const res = await fetch(`/api/gallery/${postId}/comments/${commentId}`, { method: "POST" });
        if (res.ok) {
            setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, myReported: true } : c));
            showToast("신고가 접수되었어요");
        } else {
            const d = await res.json() as { error?: string };
            showToast(d.error ?? "오류가 발생했습니다.");
        }
    };

    const handleDeletePost = async () => {
        if (!confirm("게시글을 삭제하시겠습니까?")) return;
        const res = await fetch(`/api/gallery/${postId}`, { method: "DELETE" });
        if (res.ok) router.replace("/gallery");
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;
        setEditSaving(true);
        try {
            const res = await fetch(`/api/gallery/${postId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeName: editName.trim(), description: editDesc.trim() }),
            });
            if (res.ok) {
                setPost((p) => p ? { ...p, themeName: editName.trim(), description: editDesc.trim() || null } : p);
                setEditing(false);
                showToast("수정됐어요");
            }
        } finally {
            setEditSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-stone-400 animate-spin" />
                </div>
            </div>
        );
    }
    if (!post) return null;

    const displayName = post.userNickname ?? post.userName;
    const isOwner = myId === post.userId;

    // 댓글 트리 구성 (최상위 댓글만, 대댓글은 replies로)
    const topComments = comments.filter((c) => !c.parentId);
    const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);
    const visibleCount = comments.filter((c) => !c.isDeleted).length;

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <div className="flex-1 max-w-[720px] mx-auto w-full px-5 pt-12 pb-24">

                {/* 뒤로 */}
                <button onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] mb-8 transition-opacity hover:opacity-60"
                    style={{ color: "#a8a29e" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    갤러리
                </button>

                {/* 작성자 + 수정/삭제 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={`/creator/${post.userId}`}>
                            <Avatar avatar={post.userAvatar} image={post.userImage} name={displayName} role={post.userRole} size={40} />
                        </Link>
                        <div>
                            <Link href={`/creator/${post.userId}`} className="text-[14px] font-semibold hover:underline" style={{ color: "#1c1917" }}>
                                {displayName}
                            </Link>
                            <p className="text-[12px]" style={{ color: "#a8a29e" }}>{timeAgo(post.createdAt)}</p>
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setEditing(true); setEditName(post.themeName); setEditDesc(post.description ?? ""); }}
                                className="text-[12px] font-medium transition-opacity hover:opacity-60"
                                style={{ color: "#a8a29e" }}>
                                수정
                            </button>
                            <button onClick={handleDeletePost}
                                className="text-[12px] transition-opacity hover:opacity-60"
                                style={{ color: "#FF3B30" }}>
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* 이미지 슬라이더 */}
                <div className="relative rounded-2xl overflow-hidden mb-6" style={{ background: "#e7e5e4" }}>
                    <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                        <Image src={post.images[imgIndex]} alt={post.themeName} fill className="object-cover" />
                    </div>
                    {post.images.length > 1 && (
                        <>
                            {imgIndex > 0 && (
                                <button onClick={() => setImgIndex((v) => v - 1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.4)" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                            )}
                            {imgIndex < post.images.length - 1 && (
                                <button onClick={() => setImgIndex((v) => v + 1)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.4)" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            )}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.images.map((_, i) => (
                                    <button key={i} onClick={() => setImgIndex(i)}
                                        className="rounded-full transition-all"
                                        style={{ width: i === imgIndex ? 16 : 6, height: 6, background: i === imgIndex ? "#fff" : "rgba(255,255,255,0.5)" }} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 제목 + 설명 (수정 모드) */}
                <div className="mb-6" style={{ borderBottom: "1px solid #e7e5e4", paddingBottom: 20 }}>
                    {editing ? (
                        <div className="flex flex-col gap-4">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50}
                                className="text-[20px] font-bold outline-none bg-transparent w-full"
                                style={{ color: "#1c1917", borderBottom: "1.5px solid rgb(74,123,247)", paddingBottom: 6 }} />
                            <div className="flex flex-col gap-1">
                                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={200} rows={3}
                                    placeholder="소개 (선택)"
                                    className="text-[14px] outline-none bg-transparent resize-none leading-relaxed w-full placeholder:text-[#d6d3d1]"
                                    style={{ color: "#78716c", borderBottom: "1px solid #e7e5e4", paddingBottom: 8 }} />
                                <span className="text-[11px] text-right" style={{ color: "#d6d3d1" }}>{editDesc.length}/200</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)}
                                    className="px-4 py-2 rounded-full text-[13px] transition-opacity hover:opacity-60"
                                    style={{ background: "rgba(0,0,0,0.05)", color: "#78716c" }}>취소</button>
                                <button onClick={handleSaveEdit} disabled={editSaving || !editName.trim()}
                                    className="px-4 py-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
                                    style={{ background: "#1c1917", color: "#fafaf9" }}>
                                    {editSaving ? "저장 중…" : "저장"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-[22px] font-bold tracking-tight mb-2" style={{ color: "#1c1917" }}>{post.themeName}</h1>
                            {post.description && <p className="text-[14px] leading-relaxed" style={{ color: "#78716c" }}>{post.description}</p>}
                            {(post.themeId || post.storeLink) && (
                                <Link href={post.themeId ? `/store/${post.themeId}` : (post.storeLink ?? "#")}
                                    className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium transition-opacity hover:opacity-70"
                                    style={{ color: "rgb(74,123,247)" }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    </svg>
                                    스토어에서 보기
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* 좋아요 (하트만) */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={handleLike}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                        style={{
                            background: post.liked ? "rgba(255,59,48,0.08)" : "rgba(0,0,0,0.04)",
                            color: post.liked ? "#FF3B30" : "#78716c",
                        }}>
                        <svg width="14" height="14" viewBox="0 0 24 24"
                            fill={post.liked ? "currentColor" : "none"}
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        좋아요 {post.likeCount}
                    </button>
                </div>

                {/* 댓글 */}
                <div style={{ borderTop: "1px solid #e7e5e4" }}>
                    <p className="text-[11px] font-semibold tracking-wide uppercase py-4" style={{ color: "#a8a29e" }}>
                        댓글 {visibleCount}
                    </p>

                    {topComments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            myId={myId}
                            isPostOwner={isOwner}
                            depth={0}
                            onDelete={handleDeleteComment}
                            onReport={handleReportComment}
                            onReply={(parentId, parentName) => {
                                setReplyTo({ parentId, parentName });
                                setTimeout(() => document.getElementById("comment-input")?.focus(), 50);
                            }}
                            replies={getReplies(c.id)}
                        />
                    ))}

                    {/* 댓글 입력 */}
                    {myId ? (
                        <form onSubmit={handleComment} className="flex flex-col gap-2 pt-5">
                            {/* 답글 대상 표시 */}
                            {replyTo && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                    style={{ background: "rgba(74,123,247,0.06)" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                                    <span className="text-[12px]" style={{ color: "rgb(74,123,247)" }}>
                                        <b>{replyTo.parentName}</b>에게 답글
                                    </span>
                                    <button type="button" onClick={() => setReplyTo(null)} className="ml-auto transition-opacity hover:opacity-60">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            )}
                            <div className="flex items-end gap-3">
                                <textarea
                                    id="comment-input"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={replyTo ? `${replyTo.parentName}에게 답글 달기…` : "댓글을 입력하세요…"}
                                    rows={2} maxLength={200}
                                    className="flex-1 text-[14px] outline-none bg-transparent resize-none leading-relaxed placeholder:text-[#d6d3d1]"
                                    style={{ color: "#1c1917", borderBottom: "1px solid #e7e5e4", paddingBottom: 8 }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (commentText.trim()) handleComment(e as unknown as React.FormEvent);
                                        }
                                    }}
                                />
                                <button type="submit" disabled={submitting || !commentText.trim()}
                                    className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
                                    style={{ background: "#1c1917", color: "#fafaf9" }}>
                                    {submitting ? "…" : "등록"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-[13px] py-4" style={{ color: "#a8a29e" }}>
                            <Link href="/api/auth/kakao" className="underline hover:opacity-70">로그인</Link> 후 댓글을 작성할 수 있어요.
                        </p>
                    )}
                </div>
            </div>

            {toast && <Toast msg={toast} />}
            <Footer />
        </div>
    );
}
