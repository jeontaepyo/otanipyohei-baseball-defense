# 사회인야구 수비의 디테일 — Mobile Web App v0.1

## 현재 포함
- 9개 포지션 30초 요약
- 8개 주자 상태 × 0/1/2아웃 = 24 Base-Out
- CORE 원칙
- 도루/더블스틸/히트앤런/번트/스퀴즈/병살/런다운/태그업/폭투/컷오프/악송구/인필드플라이
- 검색
- 즐겨찾기(localStorage)
- 최근 본 페이지(localStorage)
- PWA manifest / service worker 기반

## 로컬 확인
```bash
python3 -m http.server 8080
```
그 다음 브라우저에서 http://localhost:8080/ 접속.

## GitHub Pages 배포
저장소 루트에 이 폴더의 파일을 올리고 GitHub Pages를 활성화하면 정적 웹앱으로 동작한다.

## 실제 배포 전에 추가할 것
1. 마스터 원고 전체 세부 페이지
2. 전술도/도해
3. RULE/TEAM/OPTION 태그 전수 QA
4. 카카오톡 공유용 대표 이미지(OG image)
5. GitHub Pages 실제 URL에서 iOS/Android 설치 및 오프라인 테스트
