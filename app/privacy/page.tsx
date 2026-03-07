import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <main className="flex-1 max-w-[760px] mx-auto w-full px-6 pt-16 pb-24">
                <div className="mb-10">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>Legal</p>
                    <h1 className="text-[28px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>개인정보처리방침</h1>
                    <p className="text-[13px] mt-2" style={{ color: "#a8a29e" }}>최종 업데이트: 2026년 3월 7일</p>
                </div>

                <div className="flex flex-col gap-10" style={{ color: "#1c1917" }}>

                    {[
                        {
                            title: "제1조 (개인정보의 처리 목적)",
                            content: `주식회사 카꾸미(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.\n\n① 회원 가입 및 관리: 회원제 서비스 제공, 본인 확인, 서비스 부정 이용 방지\n② 서비스 제공: 테마 제작 및 스토어 서비스, 결제 및 정산, 콘텐츠 제공\n③ 고객 지원: 1:1 문의 응대, 불만 처리, 공지사항 전달`,
                        },
                        {
                            title: "제2조 (수집하는 개인정보 항목)",
                            content: `① 카카오 소셜 로그인을 통해 다음 정보를 수집합니다.\n  · 필수: 카카오 계정 ID, 이메일 주소, 프로필 이름\n  · 선택: 프로필 사진\n\n② 서비스 이용 과정에서 다음 정보가 자동 생성되어 수집될 수 있습니다.\n  · IP 주소, 쿠키, 서비스 이용 기록, 접속 로그`,
                        },
                        {
                            title: "제3조 (개인정보의 처리 및 보유 기간)",
                            content: `① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.\n\n② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.\n  · 회원 정보: 회원 탈퇴 시까지 (탈퇴 후 3일간 재가입 방지용 보관 후 즉시 삭제)\n  · 결제 및 거래 기록: 전자상거래법에 따라 5년\n  · 서비스 접속 기록: 통신비밀보호법에 따라 3개월`,
                        },
                        {
                            title: "제4조 (개인정보의 제3자 제공)",
                            content: `회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.\n\n① 이용자가 사전에 동의한 경우\n② 법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`,
                        },
                        {
                            title: "제5조 (개인정보 처리 위탁)",
                            content: `회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.\n\n  · 카카오(Kakao): 소셜 로그인 인증\n  · 토스페이먼츠(Toss Payments): 결제 처리\n  · 클라우드 인프라 제공업체: 데이터 저장 및 서버 운영\n\n위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.`,
                        },
                        {
                            title: "제6조 (정보주체의 권리·의무)",
                            content: `① 이용자는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.\n  1. 개인정보 열람 요구\n  2. 오류 등이 있을 경우 정정 요구\n  3. 삭제 요구\n  4. 처리 정지 요구\n\n② 위 권리 행사는 1:1 문의 또는 이메일(aaa@kakkumi.com)을 통해 하실 수 있습니다.`,
                        },
                        {
                            title: "제7조 (개인정보의 파기)",
                            content: `① 회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.\n\n② 파기 방법\n  · 전자적 파일 형태의 정보: 복원이 불가능한 방법으로 영구 삭제\n  · 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각`,
                        },
                        {
                            title: "제8조 (쿠키의 사용)",
                            content: `① 회사는 세션 관리 및 로그인 유지를 위해 쿠키를 사용합니다.\n② 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.`,
                        },
                        {
                            title: "제9조 (개인정보 보호책임자)",
                            content: `회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 개인정보 관련 불만 처리 및 피해 구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n  · 개인정보 보호책임자: 김나윤\n  · 이메일: aaa@kakkumi.com`,
                        },
                        {
                            title: "제10조 (개인정보 처리방침 변경)",
                            content: `이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여 고지할 것입니다.`,
                        },
                        {
                            title: "부칙",
                            content: `이 개인정보처리방침은 2026년 3월 7일부터 시행됩니다.`,
                        },
                    ].map((section, i) => (
                        <div key={i}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>{section.title}</span>
                                <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                            </div>
                            <p className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "#44403c" }}>
                                {section.content}
                            </p>
                        </div>
                    ))}

                </div>
            </main>
            <Footer />
        </div>
    );
}
