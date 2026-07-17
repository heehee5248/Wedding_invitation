# 전재광 · 송정윤 모바일청첩장

## 기능
- 축하메시지 작성
- 작성 즉시 청첩장에 댓글처럼 표시
- Netlify Blobs에 영구 저장
- 최근 메시지 최대 100개 표시

## 중요
이 버전은 Netlify Functions를 사용하므로 기존처럼 HTML 파일만 드래그해서 올리면 댓글 기능이 작동하지 않습니다.
GitHub 저장소와 Netlify를 연결해서 배포하거나 Netlify CLI로 배포해야 합니다.

## Netlify + GitHub 배포
1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 파일과 폴더를 저장소 최상위에 모두 올립니다.
3. Netlify 사이트에서 Project configuration > Build & deploy > Continuous deployment > Repository로 이동합니다.
4. Link to a repository를 눌러 해당 GitHub 저장소를 연결합니다.
5. 배포가 끝나면 Functions 메뉴에 comments가 표시되는지 확인합니다.
6. 청첩장에서 테스트 메시지를 남깁니다.

## 파일 구조
- public/index.html
- netlify/functions/comments.mjs
- package.json
- netlify.toml
