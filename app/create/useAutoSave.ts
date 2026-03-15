"use client";

import { useCallback, useEffect, useRef, useState, startTransition, MutableRefObject } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "offline" | "slot_limit";

const LS_KEY = "kakkumi_draft";
const LS_THEME_ID_KEY = "kakkumi_draft_theme_id";
const DEBOUNCE_MS = 800;

interface AutoSaveOptions<T> {
  config: T;
  os: string;
  imageUploads: Record<string, string>;
  /** 기존 테마 편집 시 테마 ID, 새 테마면 null */
  initialThemeId?: string | null;
  /** 신규 테마 생성 완료 시 서버에서 받은 packageId를 전달 */
  onCreated?: (packageId: string) => void;
  /** 신규 테마 생성 허용 여부를 외부 ref로 전달 - false면 POST 저장을 막음 */
  allowCreateRef?: MutableRefObject<boolean>;
  /** false이면 PATCH/POST 모두 차단 (초기화 중 등) */
  allowSaveRef?: MutableRefObject<boolean>;
  /** false이면 모든 저장 트리거를 차단 (초기 로딩 중 등) */
  enabled?: boolean;
}

// ...existing code...

interface AutoSaveReturn {
  status: AutoSaveStatus;
  themeId: string | null;
  /** 텍스트 입력용 디바운스 저장 트리거 */
  triggerDebounce: () => void;
  /** 이미지 업로드 / 색상 픽커 종료 시 즉시 저장 트리거 */
  triggerImmediate: () => void;
  /** 초기화 후 다음 렌더(ref 업데이트)에서 즉시 저장 */
  triggerImmediateAfterReset: () => void;
}

export function useAutoSave<T extends object>({
  config,
  os,
  imageUploads,
  initialThemeId = null,
  onCreated,
  allowCreateRef: externalAllowCreateRef,
  allowSaveRef,
  enabled = true,
}: AutoSaveOptions<T>): AutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [themeId, setThemeId] = useState<string | null>(initialThemeId);
  const themeIdRef = useRef<string | null>(initialThemeId);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const pendingSave = useRef(false);

  // 현재 값들의 최신 ref (클로저 stale 방지)
  const configRef = useRef(config);
  const osRef = useRef(os);
  const imageUploadsRef = useRef(imageUploads);
  const onCreatedRef = useRef(onCreated);
  const defaultAllowCreateRef = useRef(true);
  const allowCreateRef = externalAllowCreateRef ?? defaultAllowCreateRef;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled; // 렌더 시점에 즉시 동기화

  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { osRef.current = os; }, [os]);
  useEffect(() => { imageUploadsRef.current = imageUploads; }, [imageUploads]);
  useEffect(() => { onCreatedRef.current = onCreated; }, [onCreated]);

  // 로컬스토리지 백업
  const backupToLocal = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        config: configRef.current,
        os: osRef.current,
        imageUploads: imageUploadsRef.current,
        savedAt: Date.now(),
      }));
    } catch {
      // 스토리지 가득 찬 경우 무시
    }
  }, []);

  // 이미지 objectURL → base64 변환
  const convertImages = useCallback(async (): Promise<Record<string, string>> => {
    const imageDataMap: Record<string, string> = {};
    await Promise.all(
      Object.entries(imageUploadsRef.current).map(async ([key, url]) => {
        if (!url.startsWith("blob:")) return;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          imageDataMap[key] = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          // 변환 실패 이미지는 건너뜀
        }
      })
    );
    return imageDataMap;
  }, []);

  // 실제 서버 저장 함수
  const doSave = useCallback(async () => {
    // enabled 아니거나, 새 테마인데 변경사항 없으면 저장 자체를 차단
    if (!enabledRef.current) return;
    if (allowSaveRef?.current === true) return;  // initializing 중이면 차단
    if (!allowCreateRef.current && !themeIdRef.current) return;

    if (isSaving.current) {
      pendingSave.current = true;
      return;
    }

    if (!navigator.onLine) {
      startTransition(() => setStatus("offline"));
      backupToLocal();
      return;
    }

    isSaving.current = true;
    startTransition(() => setStatus("saving"));
    backupToLocal();

    try {
      const currentConfig = configRef.current as Record<string, unknown>;
      const imageData = await convertImages();

      const currentThemeId = themeIdRef.current;

      if (currentThemeId) {
        // 기존 테마 업데이트
        const res = await fetch(`/api/my-themes/${currentThemeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (currentConfig.name as string) ?? "나의 테마",
            configJson: currentConfig,
            imageData,
          }),
        });

        if (res.ok) {
          startTransition(() => setStatus("saved"));
          setTimeout(() => startTransition(() => setStatus("idle")), 2500);
        } else if (res.status === 401) {
          startTransition(() => setStatus("idle"));
        } else {
          startTransition(() => setStatus("offline"));
        }
      } else {
        // 신규 테마 생성
        const res = await fetch("/api/my-themes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (currentConfig.name as string) ?? "나의 테마",
            os: osRef.current,
            previewImageUrl: imageUploadsRef.current["mainBg"] ?? null,
            configJson: currentConfig,
            imageData,
          }),
        });

        if (res.ok) {
          const data = await res.json() as { theme: { id: string; configJson?: { packageId?: string } } };
          const newId = data.theme.id;
          const serverPackageId = (data.theme.configJson as Record<string, unknown>)?.packageId as string | undefined;
          localStorage.setItem(LS_THEME_ID_KEY, newId);
          themeIdRef.current = newId;
          startTransition(() => {
            setThemeId(newId);
            setStatus("saved");
          });
          if (serverPackageId && onCreatedRef.current) {
            onCreatedRef.current(serverPackageId);
          }
          setTimeout(() => startTransition(() => setStatus("idle")), 2500);
        } else if (res.status === 401) {
          startTransition(() => setStatus("idle"));
        } else if (res.status === 403) {
          // 슬롯 초과 — offline이 아닌 slot_limit으로 처리
          startTransition(() => setStatus("slot_limit"));
        } else {
          startTransition(() => setStatus("offline"));
        }
      }
    } catch {
      startTransition(() => setStatus("offline"));
      backupToLocal();
    } finally {
      isSaving.current = false;
      if (pendingSave.current) {
        pendingSave.current = false;
        void doSave();
      }
    }
  }, [backupToLocal, convertImages]);

  // 온라인 복귀 시 자동 재저장
  useEffect(() => {
    const handleOnline = () => {
      if (status === "offline") {
        doSave();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [status, doSave]);

  // 디바운스 트리거
  const triggerDebounce = useCallback(() => {
    if (!enabledRef.current) return;
    if (!allowCreateRef.current && !themeIdRef.current) return;
    backupToLocal();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      doSave();
    }, DEBOUNCE_MS);
  }, [backupToLocal, doSave]);

  // 즉시 저장 트리거
  const triggerImmediate = useCallback(() => {
    if (!enabledRef.current) return;
    if (!allowCreateRef.current && !themeIdRef.current) return;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    doSave();
  }, [doSave]);

  // 초기화 후 다음 렌더(ref 업데이트 완료) 시점에 저장
  const pendingResetSave = useRef(false);
  const triggerImmediateAfterReset = useCallback(() => {
    if (!enabledRef.current) return;
    if (!allowCreateRef.current && !themeIdRef.current) return;
    pendingResetSave.current = true;
  }, []);

  useEffect(() => {
    if (!pendingResetSave.current) return;
    pendingResetSave.current = false;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    void doSave();
  }, [config, imageUploads, doSave]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { status, themeId, triggerDebounce, triggerImmediate, triggerImmediateAfterReset };
}
