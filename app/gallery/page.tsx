"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── 타입 ──────────────────────────────────────────
type GalleryPost = {
    id: string; userId: string; themeName: string; description: string | null;
    images: string[]; storeLink: string | null; themeId: string | null;
    createdAt: string; liked: boolean; likeCount: number; commentCount: number;
    userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
    userRole: string;
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

function getAvatarSrc(role: string, avatar: string | null, image: string | null): string | null {
    if (role === "CREATOR" || role === "ADMIN") return "/creator.png";
    // USER: avatarUrl이 있으면 PRO 유저가 설정한 커스텀 사진
    return avatar ?? image ?? null;
}

function Avatar({ avatar, image, name, role, size = 32, onClick }: { avatar: string | null; image: string | null; name: string; role: string; size?: number; onClick?: (e: React.MouseEvent) => void }) {
    const src = getAvatarSrc(role, avatar, image);
    const fallbackSrc = role === "CREATOR" || role === "ADMIN" ? "/creator.png" : "/user.png";
    if (src) return (
        <Image
            src={src} alt={name} width={size} height={size}
            className="rounded-full object-cover"
            style={{ width: size, height: size, cursor: onClick ? "pointer" : "default" }}
            onClick={onClick}
            unoptimized
        />
    );
    return (
        <Image
            src={fallbackSrc} alt={name} width={size} height={size}
            className="rounded-full object-cover"
            style={{ width: size, height: size, cursor: onClick ? "pointer" : "default" }}
            onClick={onClick}
        />
    );
}

// ── 게시글 카드 ──────────────────────────────────
function PostCard({ post, myId, onLike, onNavigate }: {
    post: GalleryPost; myId: string | null;
    onLike: (id: string) => void;
    onNavigate: (id: string) => void;
}) {
    const displayName = post.userNickname ?? post.userName;

    return (
        <div
            className="group rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}
            onClick={() => onNavigate(post.id)}
        >
            {/* 이미지 */}
            <div className="relative w-full" style={{ paddingBottom: "100%", background: "#f5f5f5" }}>
                {post.images[0] && (
                    <Image src={post.images[0]} alt={post.themeName} fill className="object-cover" />
                )}
                {post.images.length > 1 && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.45)" }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                        </svg>
                    </div>
                )}
            </div>

            {/* 하단 정보 */}
            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                {/* 프사 + 닉네임 + 시간 */}
                <div className="flex items-center gap-2 min-w-0">
                    <Link href={`/creator/${post.userId}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <Avatar avatar={post.userAvatar} image={post.userImage} name={displayName} role={post.userRole} size={22} />
                    </Link>
                    <Link
                        href={`/creator/${post.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] font-medium truncate hover:underline"
                        style={{ color: "#78716c" }}
                    >
                        {displayName}
                    </Link>
                    <span className="text-[11px] shrink-0" style={{ color: "#d6d3d1" }}>{timeAgo(post.createdAt)}</span>
                </div>
                {/* 좋아요 + 댓글 */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); if (myId) onLike(post.id); }}
                        className="flex items-center gap-0.5 transition-opacity hover:opacity-60"
                        style={{ color: post.liked ? "#FF3B30" : "#c8c4c0" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span className="text-[11px]">{post.likeCount}</span>
                    </button>
                    <div className="flex items-center gap-0.5" style={{ color: "#c8c4c0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span className="text-[11px]">{post.commentCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── 메인 페이지 ──────────────────────────────────
export default function GalleryPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<GalleryPost[]>([]);
    const [sort, setSort] = useState<"latest" | "likes">("latest");
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetch("/api/auth/session").then((r) => r.json()).then((d) => {
            if (d?.session) { setIsLoggedIn(true); setMyId(d.session.dbId ?? null); }
        }).catch(() => {});
    }, []);

    const fetchPosts = useCallback(async (p = 1, s = sort) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/gallery?sort=${s}&page=${p}`);
            const data = await res.json() as { posts: GalleryPost[]; total: number };
            setPosts(p === 1 ? data.posts : (prev) => [...prev, ...data.posts]);
            setTotal(data.total);
        } finally {
            setLoading(false);
        }
    }, [sort]);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, sort);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    const handleLike = async (postId: string) => {
        if (!myId) return;
        const res = await fetch(`/api/gallery/${postId}/like`, { method: "POST" });
        const data = await res.json() as { liked: boolean };
        setPosts((prev) => prev.map((p) =>
            p.id === postId ? { ...p, liked: data.liked, likeCount: p.likeCount + (data.liked ? 1 : -1) } : p
        ));
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-5 pt-12 pb-24">
                {/* 헤더 */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>Gallery</p>
                        <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>꾸미 갤러리</h1>
                        <p className="text-[14px] mt-1" style={{ color: "#78716c" }}>카꾸미로 만든 테마를 소개해보세요!</p>
                    </div>
                    {isLoggedIn && (
                        <button
                            onClick={() => router.push("/gallery/new")}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-70"
                            style={{ background: "#1c1917", color: "#fafaf9" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                            테마 소개하기
                        </button>
                    )}
                </div>

                {/* 정렬 탭 */}
                <div className="flex items-center gap-1.5 mb-8">
                    {(["latest", "likes"] as const).map((s) => (
                        <button key={s} onClick={() => setSort(s)}
                            className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                            style={{
                                backgroundColor: sort === s ? "rgb(74,123,247)" : "transparent",
                                color: sort === s ? "#fff" : "#78716c",
                                border: `1px solid ${sort === s ? "rgb(74,123,247)" : "#e7e5e4"}`,
                            }}>
                            {s === "latest" ? "최신순" : "좋아요순"}
                        </button>
                    ))}
                </div>

                {/* 그리드 */}
                {loading && posts.length === 0 ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-stone-400 animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-32">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                        </svg>
                        <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 게시글이 없어요. 첫 번째로 소개해보세요!</p>
                    </div>
                ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} myId={myId} onLike={handleLike} onNavigate={(id) => router.push(`/gallery/${id}`)} />
                        ))}
                    </div>
                )}

                {/* 더보기 */}
                {posts.length < total && !loading && (
                    <div className="flex justify-center mt-10">
                        <button onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
                            className="px-6 py-2 rounded-full text-[13px] font-medium transition-opacity hover:opacity-60"
                            style={{ border: "1px solid #e7e5e4", color: "#78716c" }}>
                            더 보기
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
