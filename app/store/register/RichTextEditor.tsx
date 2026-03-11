'use client';

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { useCallback, useRef, useEffect, useState } from 'react';
import type { NodeViewProps } from '@tiptap/react';

// ── 커스텀 FontSize 확장 ────────────────────────────────────────
const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [{
            types: ['textStyle'],
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: el => (el as HTMLElement).style.fontSize || null,
                    renderHTML: attrs => {
                        if (!attrs.fontSize) return {};
                        return { style: `font-size: ${attrs.fontSize}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: { chain: () => unknown }) => {
                return (chain as () => { setMark: (name: string, attrs: object) => unknown })()
                    .setMark('textStyle', { fontSize });
            },
            unsetFontSize: () => ({ chain }: { chain: () => unknown }) => {
                return (chain as () => { setMark: (name: string, attrs: object) => unknown })()
                    .setMark('textStyle', { fontSize: null });
            },
        } as never;
    },
});

// ── Props: onChange → onChangeAction, onImageUpload → onImageUploadAction ──
type Props = {
    content: string;
    onChangeAction: (html: string) => void;
    onImageUploadAction: (file: File) => Promise<string>;
};

// ── 리사이즈 핸들 방향 정의 ─────────────────────────────────────
type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLES: { dir: HandleDir; style: React.CSSProperties }[] = [
    { dir: 'nw', style: { top: -5, left: -5, cursor: 'nwse-resize' } },
    { dir: 'ne', style: { top: -5, right: -5, cursor: 'nesw-resize' } },
    { dir: 'se', style: { bottom: -5, right: -5, cursor: 'nwse-resize' } },
    { dir: 'sw', style: { bottom: -5, left: -5, cursor: 'nesw-resize' } },
];

// ── 리사이즈 가능한 이미지 노드 뷰 ──────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
    const [resizing, setResizing] = useState(false);
    const [cursorStyle, setCursorStyle] = useState('default');
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ w: 0, h: 0 });
    const dirRef = useRef<HandleDir>('se');
    const imgRef = useRef<HTMLImageElement>(null);

    const onHandleMouseDown = (e: React.MouseEvent, dir: HandleDir) => {
        e.preventDefault();
        e.stopPropagation();
        dirRef.current = dir;
        startPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = {
            w: imgRef.current?.offsetWidth ?? (node.attrs.width as number) ?? 400,
            h: 0,
        };
        setResizing(true);
        setCursorStyle(HANDLES.find(h => h.dir === dir)?.style.cursor as string ?? 'nwse-resize');

        const onMove = (mv: MouseEvent) => {
            const dx = mv.clientX - startPos.current.x;
            const d = dirRef.current;
            // 모든 핸들: width만 변경 (height는 auto 유지)
            // nw/sw/w = 왼쪽 드래그 → 왼쪽으로 당길수록 커짐 (부호 반전)
            const newW = (d === 'nw' || d === 'sw')
                ? Math.round(Math.max(80, startSize.current.w - dx))
                : Math.round(Math.max(80, startSize.current.w + dx));
            updateAttributes({ width: newW, height: null });
        };
        const onUp = () => {
            setResizing(false);
            setCursorStyle('default');
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const width = (node.attrs.width as number | null) ?? undefined;

    return (
        <NodeViewWrapper
            draggable={false}
            data-drag-handle={false}
            style={{
                display: 'inline-block',
                position: 'relative',
                maxWidth: '100%',
                width: width ? `${width}px` : 'auto',
                userSelect: 'none',
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={node.attrs.src as string}
                alt={(node.attrs.alt as string) ?? ''}
                draggable={false}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 10,
                    outline: selected ? '2px solid rgb(255,149,0)' : 'none',
                    outlineOffset: 2,
                    pointerEvents: 'none',
                }}
            />

            {selected && HANDLES.map(({ dir, style }) => (
                <div
                    key={dir}
                    onMouseDown={e => onHandleMouseDown(e, dir)}
                    style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: '#fff',
                        border: '2px solid rgb(255,149,0)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                        zIndex: 10,
                        ...style,
                    }}
                />
            ))}

            {selected && width && (
                <div style={{
                    position: 'absolute', top: 6, left: 6,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    fontSize: 10, fontWeight: 600, padding: '2px 6px',
                    borderRadius: 4, pointerEvents: 'none', userSelect: 'none',
                }}>
                    {width}px
                </div>
            )}

            {resizing && (
                <div style={{ position: 'fixed', inset: 0, cursor: cursorStyle, zIndex: 9999, userSelect: 'none' }} />
            )}
        </NodeViewWrapper>
    );
}

const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: el => el.getAttribute('data-width') ? Number(el.getAttribute('data-width')) : null,
                renderHTML: attrs => attrs.width ? { 'data-width': attrs.width, style: `width:${attrs.width}px` } : {},
            },
            height: {
                default: null,
                parseHTML: el => el.getAttribute('data-height') ? Number(el.getAttribute('data-height')) : null,
                renderHTML: attrs => attrs.height ? { 'data-height': attrs.height, style: `height:${attrs.height}px` } : {},
            },
        };
    },
    addNodeView() { return ReactNodeViewRenderer(ResizableImageView); },
});

// ── 툴바 버튼 ──────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
    return (
        <button type="button" title={title} onMouseDown={e => { e.preventDefault(); onClick(); }}
            className="w-7 h-7 flex items-center justify-center rounded transition-all hover:opacity-70"
            style={{ background: active ? 'rgba(255,149,0,0.12)' : 'transparent', color: active ? 'rgb(190,100,0)' : '#555' }}>
            {children}
        </button>
    );
}

export default function RichTextEditor({ content, onChangeAction, onImageUploadAction }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const savedSelection = useRef<{ from: number; to: number } | null>(null);
    // 사용자가 색상 피커에서 고른 색 — 이 색이 설정되면 어디를 클릭하든 이 색으로 타이핑됨
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const activeColorLatest = useRef<string | null>(null);
    // ref와 state 동기화
    useEffect(() => { activeColorLatest.current = activeColor; }, [activeColor]);

    const [showFontSize, setShowFontSize] = useState(false);
    const [fontSizeInput, setFontSizeInput] = useState('14');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            Underline,
            ResizableImage.configure({ inline: false, allowBase64: false }),
            TextAlign.configure({ types: ['paragraph'] }),
            Placeholder.configure({ placeholder: '테마에 대해 자유롭게 소개해주세요. 본문, 이미지를 마음껏 넣을 수 있어요.' }),
            TextStyle,
            Color,
            FontSize,
        ],
        content,
        editorProps: {
            attributes: { class: 'prose prose-sm max-w-none outline-none min-h-[200px] px-4 py-3 text-[14px] leading-relaxed' },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!editor) return;
        const handler = () => onChangeAction(editor.getHTML());
        editor.on('update', handler);
        return () => { editor.off('update', handler); };
    }, [editor, onChangeAction]);

    // 커서 이동 시(클릭/방향키) activeColor가 있으면 storedMarks에 강제 주입
    useEffect(() => {
        if (!editor) return;
        const forceColor = () => {
            const color = activeColorLatest.current;
            if (!color) return;
            // 현재 storedMarks 가져와서 color mark 교체/추가
            const { state, view } = editor;
            const colorMark = state.schema.marks.textStyle?.create({ color });
            if (!colorMark) return;
            const existing = state.storedMarks ?? state.selection.$from.marks();
            // 기존 marks에서 textStyle의 color를 제거하고 새 색상 mark 추가
            const filtered = existing.filter(m => m.type.name !== 'textStyle');
            // 기존 textStyle mark에서 color 외 속성(fontSize 등) 보존
            const oldTextStyle = existing.find(m => m.type.name === 'textStyle');
            const mergedAttrs = { ...(oldTextStyle?.attrs ?? {}), color };
            const merged = state.schema.marks.textStyle?.create(mergedAttrs);
            if (merged) {
                view.dispatch(view.state.tr.setStoredMarks([...filtered, merged]));
            }
        };
        editor.on('selectionUpdate', forceColor);
        return () => { editor.off('selectionUpdate', forceColor); };
    }, [editor]);

    // 이미지 여러 개 삽입 (files 배열 순회)
    const handleImageInsert = useCallback(async (files: FileList | File[]) => {
        if (!editor) return;
        for (const file of Array.from(files)) {
            const url = await onImageUploadAction(file);
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor, onImageUploadAction]);

    if (!editor) return null;

    const btn = (action: () => void, active: boolean, title: string, icon: React.ReactNode) => (
        <ToolbarBtn onClick={action} active={active} title={title}>{icon}</ToolbarBtn>
    );

    const currentSize = editor.getAttributes('textStyle').fontSize as string | undefined;
    const currentColor = editor.getAttributes('textStyle').color as string | undefined;

    const applyFontSize = (val: string) => {
        const n = parseInt(val, 10);
        if (!n || n < 8 || n > 96) return;
        (editor.commands as unknown as Record<string, (v: string) => void>).setFontSize(`${n}px`);
        editor.commands.focus();
    };

    return (
        <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.1)' }}>
            {/* 툴바 */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b" style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.08)' }}>

                {/* 서식 */}
                {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), '굵게',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>)}
                {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), '기울임',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>)}
                {btn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), '밑줄',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>)}

                <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,0,0,0.1)' }} />

                {/* 폰트 크기 */}
                <div className="relative">
                    <button type="button"
                        onMouseDown={e => {
                            e.preventDefault();
                            const cur = currentSize ? parseInt(currentSize) : 14;
                            setFontSizeInput(String(cur));
                            setShowFontSize(v => !v);
                        }}
                        className="flex items-center gap-1 px-2 h-7 rounded text-[11px] font-medium transition-all hover:opacity-70"
                        style={{ background: showFontSize ? 'rgba(255,149,0,0.12)' : 'rgba(0,0,0,0.04)', color: '#555', minWidth: 52 }}>
                        {currentSize ?? '크기'}
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {showFontSize && (
                        <div className="absolute top-9 left-0 z-50 p-3 rounded-xl shadow-lg flex flex-col gap-3" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', width: 180 }}>
                            <div className="flex items-center gap-2">
                                <input type="number" min={8} max={96}
                                    value={fontSizeInput}
                                    onChange={e => setFontSizeInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { applyFontSize(fontSizeInput); setShowFontSize(false); } }}
                                    className="px-2 py-1 rounded-lg text-[13px] outline-none text-center"
                                    style={{ border: '1.5px solid rgba(255,149,0,0.4)', color: '#1a1a1a', width: 64 }} />
                                <span className="text-[11px] shrink-0" style={{ color: '#aaa' }}>px</span>
                                <button type="button"
                                    onMouseDown={e => { e.preventDefault(); applyFontSize(fontSizeInput); setShowFontSize(false); }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0"
                                    style={{ background: 'rgb(255,149,0)', color: '#fff' }}>적용</button>
                            </div>
                            <input type="range" min={8} max={72} step={1}
                                value={parseInt(fontSizeInput) || 14}
                                onChange={e => setFontSizeInput(e.target.value)}
                                className="w-full accent-orange-400" />
                            <div className="flex flex-wrap gap-1">
                                {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map(n => (
                                    <button key={n} type="button"
                                        onMouseDown={e => { e.preventDefault(); applyFontSize(String(n)); setFontSizeInput(String(n)); setShowFontSize(false); }}
                                        className="px-1.5 py-0.5 rounded text-[11px] transition-all hover:opacity-70"
                                        style={{
                                            background: currentSize === `${n}px` ? 'rgba(255,149,0,0.12)' : 'rgba(0,0,0,0.04)',
                                            color: currentSize === `${n}px` ? 'rgb(190,100,0)' : '#555',
                                            fontWeight: currentSize === `${n}px` ? 600 : 400,
                                        }}>{n}</button>
                                ))}
                            </div>
                            <button type="button"
                                onMouseDown={e => { e.preventDefault(); (editor.commands as unknown as Record<string, () => void>).unsetFontSize(); editor.commands.focus(); setShowFontSize(false); }}
                                className="text-[11px] py-0.5 rounded hover:bg-gray-50 transition-colors"
                                style={{ color: '#aeaeb2' }}>크기 초기화</button>
                        </div>
                    )}
                </div>

                {/* 텍스트 색상 */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <button
                        type="button"
                        title="텍스트 색상"
                        onMouseDown={e => {
                            e.preventDefault();
                            if (editor) {
                                const { from, to } = editor.state.selection;
                                savedSelection.current = { from, to };
                            }
                            setTimeout(() => colorInputRef.current?.click(), 0);
                        }}
                        className="w-7 h-7 flex flex-col items-center justify-center rounded transition-all hover:opacity-70"
                        style={{ background: activeColor ? 'rgba(255,149,0,0.12)' : 'transparent' }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 20h16M12 4L6 18M12 4l6 14M8.5 14h7"/>
                        </svg>
                        <div className="w-5 h-1.5 rounded-sm mt-0.5" style={{ background: activeColor ?? currentColor ?? '#1a1a1a' }} />
                    </button>
                    <input
                        ref={colorInputRef}
                        type="color"
                        defaultValue="#1a1a1a"
                        style={{
                            position: 'absolute',
                            top: '100%', left: 0,
                            width: 0, height: 0,
                            opacity: 0,
                            border: 'none',
                            padding: 0,
                            pointerEvents: 'none',
                        }}
                        onInput={e => {
                            if (!editor) return;
                            const color = (e.target as HTMLInputElement).value;
                            // activeColor 설정 → 이후 어디를 클릭해서 타이핑하든 이 색상 적용
                            setActiveColor(color);
                            const sel = savedSelection.current;
                            // 선택 영역이 있으면 해당 텍스트에 색상 적용
                            if (sel && sel.from !== sel.to) {
                                editor.chain()
                                    .setTextSelection({ from: sel.from, to: sel.to })
                                    .setColor(color)
                                    .run();
                            }
                            // storedMarks에 색상 설정 (현재 커서 위치)
                            editor.commands.setColor(color);
                        }}
                    />
                </div>

                <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,0,0,0.1)' }} />

                {/* 정렬 */}
                {btn(() => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }), '왼쪽 정렬',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>)}
                {btn(() => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), '가운데 정렬',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>)}
                {btn(() => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }), '오른쪽 정렬',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>)}

                <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,0,0,0.1)' }} />

                {/* 구분선 */}
                {btn(() => editor.chain().focus().setHorizontalRule().run(), false, '구분선',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>)}

                {/* 이미지 (multiple) */}
                <ToolbarBtn onClick={() => fileInputRef.current?.click()} active={false} title="이미지 삽입">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </ToolbarBtn>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => { if (e.target.files?.length) { handleImageInsert(e.target.files); e.target.value = ''; } }} />

                <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,0,0,0.1)' }} />

                {/* Undo / Redo */}
                {btn(() => editor.chain().focus().undo().run(), false, '실행 취소',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M3 13A9 9 0 1 0 6 6.7L3 9"/></svg>)}
                {btn(() => editor.chain().focus().redo().run(), false, '다시 실행',
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M21 13A9 9 0 1 1 18 6.7L21 9"/></svg>)}
            </div>

            {/* 폰트크기 드롭다운 외부 클릭 닫기 */}
            {showFontSize && (
                <div className="fixed inset-0 z-40" onClick={() => setShowFontSize(false)} />
            )}

            {/* 에디터 본문 */}
            <div className="rich-editor-body" style={{ background: '#fff' }}>
                <EditorContent editor={editor} />
            </div>

            <style>{`
                .rich-editor-body .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    color: #c8c8c8; pointer-events: none; float: left; height: 0;
                }
                .rich-editor-body .ProseMirror { outline: none; }
                .rich-editor-body .ProseMirror p { margin: 4px 0; color: #3a3a3c; }
                .rich-editor-body .ProseMirror ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
                .rich-editor-body .ProseMirror ol { list-style: decimal; padding-left: 20px; margin: 6px 0; }
                .rich-editor-body .ProseMirror li { margin: 2px 0; color: #3a3a3c; }
                .rich-editor-body .ProseMirror blockquote { border-left: 3px solid rgba(255,149,0,0.5); padding-left: 12px; margin: 8px 0; color: #6e6e73; font-style: italic; }
                .rich-editor-body .ProseMirror hr { border: none; border-top: 1.5px solid rgba(0,0,0,0.1); margin: 14px 0; }
                .rich-editor-body .ProseMirror img { max-width: 100%; border-radius: 10px; margin: 8px 0; display: block; user-select: none; -webkit-user-drag: none; }
                .rich-editor-body .ProseMirror strong { font-weight: 700; }
                .rich-editor-body .ProseMirror em { font-style: italic; }
                .rich-editor-body .ProseMirror s { text-decoration: line-through; }
                .rich-editor-body .ProseMirror u { text-decoration: underline; }
            `}</style>
        </div>
    );
}
