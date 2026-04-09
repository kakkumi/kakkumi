FROM eclipse-temurin:21-jdk-jammy

# 기본 도구 설치
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# apktool 설치 (APK 디코딩/리빌드용)
ARG APKTOOL_VERSION=2.9.3
RUN curl -L -o /usr/local/lib/apktool.jar \
    "https://github.com/iBotPeaches/Apktool/releases/download/v${APKTOOL_VERSION}/apktool_${APKTOOL_VERSION}.jar" && \
    printf '#!/bin/sh\nexec java -jar /usr/local/lib/apktool.jar "$@"\n' \
    > /usr/local/bin/apktool && \
    chmod +x /usr/local/bin/apktool

WORKDIR /app

# Node.js 설치
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# 의존성 설치
COPY package.json ./
RUN npm install

# 소스 빌드
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ────────────────────────────────────────────
# base-decoded/ : 사전 디코딩된 베이스 APK 디렉토리
# 준비 방법:
#   1. docs/Android/apeach-26.1.0-source 를 Android Studio로 빌드 → base-template.apk 생성
#   2. apktool d base-template.apk -o base-decoded -f
#   3. 생성된 base-decoded/ 폴더를 이 apk-builder/ 아래에 복사
# ────────────────────────────────────────────
COPY base-decoded/ /app/base-decoded/

# ────────────────────────────────────────────
# DEX 캐시 생성 (빌드 시 1회만 실행)
# base-decoded를 apktool b로 빌드하여 classes*.dex를 추출합니다.
# 런타임에 smali→DEX 재컴파일을 건너뛰어 빌드 시간을 ~12초 단축합니다.
# ────────────────────────────────────────────
RUN apktool b /app/base-decoded -o /tmp/base-prebuilt.apk && \
    mkdir -p /app/dex-cache && \
    cd /app/dex-cache && \
    unzip -o /tmp/base-prebuilt.apk 'classes*.dex' && \
    rm -f /tmp/base-prebuilt.apk && \
    echo "[Docker] DEX cache created: $(ls /app/dex-cache/)"

# 서명 키스토어 생성 (최초 배포 시 한 번만; 실서비스는 별도 keystore.jks를 COPY 또는 Secret Manager 사용)
ARG KEYSTORE_STOREPASS=kakkumi_apk_store
ARG KEYSTORE_KEYPASS=kakkumi_apk_key
RUN keytool -genkeypair \
    -keystore /app/keystore.jks \
    -alias kakkumi \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "${KEYSTORE_STOREPASS}" \
    -keypass "${KEYSTORE_KEYPASS}" \
    -dname "CN=Kakkumi, OU=Theme, O=Kakkumi, L=Seoul, ST=Seoul, C=KR" 2>&1 || true

ENV KEYSTORE_PATH=/app/keystore.jks
ENV KEYSTORE_STOREPASS=kakkumi_apk_store
ENV KEYSTORE_KEYPASS=kakkumi_apk_key
ENV KEYSTORE_ALIAS=kakkumi
ENV BASE_DECODED_PATH=/app/base-decoded
ENV DEX_CACHE_PATH=/app/dex-cache
ENV PORT=8080

EXPOSE 8080
CMD ["node", "dist/server.js"]

