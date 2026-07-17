import { getStore } from "@netlify/blobs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const ALLOWED_SIDES = new Set(["신랑측", "신부측", "두 사람의 지인"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function cleanSingleLine(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value, maxLength) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export default async (request) => {
  const store = getStore({
    name: "wedding-comments",
    consistency: "strong"
  });

  if (request.method === "GET") {
    try {
      const { blobs } = await store.list({ prefix: "comment/" });

      const selected = blobs
        .sort((a, b) => b.key.localeCompare(a.key))
        .slice(0, 100);

      const comments = (
        await Promise.all(
          selected.map(({ key }) =>
            store.get(key, { type: "json", consistency: "strong" })
          )
        )
      ).filter(Boolean);

      comments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return json({ comments });
    } catch (error) {
      console.error("Comment list error:", error);
      return json({ error: "축하메시지를 불러오지 못했습니다." }, 500);
    }
  }

  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return json({ error: "잘못된 요청 형식입니다." }, 415);
      }

      const body = await request.json();

      // Honeypot: automated bots tend to fill hidden fields.
      if (cleanSingleLine(body.botField, 100)) {
        return json({ error: "요청을 처리할 수 없습니다." }, 400);
      }

      const name = cleanSingleLine(body.name, 30);
      const side = cleanSingleLine(body.side, 20);
      const message = cleanMessage(body.message, 500);

      if (name.length < 1) {
        return json({ error: "성함을 입력해 주세요." }, 400);
      }
      if (!ALLOWED_SIDES.has(side)) {
        return json({ error: "구분을 다시 선택해 주세요." }, 400);
      }
      if (message.length < 2) {
        return json({ error: "축하메시지를 두 글자 이상 입력해 주세요." }, 400);
      }

      const createdAt = new Date().toISOString();
      const comment = {
        id: crypto.randomUUID(),
        name,
        side,
        message,
        createdAt
      };

      const key = `comment/${String(Date.now()).padStart(13, "0")}-${comment.id}`;
      await store.setJSON(key, comment, { onlyIfNew: true });

      return json({ comment }, 201);
    } catch (error) {
      console.error("Comment save error:", error);
      return json({ error: "메시지를 저장하지 못했습니다." }, 500);
    }
  }

  return json({ error: "허용되지 않은 요청입니다." }, 405);
};
