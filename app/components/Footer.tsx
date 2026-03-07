export default function Footer() {
    return (
        <footer
            className="mt-auto px-8 py-5 flex flex-col gap-2"
            style={{ background: "#f3f3f3", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.07)" }}
        >
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[12px]" style={{ color: "#3a3a3c" }}>
                        주식회사 카꾸미 · 대표자 김나윤 · 이메일{" "}
                        <a href="mailto:aaa@kakkumi.com" className="hover:underline" style={{ color: "#3a3a3c" }}>
                            aaa@kakkumi.com
                        </a>
                    </p>
                    <p className="text-[11px]" style={{ color: "#8e8e93" }}>© 2026 카꾸미. 카카오톡과 무관한 개인 제작 툴입니다.</p>
                </div>
                <div className="flex items-center gap-5">
                    <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>이용약관</a>
                    <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>개인정보처리방침</a>
                    <a href="mailto:aaa@kakkumi.com" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>문의</a>
                    <a href="https://instagram.com/kakkumi" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="#6b6b6b" stroke="none" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
