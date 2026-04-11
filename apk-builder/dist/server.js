"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const buildApk_1 = require("./buildApk");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 8080;
// 이미지 base64 포함 시 요청이 커질 수 있으므로 50MB로 설정
app.use(express_1.default.json({ limit: "50mb" }));
// ── 헬스 체크 ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── APK 빌드 ───────────────────────────────────────────────────────────────
// POST /build
// Body: BuildOptions (themeName, packageId, colors, images?)
// Response: .apk binary
app.post("/build", async (req, res) => {
    try {
        const options = req.body;
        // 필수 필드 검증
        if (!options.themeName || typeof options.themeName !== "string") {
            res.status(400).json({ error: "themeName 이 필요합니다." });
            return;
        }
        if (!options.packageId || typeof options.packageId !== "string") {
            res.status(400).json({ error: "packageId 가 필요합니다." });
            return;
        }
        if (!options.colors || typeof options.colors !== "object") {
            res.status(400).json({ error: "colors 객체가 필요합니다." });
            return;
        }
        // packageId 형식 검증 (com.kakao.talk.theme.xxx)
        if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(options.packageId)) {
            res.status(400).json({ error: "packageId 형식이 올바르지 않습니다. (예: com.kakao.talk.theme.mytheme)" });
            return;
        }
        console.log(`[BUILD] themeName="${options.themeName}" packageId="${options.packageId}"`);
        const startTime = Date.now();
        const apkBuffer = await (0, buildApk_1.buildApk)(options);
        const elapsed = Date.now() - startTime;
        console.log(`[BUILD] 완료 — ${(apkBuffer.length / 1024).toFixed(1)} KB, ${elapsed}ms`);
        const safeTitle = options.themeName.replace(/[^\w가-힣\-]/g, "_");
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeTitle)}.apk"`);
        res.setHeader("Content-Length", apkBuffer.length.toString());
        res.send(apkBuffer);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[BUILD] 오류:", message);
        res.status(500).json({ error: "APK 빌드 실패", detail: message });
    }
});
app.listen(PORT, () => {
    console.log(`apk-builder 서버 시작 — port ${PORT}`);
});
