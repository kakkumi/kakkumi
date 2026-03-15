import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "카꾸미 <kakkumi.official@gmail.com>";

export async function sendPurchaseReceipt({
    to,
    name,
    themeTitle,
    amount,
    purchaseDate,
}: {
    to: string;
    name: string;
    themeTitle: string;
    amount: number;
    purchaseDate: Date;
}) {
    if (!process.env.RESEND_API_KEY) return;

    const dateStr = purchaseDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    await resend.emails.send({
        from: FROM,
        to,
        subject: `[카꾸미] "${themeTitle}" 구매 영수증`,
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
  <div style="background: linear-gradient(135deg, #FF9500, #FF6B00); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">카꾸미</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">구매 영수증</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #1c1c1e; font-size: 16px; margin: 0 0 24px;">안녕하세요, <strong>${name}</strong>님!</p>
    <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #8e8e93; font-size: 14px;">테마명</td>
          <td style="padding: 8px 0; color: #1c1c1e; font-size: 14px; font-weight: 600; text-align: right;">${themeTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8e8e93; font-size: 14px;">결제 금액</td>
          <td style="padding: 8px 0; color: #1c1c1e; font-size: 14px; font-weight: 600; text-align: right;">${amount.toLocaleString()}원</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8e8e93; font-size: 14px;">결제 일시</td>
          <td style="padding: 8px 0; color: #1c1c1e; font-size: 14px; text-align: right;">${dateStr}</td>
        </tr>
      </table>
    </div>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kakkumi.com"}/mypage"
       style="display: block; background: #1c1c1e; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
      마이페이지에서 테마 확인하기
    </a>
  </div>
  <div style="padding: 20px 32px; border-top: 1px solid #e5e5e5; text-align: center;">
    <p style="color: #8e8e93; font-size: 12px; margin: 0;">구매 후 7일 이내 환불 신청이 가능합니다.</p>
  </div>
</div>
        `.trim(),
    });
}

export async function sendThemeRejectionEmail({
    to,
    name,
    themeTitle,
    reason,
}: {
    to: string;
    name: string;
    themeTitle: string;
    reason: string;
}) {
    if (!process.env.RESEND_API_KEY) return;

    await resend.emails.send({
        from: FROM,
        to,
        subject: `[카꾸미] "${themeTitle}" 테마 등록 반려 안내`,
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
  <div style="background: linear-gradient(135deg, #1c1c1e, #3a3a3c); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">카꾸미</h1>
    <p style="color: rgba(255,255,255,0.65); margin: 8px 0 0; font-size: 14px;">테마 등록 반려 안내</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #1c1c1e; font-size: 16px; margin: 0 0 16px;">안녕하세요, <strong>${name}</strong>님.</p>
    <p style="color: #3a3a3c; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      제출하신 <strong>"${themeTitle}"</strong> 테마가 아래의 사유로 반려되었습니다.<br>
      수정 후 다시 등록해 주세요.
    </p>
    <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="color: #e11d48; font-size: 13px; font-weight: 600; margin: 0 0 8px;">반려 사유</p>
      <p style="color: #3a3a3c; font-size: 14px; margin: 0; line-height: 1.6;">${reason}</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kakkumi.com"}/mypage"
       style="display: block; background: #1c1c1e; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
      마이페이지에서 테마 수정하기
    </a>
  </div>
  <div style="padding: 20px 32px; border-top: 1px solid #e5e5e5; text-align: center;">
    <p style="color: #8e8e93; font-size: 12px; margin: 0;">문의가 있으시면 고객 지원 센터를 이용해 주세요.</p>
  </div>
</div>
        `.trim(),
    });
}

export async function sendCreditExpiryWarning({
    to,
    name,
    amount,
    expiresAt,
}: {
    to: string;
    name: string;
    amount: number;
    expiresAt: Date;
}) {
    if (!process.env.RESEND_API_KEY) return;

    const dateStr = expiresAt.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    await resend.emails.send({
        from: FROM,
        to,
        subject: "[카꾸미] 적립금 만료 예정 안내 (30일 이내)",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
  <div style="background: linear-gradient(135deg, #FF9500, #FF6B00); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">카꾸미</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">적립금 만료 예정 안내</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #1c1c1e; font-size: 16px; margin: 0 0 24px;">안녕하세요, <strong>${name}</strong>님!</p>
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #92400e; font-size: 13px; font-weight: 600; margin: 0 0 12px;">⚠️ 곧 만료되는 적립금</p>
      <p style="color: #1c1c1e; font-size: 22px; font-weight: 800; margin: 0 0 8px;">${amount.toLocaleString()}원</p>
      <p style="color: #8e8e93; font-size: 13px; margin: 0;">만료일: ${dateStr}</p>
    </div>
    <p style="color: #3a3a3c; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      적립금은 만료일 이후 자동으로 소멸됩니다. 기간 내에 사용하지 않으면 환불되지 않으니 꼭 사용해 주세요!
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kakkumi.com"}/store"
       style="display: block; background: #FF9500; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
      스토어에서 테마 구경하기
    </a>
  </div>
</div>
        `.trim(),
    });
}

export async function sendCreatorApproved({ to, name }: { to: string; name: string }) {
    if (!process.env.RESEND_API_KEY) return;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kakkumi.com";
    await resend.emails.send({
        from: FROM,
        to,
        subject: "[카꾸미] 크리에이터 입점 신청이 승인되었어요! 🎉",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
  <div style="background: linear-gradient(135deg, #FF9500, #FF6B00); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">카꾸미</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">크리에이터 입점 승인</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #1c1c1e; font-size: 16px; margin: 0 0 16px;">안녕하세요, <strong>${name}</strong>님!</p>
    <p style="color: #3a3a3c; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
      카꾸미 크리에이터 입점 신청이 <strong style="color: #34c759;">승인</strong>되었습니다. 🎉<br/>
      이제 테마를 등록하고 다양한 사용자들과 공유해보세요!
    </p>
    <a href="${siteUrl}/store/register"
       style="display: block; background: #FF9500; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
      테마 등록하러 가기
    </a>
  </div>
</div>`.trim(),
    });
}

export async function sendCreatorRejected({ to, name, reason }: { to: string; name: string; reason: string }) {
    if (!process.env.RESEND_API_KEY) return;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kakkumi.com";
    await resend.emails.send({
        from: FROM,
        to,
        subject: "[카꾸미] 크리에이터 입점 신청 결과 안내",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
  <div style="background: linear-gradient(135deg, #FF9500, #FF6B00); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">카꾸미</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">크리에이터 입점 심사 결과</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #1c1c1e; font-size: 16px; margin: 0 0 16px;">안녕하세요, <strong>${name}</strong>님!</p>
    <p style="color: #3a3a3c; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
      아쉽게도 이번 입점 신청이 <strong style="color: #ff3b30;">반려</strong>되었습니다.
    </p>
    <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #92400e; font-size: 12px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">반려 사유</p>
      <p style="color: #3a3a3c; font-size: 14px; line-height: 1.6; margin: 0;">${reason}</p>
    </div>
    <p style="color: #8e8e93; font-size: 13px; line-height: 1.6; margin: 0 0 24px;">
      반려 사유를 확인하고 보완한 뒤 재신청할 수 있어요.
    </p>
    <a href="${siteUrl}/mypage/creator-apply"
       style="display: block; background: #FF9500; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
      재신청하기
    </a>
  </div>
</div>`.trim(),
    });
}

