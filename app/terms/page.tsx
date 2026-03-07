import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <main className="flex-1 max-w-[760px] mx-auto w-full px-6 pt-16 pb-24">
                <div className="mb-10">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>Legal</p>
                    <h1 className="text-[28px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>이용약관</h1>
                    <p className="text-[13px] mt-2" style={{ color: "#a8a29e" }}>최종 업데이트: 2026년 3월 7일</p>
                </div>

                <div className="flex flex-col gap-10" style={{ color: "#1c1917" }}>

                    {[
                        {
                            title: "제1조 (목적)",
                            content: `이 약관은 주식회사 카꾸미(이하 "회사")가 운영하는 카꾸미 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
                        },
                        {
                            title: "제2조 (정의)",
                            content: `① "서비스"란 회사가 제공하는 카카오톡 테마 제작 및 스토어 플랫폼 서비스를 의미합니다.\n② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n③ "회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 자를 말합니다.\n④ "크리에이터"란 회사의 심사를 통과하여 테마를 스토어에 등록·판매할 수 있는 회원을 말합니다.`,
                        },
                        {
                            title: "제3조 (약관의 효력 및 변경)",
                            content: `① 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.\n② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 이 약관을 변경할 수 있습니다.\n③ 약관이 변경되는 경우 회사는 변경 내용과 적용 일자를 명시하여 서비스 내 공지사항 또는 이메일 등을 통해 이용자에게 사전 고지합니다.`,
                        },
                        {
                            title: "제4조 (서비스의 제공)",
                            content: `① 회사는 다음과 같은 서비스를 제공합니다.\n  1. 카카오톡 테마 제작 도구 제공\n  2. 테마 스토어 운영 (테마 판매 및 구매)\n  3. 크리에이터 수익 정산 서비스\n  4. 기타 회사가 정하는 서비스\n② 서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등 필요한 경우 일시 중단될 수 있습니다.`,
                        },
                        {
                            title: "제5조 (회원가입 및 계정)",
                            content: `① 이용자는 카카오 계정을 통한 소셜 로그인 방식으로 회원가입을 할 수 있습니다.\n② 회원은 가입 시 입력한 정보가 정확하고 최신 상태를 유지하도록 해야 합니다.\n③ 회원의 계정은 본인만 사용할 수 있으며, 타인에게 양도하거나 대여할 수 없습니다.\n④ 계정 도용 등의 문제가 발생할 경우 즉시 회사에 알려야 합니다.`,
                        },
                        {
                            title: "제6조 (결제 및 환불)",
                            content: `① 테마 구매는 서비스 내 결제 수단을 통해 이루어집니다.\n② 구매 후 7일 이내에 다운로드하지 않은 경우 환불 신청이 가능합니다.\n③ 환불 금액은 적립금으로 즉시 지급되며, 현금 환불은 지원하지 않습니다.\n④ 무료 테마는 환불 대상이 아닙니다.\n⑤ 결제 수단의 오류나 문제가 발생할 경우 1:1 문의를 통해 처리하실 수 있습니다.`,
                        },
                        {
                            title: "제7조 (저작권 및 지식재산권)",
                            content: `① 크리에이터가 등록한 테마의 저작권은 해당 크리에이터에게 있습니다.\n② 이용자는 구매한 테마를 개인적인 용도로만 사용할 수 있으며, 재배포·수정·상업적 이용은 금지됩니다.\n③ 타인의 저작권을 침해하는 콘텐츠는 즉시 삭제 조치될 수 있습니다.\n④ 회사의 서비스 로고, 디자인 등은 회사의 지식재산권으로 보호됩니다.`,
                        },
                        {
                            title: "제8조 (이용자의 의무)",
                            content: `이용자는 다음 행위를 하여서는 안 됩니다.\n  1. 타인의 개인정보 도용 및 허위 정보 등록\n  2. 서비스의 비정상적인 이용 (자동화 프로그램 사용 등)\n  3. 타인의 저작권, 명예, 개인정보를 침해하는 행위\n  4. 불법 콘텐츠 등록 및 유포\n  5. 회사의 사전 승낙 없이 서비스를 영리 목적으로 이용하는 행위`,
                        },
                        {
                            title: "제9조 (서비스 이용 제한)",
                            content: `① 회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우, 경고·이용 정지·영구 이용 제한 등의 조치를 취할 수 있습니다.\n② 이용 제한 조치에 이의가 있는 경우 1:1 문의를 통해 이의신청을 할 수 있습니다.`,
                        },
                        {
                            title: "제10조 (면책조항)",
                            content: `① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.\n② 이용자의 귀책사유로 발생한 손해에 대해 회사는 책임을 지지 않습니다.\n③ 회사는 이용자 간 또는 이용자와 제3자 간의 분쟁에 개입하지 않습니다.`,
                        },
                        {
                            title: "제11조 (분쟁 해결)",
                            content: `① 서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우, 원만한 해결을 위해 상호 협의합니다.\n② 협의가 되지 않을 경우 회사의 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.`,
                        },
                        {
                            title: "부칙",
                            content: `이 약관은 2026년 3월 7일부터 시행됩니다.`,
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
