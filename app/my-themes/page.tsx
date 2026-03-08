"use client";

import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type SavedTheme = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  trashedAt?: string | null;
  previewImageUrl: string | null;
  os: string;
  folderId?: string | null;
  trashed: boolean;
};

export type ThemeFolder = {
  id: string;
  name: string;
  createdAt: string;
};

type SortKey = "created" | "updated";
type View = "main" | "trash";

export default function MyThemesPage() {
  const [themes, setThemes] = useState<SavedTheme[]>([]);
  const [folders, setFolders] = useState<ThemeFolder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [view, setView] = useState<View>("main");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [moveModal, setMoveModal] = useState<{ themeId: string } | null>(null);
  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);

  const fetchAll = async () => {
    const [tRes, fRes] = await Promise.all([
      fetch("/api/my-themes"),
      fetch("/api/my-themes/folders"),
    ]);
    if (tRes.ok) {
      const d = await tRes.json() as { themes: SavedTheme[] };
      setThemes(d.themes);
    }
    if (fRes.ok) {
      const d = await fRes.json() as { folders: ThemeFolder[] };
      setFolders(d.folders);
    }
    setLoaded(true);
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  // 휴지통으로 이동
  const handleTrash = async (id: string) => {
    setThemes(prev => prev.map(t => t.id === id ? { ...t, trashed: true, trashedAt: new Date().toISOString() } : t));
    await fetch(`/api/my-themes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashed: true }) });
  };
  // 복원
  const handleRestore = async (id: string) => {
    setThemes(prev => prev.map(t => t.id === id ? { ...t, trashed: false, trashedAt: null } : t));
    await fetch(`/api/my-themes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashed: false }) });
  };
  // 완전 삭제
  const handlePermanentDelete = async (id: string) => {
    setThemes(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/my-themes/${id}`, { method: "DELETE" });
  };
  // 사본 만들기
  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/my-themes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duplicate: true }) });
    if (res.ok) {
      const d = await res.json() as { theme: SavedTheme };
      setThemes(prev => [d.theme, ...prev]);
    }
  };
  // 폴더 이동
  const handleMove = async (themeId: string, folderId: string | null) => {
    setThemes(prev => prev.map(t => t.id === themeId ? { ...t, folderId } : t));
    await fetch(`/api/my-themes/${themeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folderId }) });
    setMoveModal(null);
  };
  // 폴더 생성
  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const res = await fetch("/api/my-themes/folders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) {
      const d = await res.json() as { folder: ThemeFolder };
      setFolders(prev => [...prev, d.folder]);
    }
    setNewFolderName("");
    setNewFolderModal(false);
  };
  // 폴더 삭제
  const handleDeleteFolder = async (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setThemes(prev => prev.map(t => t.folderId === id ? { ...t, folderId: null } : t));
    if (openFolderId === id) setOpenFolderId(null);
    await fetch(`/api/my-themes/folders/${id}`, { method: "DELETE" });
  };
  // 휴지통 비우기
  const handleEmptyTrash = async () => {
    setThemes(prev => prev.filter(t => !t.trashed));
    setEmptyTrashConfirm(false);
    await fetch("/api/my-themes/trash", { method: "DELETE" });
  };

  // 드래그앤드롭
  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId ?? "__root__");
  };
  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const themeId = e.dataTransfer.getData("themeId");
    if (themeId) handleMove(themeId, folderId);
  };

  // 정렬
  const sorted = (list: SavedTheme[]) =>
    [...list].sort((a, b) => {
      const aTime = sortKey === "updated" ? a.updatedAt : a.createdAt;
      const bTime = sortKey === "updated" ? b.updatedAt : b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  const active = themes.filter(t => !t.trashed);
  const trashed = themes.filter(t => t.trashed);
  const displayThemes = view === "trash"
    ? sorted(trashed)
    : openFolderId
      ? sorted(active.filter(t => t.folderId === openFolderId))
      : sorted(active.filter(t => !t.folderId));

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f8" }}>
      <Header />

      <div className="flex w-full" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── 사이드바 (스토어와 동일) ── */}
        {loaded && (
          <aside className="fixed w-[160px] flex flex-col gap-0.5 px-5 pt-12">

            {/* 보관함 카테고리 레이블 */}
            <span className="text-[10.5px] font-bold tracking-[0.15em] uppercase px-2 mb-1" style={{ color: "#8e8e93" }}>
              보관함
            </span>

            {/* 전체 */}
            <button
              onClick={() => { setView("main"); setOpenFolderId(null); }}
              onDragOver={(e) => handleDragOver(e, null)}
              onDrop={(e) => handleDrop(e, null)}
              className="text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all"
              style={{
                color: view === "main" && openFolderId === null ? "#FF9500" : "#3a3a3c",
                fontWeight: view === "main" && openFolderId === null ? 700 : 500,
                outline: dragOverFolderId === "__root__" ? "1.5px dashed rgba(74,123,247,0.5)" : "none",
                background: dragOverFolderId === "__root__" ? "rgba(74,123,247,0.07)" : "transparent",
              }}
            >
              전체
            </button>

            {/* 폴더 구분선 + 레이블 */}
            <div className="mt-2.5 mb-1 h-[1px]" style={{ background: "rgba(0,0,0,0.08)" }} />
            <span className="text-[10.5px] font-bold tracking-[0.15em] uppercase px-2 mb-1" style={{ color: "#8e8e93" }}>
              폴더
            </span>

            {/* 폴더 목록 */}
            {folders.map(folder => (
              <SidebarFolderItem
                key={folder.id}
                folder={folder}
                active={view === "main" && openFolderId === folder.id}
                count={active.filter(t => t.folderId === folder.id).length}
                dragOver={dragOverFolderId === folder.id}
                onClick={() => { setView("main"); setOpenFolderId(folder.id); }}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDrop={(e) => handleDrop(e, folder.id)}
                onDelete={() => handleDeleteFolder(folder.id)}
              />
            ))}

            {/* 새 폴더 */}
            <button
              onClick={() => setNewFolderModal(true)}
              className="text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all"
              style={{ color: "rgb(74,123,247)", fontWeight: 500 }}
            >
              + 새 폴더
            </button>

            {/* 구분선 */}
            <div className="mt-2.5 mb-1 h-[1px]" style={{ background: "rgba(0,0,0,0.08)" }} />

            {/* 휴지통 */}
            <button
              onClick={() => { setView("trash"); setOpenFolderId(null); }}
              className="text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all"
              style={{
                color: view === "trash" ? "#FF9500" : "#3a3a3c",
                fontWeight: view === "trash" ? 700 : 500,
              }}
            >
              휴지통
            </button>

          </aside>
        )}

        {/* ── 메인 콘텐츠 ── */}
        {loaded && (
          <main className="flex-1 flex flex-col gap-5 px-8 pt-14 pb-24" style={{ marginLeft: 200 }}>

              {/* 상단 타이틀 */}
              <div className="mb-2">
                <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "#1a1a1a" }}>내 테마</h1>
                <p className="mt-1 text-[13px]" style={{ color: "#8e8e93" }}>카꾸미에서 직접 만든 테마들이 여기에 저장돼요</p>
              </div>

              {/* 툴바 */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {/* 뷰 타이틀 */}
                  <span className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>
                    {view === "trash" ? "휴지통" : openFolderId ? folders.find(f => f.id === openFolderId)?.name : "전체"}
                  </span>
                  <span className="text-[12px]" style={{ color: "#aeaeb2" }}>{displayThemes.length}개</span>
                  {view === "trash" && (
                    <span className="text-[11px]" style={{ color: "#aeaeb2" }}>· 30일 후 자동으로 완전히 삭제돼요</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* 정렬 */}
                  {view !== "trash" && (
                    <div className="flex items-center rounded-full p-0.5" style={{ background: "rgba(0,0,0,0.05)" }}>
                      {(["created", "updated"] as SortKey[]).map(k => (
                        <button key={k} onClick={() => setSortKey(k)}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                          style={{
                            background: sortKey === k ? "#fff" : "transparent",
                            color: sortKey === k ? "#1a1a1a" : "#8e8e93",
                            boxShadow: sortKey === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                          }}
                        >
                          {k === "created" ? "생성일 순" : "수정일 순"}
                        </button>
                      ))}
                    </div>
                  )}
                  {view !== "trash" && (
                    <Link href="/create"
                      className="flex items-center gap-1.5 text-[13px] font-semibold transition-all hover:opacity-70"
                      style={{ color: "rgb(255,149,0)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      새 테마 만들기
                    </Link>
                  )}
                  {/* 휴지통 비우기 */}
                  {view === "trash" && trashed.length > 0 && (
                    <button
                      onClick={() => setEmptyTrashConfirm(true)}
                      className="text-[12px] font-semibold transition-all hover:opacity-70"
                      style={{ color: "#ff5a4f" }}
                    >
                      모두 비우기
                    </button>
                  )}
                </div>
              </div>

              {/* 빈 상태 */}
              {displayThemes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
                  {view === "trash" ? (
                    <>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="1.8" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </div>
                      <p className="text-[15px] font-semibold" style={{ color: "#8e8e93" }}>휴지통이 비어있어요</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,0,0.07)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <p className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>저장된 테마가 없어요</p>
                      <p className="text-[13px]" style={{ color: "#8e8e93" }}>테마 만들기에서 새로운 테마를 저장해보세요</p>
                      <Link href="/create" className="mt-1 px-5 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-85"
                        style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                        테마 만들기
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-x-7 gap-y-11" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                  {displayThemes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isTrash={view === "trash"}
                      onTrash={handleTrash}
                      onRestore={handleRestore}
                      onPermanentDelete={handlePermanentDelete}
                      onDuplicate={handleDuplicate}
                      onMoveRequest={(id) => setMoveModal({ themeId: id })}
                    />
                  ))}
                </div>
              )}
            </main>
          )}
        </div>

      {/* ── 휴지통 비우기 확인 모달 ── */}
      {emptyTrashConfirm && (
        <Modal onClose={() => setEmptyTrashConfirm(false)}>
          <div className="flex flex-col items-center text-center gap-3 mb-5">
            <p className="text-[16px] font-bold" style={{ color: "#1a1a1a" }}>휴지통을 비울까요?</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#8e8e93" }}>
              휴지통의 테마 {trashed.length}개가 영구적으로 삭제돼요.<br />
              이 작업은 되돌릴 수 없어요.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEmptyTrashConfirm(false)}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold"
              style={{ color: "#8e8e93", background: "rgba(0,0,0,0.04)" }}
            >
              취소
            </button>
            <button
              onClick={handleEmptyTrash}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all hover:opacity-85"
              style={{ background: "#ff5c52", color: "#fff" }}
            >
              완전히 삭제
            </button>
          </div>
        </Modal>
      )}

      {/* ── 새 폴더 모달 ── */}
      {newFolderModal && (
        <Modal onClose={() => { setNewFolderModal(false); setNewFolderName(""); }}>
          <p className="text-[16px] font-bold mb-4" style={{ color: "#1a1a1a" }}>새 폴더</p>
          <input
            autoFocus
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); }}
            placeholder="폴더 이름"
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none mb-5"
            style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)", color: "#1a1a1a" }}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setNewFolderModal(false); setNewFolderName(""); }}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ color: "#8e8e93", background: "rgba(0,0,0,0.04)" }}>
              취소
            </button>
            <button onClick={handleCreateFolder}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: "rgb(74,123,247)", color: "#fff" }}>
              만들기
            </button>
          </div>
        </Modal>
      )}

      {/* ── 이동 모달 ── */}
      {moveModal && (
        <Modal onClose={() => setMoveModal(null)}>
          <p className="text-[16px] font-bold mb-5" style={{ color: "#1a1a1a" }}>폴더로 이동</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleMove(moveModal.themeId, null)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-colors hover:bg-black/5"
              style={{ color: "#1a1a1a" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              전체 (폴더 없음)
            </button>
            {folders.map(folder => (
              <button key={folder.id}
                onClick={() => handleMove(moveModal.themeId, folder.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-colors hover:bg-black/5"
                style={{ color: "#1a1a1a" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                {folder.name}
              </button>
            ))}
          </div>
          <button onClick={() => setMoveModal(null)}
            className="mt-5 w-full py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ color: "#8e8e93", background: "rgba(0,0,0,0.04)" }}>
            취소
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ── 폴더 사이드바 아이템 ── */
function SidebarFolderItem({ folder, active, count, dragOver, onClick, onDragOver, onDrop, onDelete }: {
  folder: ThemeFolder; active: boolean; count: number; dragOver: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="flex items-center justify-between rounded-xl transition-all"
      style={{
        background: dragOver ? "rgba(74,123,247,0.07)" : "transparent",
        outline: dragOver ? "1.5px dashed rgba(74,123,247,0.5)" : "none",
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onClick}
        className="flex-1 text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all truncate"
        style={{ color: active ? "#FF9500" : "#3a3a3c", fontWeight: active ? 700 : 500 }}
      >
        {folder.name}
      </button>
      {hover && (
        <button
          onClick={onDelete}
          className="mr-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors"
          style={{ background: "rgba(0,0,0,0.07)" }}
        >
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.8" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
      {!hover && count > 0 && (
        <span className="mr-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(0,0,0,0.06)", color: "#8e8e93" }}>{count}</span>
      )}
    </div>
  );
}

/* ── 테마 카드 ── */
function ThemeCard({ theme, isTrash, onTrash, onRestore, onPermanentDelete, onDuplicate, onMoveRequest }: {
  theme: SavedTheme;
  isTrash: boolean;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveRequest: (id: string) => void;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const formattedDate = (() => {
    try {
      const d = theme.updatedAt ?? theme.createdAt;
      return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
    } catch { return ""; }
  })();

  const daysLeft = (() => {
    if (!isTrash || !theme.trashedAt) return null;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const trashedTime = new Date(theme.trashedAt).getTime();
    const now = new Date().getTime();
    const elapsed = now - trashedTime;
    return Math.max(0, Math.ceil((THIRTY_DAYS - elapsed) / (24 * 60 * 60 * 1000)));
  })();

  return (
    <div
      draggable={!isTrash}
      onDragStart={e => { e.dataTransfer.setData("themeId", theme.id); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); }}
      style={{ position: "relative", cursor: isTrash ? "default" : "grab" }}
    >
      {/* 미리보기 */}
      <div
        onClick={() => { if (!isTrash && !menuOpen) router.push(`/create?id=${theme.id}`); }}
        className="w-full rounded-2xl overflow-hidden transition-transform duration-300"
        style={{
          aspectRatio: "9/16",
          background: "rgba(0,0,0,0.05)",
          transform: hover ? "translateY(-3px)" : "translateY(0)",
          cursor: isTrash ? "default" : "pointer",
        }}
      >
        {theme.previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={theme.previewImageUrl} alt={theme.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,149,0,0.05)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,149,0,0.35)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.18)" }}>미리보기 없음</span>
          </div>
        )}
      </div>

      {/* OS 배지 */}
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
        style={{
          background: theme.os === "ios" ? "rgba(255,149,0,0.85)" : "rgba(74,123,247,0.85)",
          color: "#fff", backdropFilter: "blur(6px)",
        }}>
        {theme.os === "ios" ? "iOS" : "Android"}
      </div>

      {/* ... 메뉴 버튼 */}
      {(hover || menuOpen) && (
        <div ref={menuRef} className="absolute top-2.5 right-2.5">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-9 rounded-2xl py-1.5 z-50"
              style={{
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
                backdropFilter: "blur(20px)",
                minWidth: 150,
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              {isTrash ? (
                <>
                  <MenuItem label="복원" icon="↩" onClick={() => { onRestore(theme.id); setMenuOpen(false); }} />
                  <MenuDivider />
                  <MenuItem label="완전히 삭제" icon="🗑" onClick={() => { onPermanentDelete(theme.id); setMenuOpen(false); }} danger />
                </>
              ) : (
                <>
                  <MenuItem label="이동" icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                  } onClick={() => { onMoveRequest(theme.id); setMenuOpen(false); }} />
                  <MenuItem label="사본 만들기" icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  } onClick={() => { onDuplicate(theme.id); setMenuOpen(false); }} />
                  <MenuDivider />
                  <MenuItem label="휴지통으로 이동" icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  } onClick={() => { onTrash(theme.id); setMenuOpen(false); }} danger />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 이름 + 날짜 */}
      <div className="mt-3 px-0.5">
        <p className="text-[13px] font-semibold truncate" style={{ color: "#1a1a1a" }}>{theme.name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#aeaeb2" }}>{formattedDate}</p>
        {daysLeft !== null && (
          <p className="text-[10px] mt-0.5" style={{ color: daysLeft <= 3 ? "#ff3b30" : "#aeaeb2" }}>
            {daysLeft === 0 ? "오늘 삭제 예정" : `${daysLeft}일 후 자동 삭제`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 메뉴 아이템 ── */
function MenuItem({ label, icon, onClick, danger }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-black/5"
      style={{ color: danger ? "#ff3b30" : "#1a1a1a" }}
    >
      <span className="w-4 flex items-center justify-center" style={{ color: danger ? "#ff3b30" : "#8e8e93" }}>{icon}</span>
      {label}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 mx-3" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }} />;
}

/* ── 모달 래퍼 ── */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl p-6 w-96" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        {children}
      </div>
    </div>
  );
}
