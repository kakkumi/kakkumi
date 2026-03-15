import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ThemeEditForm from "@/app/store/edit/[id]/ThemeEditForm";

export default async function ThemeEditPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) redirect("/");

    const { id } = await params;

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-[30px] font-extrabold leading-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                        테마 수정 신청
                    </h1>
                    <p className="text-[14px]" style={{ color: "#8e8e93" }}>
                        수정 내용은 관리자 검토 후 스토어에 반영됩니다.
                    </p>
                </div>
                <ThemeEditForm themeId={id} />
            </div>
            <Footer />
        </div>
    );
}
