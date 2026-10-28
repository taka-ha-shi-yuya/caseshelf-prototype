// データ層（試作品）
// 本来はサーバー上のデータベースに保存するが、第1段階の試作品では
// ブラウザのlocalStorageに保存する。
// 案件名・クライアント名・ハッシュタグは、昭栄美術の公開実績ページ
// （https://www.shoei-bijutsu.co.jp/works/）に掲載済みの情報をもとにしたサンプル。
// 写真は実際の現場写真ではなく、すべて自動生成したプレースホルダー画像。
window.AppData = (function () {
  "use strict";

  var KEYS = {
    users: "caseshelf_users_v2",
    projects: "caseshelf_projects_v2",
    saves: "caseshelf_saves_v2",
    currentUser: "caseshelf_current_user_v2",
    seeded: "caseshelf_seeded_v2",
  };

  function uid(prefix) {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function escapeXml(s) {
    return String(s).replace(/[<>&'"]/g, function (c) {
      return (
        { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[
          c
        ] || c
      );
    });
  }

  function hashHue(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) % 360;
    }
    return h < 0 ? h + 360 : h;
  }

  // 架空のダミー写真を生成する（本番では実際の案件写真に置き換わる）
  function placeholderPhoto(seedStr, label) {
    var hue = hashHue(seedStr);
    var hue2 = (hue + 46) % 360;
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='hsl(" + hue + ",58%,58%)'/>" +
      "<stop offset='1' stop-color='hsl(" + hue2 + ",55%,38%)'/>" +
      "</linearGradient></defs>" +
      "<rect width='800' height='800' fill='url(#g)'/>" +
      "<text x='50%' y='54%' font-size='58' fill='white' fill-opacity='0.92' " +
      "font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'>" +
      escapeXml(label) +
      "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function avatarColor(seedStr) {
    var hue = hashHue(seedStr);
    return "hsl(" + hue + ",48%,46%)";
  }

  // ---------- シードデータ（架空の案件・利用者） ----------

  var SEED_USERS = [
    {
      id: "u_admin1",
      email: "admin.sato@example-sei.co.jp",
      displayName: "佐藤 management（管理者）",
      role: "admin",
      status: "active",
      avatarImage: null,
    },
    {
      id: "u_member1",
      email: "yamada@example-sei.co.jp",
      displayName: "山田 花子",
      role: "member",
      status: "active",
      avatarImage: null,
    },
    {
      id: "u_member2",
      email: "tanaka@example-sei.co.jp",
      displayName: "田中 次郎",
      role: "member",
      status: "active",
      avatarImage: null,
    },
    {
      id: "u_suspended1",
      email: "suspended@example-sei.co.jp",
      displayName: "停止 三郎（利用停止サンプル）",
      role: "member",
      status: "suspended",
      avatarImage: null,
    },
  ];

  function seedProjectPhotos(projId, count) {
    var photos = [];
    for (var i = 0; i < count; i++) {
      photos.push({
        id: uid("ph"),
        url: placeholderPhoto(projId + "_" + i, "#" + (i + 1)),
        order: i,
      });
    }
    return photos;
  }

  // 案件名・クライアント名・ハッシュタグは https://www.shoei-bijutsu.co.jp/works/ の掲載情報より。
  // 説明文は掲載情報（案件名・クライアント名・掲載タグ）から推測できる範囲のみを記載し、
  // 掲載されていない制作の詳細は記載していない。写真は実際の現場写真ではなくプレースホルダー。
  function makeSeedProjects() {
    var defs = [
      {
        title: "国際物流総合展2026 | 鴻池運輸株式会社",
        client: "鴻池運輸株式会社",
        tags: ["BtoB", "展示会ブース"],
        author: "u_member1",
        photos: 5,
      },
      {
        title: "下水道展2026 | 株式会社荏原製作所様ブース",
        client: "株式会社荏原製作所",
        tags: ["BtoB", "BtoC", "展示会ブース"],
        author: "u_member2",
        photos: 6,
      },
      {
        title: "第60回スーパーマーケット・トレードショー2026 | 東洋水産株式会社様ブース",
        client: "東洋水産株式会社",
        tags: ["BtoB", "展示会ブース"],
        author: "u_member1",
        photos: 4,
      },
      {
        title: "ものづくり ワールド2026 イリノイ州パビリオン",
        client: "米国イリノイ州政府駐日事務所",
        tags: ["BtoB", "海外展示会ブース"],
        author: "u_member2",
        photos: 3,
      },
      {
        title: "rom&nd popup ロムアンド商事〜ジューシーフラッシュ営業部〜",
        client: "株式会社電通ライブ",
        tags: ["BtoC", "ポップアップストア"],
        author: "u_member1",
        photos: 7,
      },
      {
        title: "郡山ヒロセ電機 郡山工場2F新設ショールーム",
        client: "郡山ヒロセ電機株式会社",
        tags: ["BtoB", "ショールーム", "ショールーム・内装"],
        author: "u_member2",
        photos: 5,
      },
      {
        title: "HVAC&R JAPAN 2026 | 三菱電機",
        client: "三菱電機株式会社",
        tags: ["BtoB", "展示会ブース"],
        author: "u_member1",
        photos: 2,
      },
      {
        title: "ABB FIA フォーミュラE世界選手権東京大会2025",
        client: "Formula E Operations Limited",
        tags: ["BtoB", "モータースポーツ"],
        author: "u_member2",
        photos: 9,
      },
      {
        title: "hololive SUPER EXPO 2025",
        client: "株式会社ツートップ",
        tags: ["BtoC", "PRイベント"],
        author: "u_member1",
        photos: 8,
      },
      {
        title: "CEATEC2023 | NEDO",
        client: "国立研究開発法人 新エネルギー・産業技術総合開発機構（NEDO）",
        tags: ["BtoB", "展示会ブース", "サステナビリティ実績"],
        author: "u_member2",
        photos: 3,
      },
      {
        title: "WOODコレクション（モクコレ）2024Plus",
        client: "東京都",
        tags: ["行政・自治体・官公庁", "展示会主催工事"],
        author: "u_member1",
        photos: 1,
      },
      {
        title: "国際宝飾展2026 | 株式会社桑山様",
        client: "株式会社桑山",
        tags: ["BtoB", "展示会ブース"],
        author: "u_member2",
        photos: 4,
      },
      {
        title: "TICAD BUSINESS EXPO ＆ CONFERENCE",
        client: "独立行政法人日本貿易振興機構（JETRO）",
        tags: ["BtoB"],
        author: "u_member1",
        photos: 2,
      },
      {
        title: "フーデックス関西2025イタリアパビリオン | イタリア大使館",
        client: "イタリア大使館",
        tags: ["BtoB", "展示会ブース", "インバウンド"],
        author: "u_member2",
        photos: 6,
      },
    ];

    var now = Date.now();
    return defs.map(function (d, idx) {
      var id = uid("proj");
      var photos = seedProjectPhotos(id, d.photos);
      var createdAt = new Date(now - idx * 36 * 3600 * 1000 - idx * 1234567).toISOString();
      return {
        id: id,
        title: d.title,
        description: "クライアント: " + d.client + "（会社実績ページ掲載情報によるサンプル投稿）",
        tags: d.tags,
        photos: photos,
        coverPhotoId: photos[0].id,
        authorId: d.author,
        salesforceUrl: "",
        createdAt: createdAt,
        updatedAt: createdAt,
      };
    });
  }

  // ---------- 永続化ヘルパー ----------

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[AppData] failed to read", key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (e) {
      console.warn("[AppData] failed to write", key, e);
      return { ok: false, error: e };
    }
  }

  function ensureSeeded() {
    if (readJSON(KEYS.seeded, false)) return;
    writeJSON(KEYS.users, SEED_USERS);
    writeJSON(KEYS.projects, makeSeedProjects());
    writeJSON(KEYS.saves, {});
    writeJSON(KEYS.seeded, true);
  }

  ensureSeeded();

  function loadUsers() {
    return readJSON(KEYS.users, SEED_USERS);
  }
  function saveUsers(list) {
    return writeJSON(KEYS.users, list);
  }
  function loadProjects() {
    return readJSON(KEYS.projects, []);
  }
  function saveProjects(list) {
    return writeJSON(KEYS.projects, list);
  }
  function loadSaves() {
    return readJSON(KEYS.saves, {});
  }
  function saveSaves(obj) {
    return writeJSON(KEYS.saves, obj);
  }
  function getCurrentUserId() {
    try {
      return localStorage.getItem(KEYS.currentUser) || null;
    } catch (e) {
      return null;
    }
  }
  function setCurrentUserId(id) {
    try {
      if (id) localStorage.setItem(KEYS.currentUser, id);
      else localStorage.removeItem(KEYS.currentUser);
    } catch (e) {}
  }

  function resetAllData() {
    try {
      Object.keys(KEYS).forEach(function (k) {
        localStorage.removeItem(KEYS[k]);
      });
    } catch (e) {}
    ensureSeeded();
  }

  return {
    uid: uid,
    placeholderPhoto: placeholderPhoto,
    avatarColor: avatarColor,
    loadUsers: loadUsers,
    saveUsers: saveUsers,
    loadProjects: loadProjects,
    saveProjects: saveProjects,
    loadSaves: loadSaves,
    saveSaves: saveSaves,
    getCurrentUserId: getCurrentUserId,
    setCurrentUserId: setCurrentUserId,
    resetAllData: resetAllData,
    LIMITS: {
      maxPhotosPerProject: 20,
      maxPhotoSizeMB: 5,
      acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },
  };
})();
