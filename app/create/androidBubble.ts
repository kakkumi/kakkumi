/**
 * Android 카카오톡 테마 9-patch 이미지 생성 유틸리티
 * 공식 제작 가이드 (26.1.0) 기준
 */

function dataURLtoObjectURL(dataUrl: string): string {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return URL.createObjectURL(new Blob([u8arr], { type: mime }));
}

/** 둥근 모서리 사각형 path 그리기 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Android 9-patch 말풍선 PNG 생성 (xxhdpi 기준)
 * @param bgColor  말풍선 배경 색상 (#RRGGBB)
 * @param side     "send" (보낸 메시지) | "receive" (받은 메시지)
 * @param hasTail  꼬리 여부: 01 = true, 02 = false
 * @returns        objectURL (PNG)
 */
export function drawAndroid9PatchBubble(
  bgColor: string,
  side: "send" | "receive",
  hasTail: boolean
): string {
  // xxhdpi 기준 크기 (dp × 3)
  const BW = 108; // 말풍선 본체 너비
  const BH = 60;  // 말풍선 높이
  const R  = 16;  // 모서리 반경
  const TW = 14;  // 꼬리 가로 돌출
  const TH = 14;  // 꼬리 세로 길이

  // 꼬리가 있으면 이미지 너비를 TW만큼 확장
  const W = hasTail ? BW + TW : BW;
  const H = BH;

  // 9-patch 캔버스: 상하좌우 +1px 테두리
  const CW = W + 2;
  const CH = H + 2;

  const canvas = document.createElement("canvas");
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CW, CH);

  // ── 본체 그리기 (콘텐츠 시작 좌표 = 1,1) ──
  ctx.fillStyle = bgColor;
  ctx.save();
  ctx.translate(1, 1);

  if (!hasTail) {
    // 02: 꼬리 없는 단순 둥근 사각형 (그룹 연속 메시지)
    drawRoundedRect(ctx, 0, 0, W, H, R);
    ctx.fill();
  } else if (side === "send") {
    // 01 (보낸 메시지): 꼬리가 오른쪽에 돌출
    // 말풍선 본체 [0..BW], 꼬리는 [BW..BW+TW] 우하단
    drawRoundedRect(ctx, 0, 0, BW, H, R);
    ctx.fill();
    // 꼬리 삼각형 (우하단)
    ctx.beginPath();
    ctx.moveTo(BW - R,      H - TH); // 꼬리 상단 (본체와 연결)
    ctx.lineTo(BW + TW,     H);      // 꼬리 끝점
    ctx.lineTo(BW - R,      H);      // 꼬리 하단 (본체 우측 하단)
    ctx.closePath();
    ctx.fill();
  } else {
    // 01 (받은 메시지): 꼬리가 왼쪽에 돌출
    // 꼬리 [0..TW], 말풍선 본체 [TW..TW+BW]
    drawRoundedRect(ctx, TW, 0, BW, H, R);
    ctx.fill();
    // 꼬리 삼각형 (좌하단)
    ctx.beginPath();
    ctx.moveTo(TW + R, H - TH); // 꼬리 상단 (본체와 연결)
    ctx.lineTo(0,      H);      // 꼬리 끝점
    ctx.lineTo(TW + R, H);      // 꼬리 하단 (본체 좌측 하단)
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // ── 9-patch 마커 (검정 1px 픽셀) ──
  ctx.fillStyle = "#000000";

  // 말풍선 본체 시작 X (캔버스 기준, 테두리 +1 포함)
  const bStartX = side === "receive" && hasTail ? 1 + TW : 1;

  // 가로 stretch 구간 (상단 테두리): 본체 중앙 (R ~ BW-R)
  const hFrom = bStartX + R;
  const hTo   = bStartX + BW - R;
  for (let x = hFrom; x <= hTo; x++) {
    ctx.fillRect(x, 0, 1, 1);       // top  → stretch
    ctx.fillRect(x, CH - 1, 1, 1);  // bottom → content zone
  }

  // 세로 stretch 구간 (좌측 테두리): 본체 상단 R ~ 꼬리 위 R
  const vFrom = 1 + R;
  const vTo   = 1 + H - R - (hasTail ? TH : 0);
  for (let y = vFrom; y <= vTo; y++) {
    ctx.fillRect(0, y, 1, 1);       // left  → stretch
    ctx.fillRect(CW - 1, y, 1, 1);  // right → content zone
  }

  return dataURLtoObjectURL(canvas.toDataURL("image/png"));
}

/**
 * 단색 9-patch PNG 생성 (탭바 배경 등)
 * @param color  색상 (#RRGGBB)
 * @param w      콘텐츠 너비 (px)
 * @param h      콘텐츠 높이 (px)
 */
export function drawAndroidSolidNinePatch(
  color: string,
  w: number,
  h: number
): string {
  const CW = w + 2;
  const CH = h + 2;
  const canvas = document.createElement("canvas");
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;

  // 콘텐츠 영역 채우기
  ctx.fillStyle = color;
  ctx.fillRect(1, 1, w, h);

  // 9-patch 마커: 전체 영역 stretch + content
  ctx.fillStyle = "#000000";
  for (let y = 1; y <= h; y++) {
    ctx.fillRect(0,      y, 1, 1); // left  (stretch)
    ctx.fillRect(CW - 1, y, 1, 1); // right (content)
  }
  for (let x = 1; x <= w; x++) {
    ctx.fillRect(x, 0,      1, 1); // top    (stretch)
    ctx.fillRect(x, CH - 1, 1, 1); // bottom (content)
  }

  const dataURL = canvas.toDataURL("image/png");
  const arr  = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return URL.createObjectURL(new Blob([u8arr], { type: mime }));
}

/**
 * 업로드된 이미지 URL → 9-patch PNG (비동기)
 * 전체 이미지를 stretch 영역으로 처리
 */
export async function drawAndroidImageNinePatch(imageUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload  = () => resolve(i);
    i.onerror = () => reject(new Error("이미지 로드 실패"));
    i.src = imageUrl;
  });

  const CW = img.width  + 2;
  const CH = img.height + 2;
  const canvas = document.createElement("canvas");
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;

  // 이미지 콘텐츠 (1,1) 위치에 그리기
  ctx.drawImage(img, 1, 1);

  // 9-patch 마커: 전체 stretch + content
  ctx.fillStyle = "#000000";
  for (let y = 1; y <= img.height; y++) {
    ctx.fillRect(0,      y, 1, 1);
    ctx.fillRect(CW - 1, y, 1, 1);
  }
  for (let x = 1; x <= img.width; x++) {
    ctx.fillRect(x, 0,      1, 1);
    ctx.fillRect(x, CH - 1, 1, 1);
  }

  return dataURLtoObjectURL(canvas.toDataURL("image/png"));
}

