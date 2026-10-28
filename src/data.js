// データ層（試作品）
// 本来はサーバー上のデータベースに保存するが、第1段階の試作品では
// ブラウザのlocalStorageに保存する。架空の案件・利用者のみを使用し、
// 実際の社内写真・顧客情報はこの試作品には投入しない。
window.AppData = (function () {
  "use strict";

  var KEYS = {
    users: "caseshelf_users_v1",
    projects: "caseshelf_projects_v1",
    saves: "caseshelf_saves_v1",
    currentUser: "caseshelf_current_user_v1",
    seeded: "caseshelf_seeded_v1",
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

  function makeSeedProjects() {
    var defs = [
      {
        title: "株式会社ノルディック 新本社ロビー内装",
        tags: ["オフィス内装", "ロビー", "北欧デザイン"],
        desc:
          "新本社移転に伴うロビー・受付エリアの内装設計・施工。木材と間接照明を基調に、来訪者に落ち着きを感じてもらえる空間を目指した。",
        author: "u_member1",
        photos: 5,
        sfdc: "https://example-crm.my.salesforce.com/0061234ABCDE",
      },
      {
        title: "SORA食品 展示会ブース（フードEXPO）",
        tags: ["展示会", "ブース装飾", "食品"],
        desc: "フードEXPO出展ブースの装飾一式。試食スペースとサイネージを一体化したレイアウトを提案。",
        author: "u_member2",
        photos: 8,
        sfdc: "",
      },
      {
        title: "みなと銀行 支店ウィンドウディスプレイ",
        tags: ["店舗装飾", "ウィンドウディスプレイ", "金融"],
        desc: "季節キャンペーンに合わせた店頭ウィンドウの装飾。限られた奥行きの中で視認性を確保する設計。",
        author: "u_member1",
        photos: 3,
        sfdc: "https://example-crm.my.salesforce.com/0069876ZYXWV",
      },
      {
        title: "青葉自動車 新車発表会 会場設営",
        tags: ["イベント", "会場設営", "自動車"],
        desc: "新車発表会の会場設営一式。ステージ・サイネージ・試乗車の配置計画を含む。",
        author: "u_member2",
        photos: 10,
        sfdc: "",
      },
      {
        title: "ふたば病院 待合室リニューアル",
        tags: ["医療施設", "待合室", "サイン計画"],
        desc: "待合室の家具配置・サイン計画のリニューアル。院内の案内表示をわかりやすく整理した。",
        author: "u_member1",
        photos: 4,
        sfdc: "",
      },
      {
        title: "やまと物産 百貨店催事スペース",
        tags: ["催事", "百貨店", "店舗装飾"],
        desc: "百貨店催事スペースの短期装飾。1週間の催事期間に合わせた簡易設営構造を採用。",
        author: "u_member2",
        photos: 6,
        sfdc: "https://example-crm.my.salesforce.com/0061111QQQQ",
      },
      {
        title: "テックリンク株式会社 展示会ブース（IT展）",
        tags: ["展示会", "ブース装飾", "IT"],
        desc: "IT展示会向けの大型ブース。デモ機展示エリアと商談スペースを分離したレイアウト。",
        author: "u_member1",
        photos: 7,
        sfdc: "",
      },
      {
        title: "さくら学園 学園祭特設ステージ",
        tags: ["イベント", "会場設営", "教育"],
        desc: "学園祭用の特設ステージ設営。限られた予算内での演出照明の工夫。",
        author: "u_member2",
        photos: 2,
        sfdc: "",
      },
      {
        title: "北陸製紙 工場見学コース サイン計画",
        tags: ["サイン計画", "工場", "見学コース"],
        desc: "工場見学コースの順路案内・安全サインの計画と設置。",
        author: "u_member1",
        photos: 5,
        sfdc: "https://example-crm.my.salesforce.com/0067777MMMM",
      },
      {
        title: "グリーンカフェ 新規出店 内装工事",
        tags: ["店舗装飾", "カフェ", "内装"],
        desc: "新規出店の内装工事一式。観葉植物を多用したナチュラルテイストの空間。",
        author: "u_member2",
        photos: 9,
        sfdc: "",
      },
      {
        title: "常盤電機 周年記念展示",
        tags: ["展示会", "周年記念", "電機"],
        desc: "創業50周年記念の社史展示パネル・記念品展示コーナーの制作。",
        author: "u_member1",
        photos: 1,
        sfdc: "",
      },
      {
        title: "ひびき不動産 モデルルーム装飾",
        tags: ["モデルルーム", "住宅", "店舗装飾"],
        desc: "新築マンションのモデルルーム装飾。家具・照明・観葉植物のコーディネート。",
        author: "u_member2",
        photos: 4,
        sfdc: "https://example-crm.my.salesforce.com/0063333OOOO",
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
        description: d.desc,
        tags: d.tags,
        photos: photos,
        coverPhotoId: photos[0].id,
        authorId: d.author,
        salesforceUrl: d.sfdc || "",
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
