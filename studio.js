/*! Motion Studio engine v1.3.0
 * ブラウザだけで動くモーショングラフィックス動画の編集アプリ（Gemini の Canvas 用）。
 * 使い方：読み込み用の HTML に <script type="application/json" id="storyboard"> と const apiKey = ""; を置き、このファイルを読み込む。
 * 元ファイル：gemini-video-skill/src/studio.html（scripts/build_engine.py で生成。直接編集しない）
 */
window.MS_ENGINE = "1.3.0";
document.body.insertAdjacentHTML("afterbegin", "<div id=\"app\">\n  <div id=\"top\">\n    <span class=\"title\" id=\"projTitle\">Motion Studio</span>\n    <button id=\"btnPlay\" class=\"primary\">▶ 再生</button>\n    <button id=\"btnGen\" class=\"hideBig\" title=\"まだ無い声と画像だけを作ります\">声と画像を作る</button>\n    <button id=\"btnBgm\" class=\"hideBig\">BGM</button>\n    <label class=\"hideBig note\" style=\"display:flex;align-items:center;gap:4px\">音量<input id=\"bgmVol\" type=\"range\" min=\"0\" max=\"0.6\" step=\"0.01\" style=\"width:80px\"></label>\n    <select id=\"voiceSel\" class=\"hideBig\" style=\"width:auto\" title=\"ナレーションの声\"></select>\n    <span class=\"sp\"></span>\n    <button id=\"btnUndo\" class=\"hideBig\">1つ前に戻す</button>\n    <button id=\"btnTexts\" class=\"hideBig\">画面の文字を全て表示</button>\n    <button id=\"btnCopy\" class=\"hideBig\" title=\"手直しを含めた台本データをコピーして、Gemini のチャットに貼り付けます\">編集内容をコピー</button>\n    <button id=\"btnSave\" class=\"hideBig\">保存</button>\n    <button id=\"btnPaste\" class=\"hideBig\" title=\"Gemini がチャットに出した台本データ（JSON）を貼り付けます\">台本を貼る</button>\n    <button id=\"btnLoad\" class=\"hideBig\">読込</button>\n    <button id=\"btnBig\">大きく表示</button>\n    <select id=\"quality\" class=\"hideBig\" style=\"width:auto\" title=\"書き出す MP4 の画質（ファイルの大きさ）\"><option value=\"8\">高画質</option><option value=\"5\" selected>標準</option><option value=\"2.5\">軽量</option></select>\n    <button id=\"btnExport\" class=\"primary hideBig\">書き出す MP4</button>\n  </div>\n  <div id=\"main\">\n    <div id=\"stageWrap\"><canvas id=\"stage\"></canvas><textarea id=\"editBox\"></textarea></div>\n    <div id=\"side\"></div>\n  </div>\n  <div id=\"bottom\">\n    <div id=\"scenes\"></div>\n    <input id=\"seek\" type=\"range\" min=\"0\" max=\"1000\" value=\"0\">\n    <span id=\"time\">0:00 / 0:00</span>\n    <span id=\"status\"></span>\n  </div>\n</div>\n\n<div class=\"modal\" id=\"mTexts\"><div class=\"box\"><h2>画面の文字（まとめて修正）</h2><table class=\"alltexts\" id=\"allTexts\" style=\"width:100%\"></table><div class=\"row\"><button id=\"allTextsApply\" class=\"primary\">反映する</button><button data-close>閉じる</button></div></div></div>\n<div class=\"modal\" id=\"mBgm\"><div class=\"box\"><h2>BGM</h2><p class=\"note\" id=\"bgmNow\"></p>\n<h3 style=\"font-size:14px;margin:14px 0 4px\">AI で作る（Gemini の音楽生成・利用枠を使います）</h3><textarea id=\"bgmPrompt\" rows=\"3\" placeholder=\"英語の BGM の指示\"></textarea><div class=\"row\"><button id=\"bgmAi\" class=\"primary\">AI で作る</button></div>\n<h3 style=\"font-size:14px;margin:14px 0 4px\">自動で作る（すぐできる・利用枠を使わない）</h3><div class=\"row\"><select id=\"bgmStyle\" style=\"width:auto\"><option value=\"cyber\">サイバー</option><option value=\"cinematic\">シネマ</option><option value=\"stylish\">スタイリッシュ</option><option value=\"pop\">ポップ</option><option value=\"calm\">やさしい（解説向け）</option></select><button id=\"bgmSynth\">自動で作る</button></div>\n<h3 style=\"font-size:14px;margin:14px 0 4px\">ファイルから（「音楽を作成」で保存した MP3 など）</h3><div class=\"row\"><button id=\"bgmFile\">ファイルを選ぶ</button><button id=\"bgmNone\">BGM なし</button></div>\n<p class=\"note\" id=\"bgmMsg\"></p><div class=\"row\"><button id=\"bgmPlay\">▶ 試聴（10 秒）</button><button data-close>閉じる</button></div></div></div>\n<div class=\"modal\" id=\"mGen\"><div class=\"box\"><h2 id=\"genTitle\">声と画像を作っています</h2><div class=\"bar\"><i id=\"genBar\"></i></div><p class=\"note\" id=\"genMsg\"></p><div class=\"row\"><button data-close id=\"genClose\" style=\"display:none\">閉じる</button></div></div></div>\n<div class=\"modal\" id=\"mExport\"><div class=\"box\"><h2 id=\"expTitle\">書き出し中</h2><div class=\"bar\"><i id=\"expBar\"></i></div><p class=\"note\" id=\"expMsg\"></p><div class=\"row\"><button id=\"expCancel\">中止</button></div></div></div>\n<div class=\"modal\" id=\"mPaste\"><div class=\"box\"><h2>台本データを貼り付け</h2><p class=\"note\">Gemini がチャットに出した台本データ（<code>{\"meta\": … \"scenes\": …}</code> の JSON）を、そのまま下に貼り付けて「読み込む」を押してください。前後の文章や ```json の行が混ざっていても大丈夫です。</p><textarea id=\"pasteText\" style=\"height:280px;font-family:monospace;font-size:12px\"></textarea><p class=\"note\" id=\"pasteMsg\"></p><div class=\"row\"><button id=\"pasteDo\" class=\"primary\">読み込む</button><button data-close>閉じる</button></div></div></div>\n<div class=\"modal\" id=\"mCopy\"><div class=\"box\"><h2>編集内容をコピー</h2><p class=\"note\">下の文章を全部コピーして、Gemini のチャット欄に貼り付け、続けて「直してほしいこと」を書いて送ってください。手直しした文字はそのまま引き継がれます。</p><textarea id=\"copyText\" style=\"height:300px;font-family:monospace;font-size:12px\"></textarea><div class=\"row\"><button id=\"copyDo\" class=\"primary\">コピー</button><button data-close>閉じる</button></div></div></div>\n<input type=\"file\" id=\"fileBgm\" accept=\"audio/*\" hidden>\n<input type=\"file\" id=\"fileImg\" accept=\"image/*\" hidden>\n<input type=\"file\" id=\"fileProj\" accept=\".json,application/json\" hidden>\n<input type=\"file\" id=\"fileVoice\" accept=\"audio/*\" hidden>");
/* ============================================================
   CONFIG（Canvas の API 設定）
   - apiKey は空のままにする。Gemini の Canvas が実行時に自動で入れる。
   - モデル名は上から順に試す。Canvas の指示で別の名前が指定されていれば先頭に足す。
============================================================ */
// apiKey は読み込み用の HTML（loader）で宣言する。Canvas が実行時に入れる
const msApiKey = () => (typeof apiKey !== "undefined" ? apiKey : "");
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
const MODELS = {
  tts:   ["gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"],
  image: ["gemini-2.5-flash-image-preview", "gemini-3.1-flash-image-preview", "imagen-4.0-generate-001", "imagen-3.0-generate-002"],
  // 音楽（Lyria）。短い動画は 30 秒の clip、長い動画は曲の長いモデルを先に試す
  music: ["lyria-3-clip-preview", "lyria-3-pro-preview", "lyria-3.5"]
};
// loader で window.MS_MODELS = { tts: [...], image: [...] } を指定すると、その名前を先に試す
if (window.MS_MODELS) ["tts", "image"].forEach(k => { const add = window.MS_MODELS[k]; if (add && add.length) MODELS[k] = [...add, ...MODELS[k].filter(m => !add.includes(m))]; });
const VOICES = ["Kore","Leda","Erinome","Aoede","Zephyr","Puck","Charon","Fenrir","Orus","Callirrhoe","Autonoe","Enceladus","Iapetus","Umbriel","Algieba","Despina","Algenib","Rasalgethi","Laomedeia","Achernar","Alnilam","Schedar","Gacrux","Pulcherrima","Achird","Zubenelgenubi","Vindemiatrix","Sadachbia","Sadaltager","Sulafat"];

/* ============================================================
   基本ユーティリティ
============================================================ */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  out: t => 1 - Math.pow(1 - clamp(t, 0, 1), 3),
  inOut: t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  back: t => { t = clamp(t, 0, 1); const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  expo: t => { t = clamp(t, 0, 1); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
};
const prog = (t, start, dur) => clamp((t - start) / dur, 0, 1);
function hash(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, "0"); }
function fmtTime(s) { s = Math.max(0, s); const m = Math.floor(s / 60); return m + ":" + String(Math.floor(s % 60)).padStart(2, "0"); }
function b64ToBytes(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function bytesToB64(u8) { let s = ""; const C = 0x8000; for (let i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C)); return btoa(s); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function status(msg, kind) { const el = $("#status"); el.textContent = msg; el.style.color = kind === "err" ? "#ff8a8a" : kind === "ok" ? "#7fe0a8" : ""; el.title = msg; }
function getPath(o, p) { return p.split(".").reduce((a, k) => a == null ? a : a[k], o); }
function setPath(o, p, v) { const ks = p.split("."); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; }

/* ============================================================
   状態
============================================================ */
// 台本データ：前後に文章や ```json が付いていても、最初の { から最後の } までを読む
function parseStoryboard(text) {
  const m = String(text || "").match(/\{[\s\S]*\}/); if (!m) return null;
  try { const j = JSON.parse(m[0]); return j && Array.isArray(j.scenes) && j.scenes.length ? j : null; } catch (e) { return null; }
}
let SB = parseStoryboard($("#storyboard").textContent);
const NEED_PASTE = !SB;
if (!SB) SB = { meta: { title: "台本を貼り付けてください" }, scenes: [{ template: "title", texts: { kicker: "【準備】", title: "台本データを\n貼り付けてください", sub: "上の「台本を貼る」から" } }] };
const ASSETS = new Map();   // key -> {kind:'voice'|'image'|'bgm', buffer?, img?, bytes, mime}
const undoStack = [];
let cur = 0;                // 選択中のシーン
let playhead = 0;           // 秒
let playing = false;
let TL = null;              // タイムライン
let hitBoxes = [];
const usage = { tts: 0, image: 0, music: 0 };
let AC = null;              // AudioContext
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); return AC; }

function normalize() {
  SB.meta = SB.meta || {};
  const m = SB.meta;
  m.aspect = m.aspect === "9:16" ? "9:16" : "16:9";
  m.fps = m.fps || 30;
  m.theme = Object.assign({ preset: "stylish", bg: "#101218", fg: "#f3efe6", accent: "#e0475b", accent2: "#3fc1c9", font: "sans" }, m.theme || {});
  m.voice = Object.assign({ name: "Kore", style: "" }, m.voice || {});
  m.bgm = Object.assign({ volume: 0.18 }, m.bgm || {});
  if (m.subtitles === undefined) m.subtitles = true;
  SB.characters = SB.characters || [];
  SB.scenes = (SB.scenes || []).map((s, i) => Object.assign({ id: "s" + (i + 1), template: "title", texts: {}, transition: "fade" }, s));
  SB.scenes.forEach(s => { s.texts = s.texts || {}; });
}
normalize();

function snapshot() { undoStack.push(JSON.stringify(SB)); if (undoStack.length > 80) undoStack.shift(); }
function undo() { if (!undoStack.length) { status("戻せる操作がありません"); return; } SB = JSON.parse(undoStack.pop()); normalize(); rebuild(); status("1つ前に戻しました", "ok"); }

/* ============================================================
   素材の保存（IndexedDB。使えない環境では何もしない）
============================================================ */
const DB = {
  db: null,
  async open() { if (this.db !== null) return this.db; try { this.db = await new Promise((res, rej) => { const r = indexedDB.open("motion-studio", 1); r.onupgradeneeded = () => r.result.createObjectStore("a"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); } catch (e) { this.db = false; } return this.db; },
  async put(k, v) { try { const d = await this.open(); if (!d) return; await new Promise((res, rej) => { const tx = d.transaction("a", "readwrite"); tx.objectStore("a").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); } catch (e) { } },
  async get(k) { try { const d = await this.open(); if (!d) return null; return await new Promise((res) => { const tx = d.transaction("a", "readonly"); const q = tx.objectStore("a").get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } }
};

/* ============================================================
   素材キー
============================================================ */
function voiceKey(s) { const v = SB.meta.voice; return "v_" + hash([s.voice && s.voice.name || v.name, s.voice && s.voice.style || v.style, s.narration || ""].join("|")); }
function sceneImageMode(s) { const t = s.template; if (["split", "talk"].includes(t)) return "side"; if (["headline", "title", "quote", "kinetic", "cta", "stat"].includes(t)) return "bg"; return "bg"; }
function imageAspect(s) { if (sceneImageMode(s) === "side") return SB.meta.aspect === "9:16" ? "4:3" : "3:4"; return SB.meta.aspect; }
function fullImagePrompt(s) {
  const im = s.image || {};
  const chars = (im.characters || []).map(id => SB.characters.find(c => c.id === id)).filter(Boolean);
  const parts = [im.prompt || ""];
  chars.forEach(c => { if (c.look) parts.push(c.name + ": " + c.look); });
  if (SB.meta.imageStyle) parts.push(SB.meta.imageStyle);
  return parts.filter(Boolean).join(". ");
}
function imageKey(s) { const im = s.image || {}; return "i_" + hash([imageAspect(s), fullImagePrompt(s), (im.characters || []).map(id => { const c = SB.characters.find(x => x.id === id); return c && c.refAsset || ""; }).join(",")].join("|")); }
function sceneVoice(s) { const k = s.voiceAsset || voiceKey(s); return ASSETS.get(k) || null; }
function sceneImage(s) { if (!s.image) return null; const k = s.image.asset || imageKey(s); const a = ASSETS.get(k); return a && a.img || null; }

/* ============================================================
   タイムライン（シーンの長さ・字幕のタイミング）
============================================================ */
// 声ができる前の長さの見積もり。実測：Charon（低く落ち着いた読み）で 1 秒あたり約 4.5 字（2026-11-03）
const VOICE_LEAD = 0.35, VOICE_TAIL = 0.55, CHARS_PER_SEC = 4.8;
function computeTimeline() {
  let t = 0; const out = [];
  SB.scenes.forEach((s, i) => {
    const v = sceneVoice(s);
    const vd = v ? v.buffer.duration : (s.narration ? s.narration.length / CHARS_PER_SEC : 0);
    let d = Math.max(s.duration || 0, vd ? vd + VOICE_LEAD + VOICE_TAIL : 0, 2.5);
    if (s.template === "kinetic" && !vd) d = Math.max(d, wordsOf(s).length * 0.7 + 1);
    out.push({ s, i, start: t, dur: d, voiceDur: vd, hasVoice: !!v });
    t += d;
  });
  return { scenes: out, total: t };
}
function sceneAt(t) { const sc = TL.scenes; for (let i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start) return sc[i]; return sc[0]; }
function subtitleChunks(text, maxChars) {
  const parts = text.replace(/\n/g, "").split(/(?<=[。！？!?])/).map(x => x.trim()).filter(Boolean);
  const out = [];
  parts.forEach(p => {
    while (p.length > maxChars) {
      let cut = -1;
      for (let i = Math.min(maxChars, p.length - 1); i > maxChars * 0.45; i--) if ("、,，・ ".includes(p[i])) { cut = i + 1; break; }
      if (cut < 0) { cut = maxChars; const isW = c => /[A-Za-z0-9_.\-]/.test(c || ""); while (cut > maxChars * 0.5 && isW(p[cut - 1]) && isW(p[cut])) cut--; if (cut <= maxChars * 0.5) cut = maxChars; }
      while (cut < p.length && NO_START.includes(p[cut])) cut++;
      out.push(p.slice(0, cut)); p = p.slice(cut);
    }
    if (p) out.push(p);
  });
  return out;
}

/* ============================================================
   描画の基本
============================================================ */
const cv = $("#stage"); const ctx = cv.getContext("2d");
let W = 1920, H = 1080, U = 1, PORTRAIT = false;
function setSize() { PORTRAIT = SB.meta.aspect === "9:16"; W = PORTRAIT ? 1080 : 1920; H = PORTRAIT ? 1920 : 1080; U = Math.min(W, H) / 1080; cv.width = W; cv.height = H; fitStage(); }
function fitStage() { const wrap = $("#stageWrap"); const r = wrap.getBoundingClientRect(); const sc = Math.min((r.width - 20) / W, (r.height - 20) / H); cv.style.width = Math.max(50, W * sc) + "px"; cv.style.height = Math.max(50, H * sc) + "px"; }
window.addEventListener("resize", fitStage);
function FAM() { const f = SB.meta.theme.font; if (f === "serif") return '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif'; if (f === "round") return '"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Kosugi Maru","Noto Sans JP",sans-serif'; return '"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic","Meiryo",sans-serif'; }
const MONO = '"SF Mono","Consolas","Menlo","Noto Sans Mono",monospace';
function font(px, w = 800, fam) { return `${w} ${Math.round(px)}px ${fam || FAM()}`; }
function TH() { return SB.meta.theme; }
function alpha(hex, a) { const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

const NO_START = "、。，．,.)）」』】〕〉》！？!?ー〜…・ぁぃぅぇぉっゃゅょァィゥェォッャュョ";
function tokenize(text) { return text.match(/[A-Za-z0-9_.\-\/:@#%+&=~$]+|\s+|./gsu) || []; }
let wrapForced = false;
function wrapLines(text, maxW) {
  const out = []; wrapForced = false;
  String(text || "").split("\n").forEach(par => {
    let line = "";
    tokenize(par).forEach(tok => {
      const test = line + tok;
      if (ctx.measureText(test).width <= maxW || !line || NO_START.includes(tok[0])) { line = test; }
      else { out.push(line.trimEnd()); line = tok.trimStart(); }
      while (ctx.measureText(line).width > maxW && line.length > 1 && !/\s/.test(line) && !NO_START.includes(line[line.length - 1])) {
        wrapForced = true; let i = line.length - 1; while (i > 1 && ctx.measureText(line.slice(0, i)).width > maxW) i--;
        out.push(line.slice(0, i)); line = line.slice(i);
      }
    });
    out.push(line);
  });
  return out;
}
function fitText(text, maxW, maxH, startPx, minPx, w, lh = 1.25, fam) {
  let px = startPx, lines;
  for (; px >= minPx; px -= Math.max(1, px * 0.06)) { ctx.font = font(px, w, fam); lines = wrapLines(text, maxW); if (lines.length * px * lh <= maxH && !wrapForced) break; }
  px = Math.max(px, minPx); ctx.font = font(px, w, fam); lines = wrapLines(text, maxW);
  return { px, lines, lh: px * lh, w: Math.max(0, ...lines.map(l => ctx.measureText(l).width)), h: lines.length * px * lh };
}
// 行ごとに下からせり上がる表示
function revealText(block, x, y, align, color, t, delay = 0, stagger = 0.08, dur = 0.6, w = 800, fam, path, sceneIdx) {
  ctx.font = font(block.px, w, fam); ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillStyle = color;
  block.lines.forEach((ln, i) => {
    const p = E.expo(prog(t, delay + i * stagger, dur));
    if (p <= 0) return;
    const ly = y + i * block.lh;
    const lw = ctx.measureText(ln).width;
    const lx = align === "center" ? x - lw / 2 : align === "right" ? x - lw : x;
    ctx.save(); ctx.beginPath(); ctx.rect(lx - block.px, ly - block.px * 0.2, lw + block.px * 2, block.lh + block.px * 0.45); ctx.clip();
    ctx.globalAlpha *= clamp(p * 1.4, 0, 1);
    ctx.fillText(ln, x, ly + block.px * 1.1 * (1 - p) + block.px * 0.85);
    ctx.restore();
  });
  const bx = align === "center" ? x - block.w / 2 : align === "right" ? x - block.w : x;
  if (path) addHit(sceneIdx, path, bx, y, block.w, block.h);
  return { x: bx, y, w: block.w, h: block.h };
}
function addHit(sceneIdx, path, x, y, w, h) { if (sceneIdx == null) return; hitBoxes.push({ sceneIdx, path, x, y, w: Math.max(w, 40), h: Math.max(h, 30) }); }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawCover(img, x, y, w, h, t, dur, kb = true) {
  if (!img) return false;
  const z = kb ? lerp(1.04, 1.14, clamp(t / Math.max(dur, 0.1), 0, 1)) : 1;
  const ir = img.width / img.height, r = w / h;
  let sw, sh; if (ir > r) { sh = img.height; sw = sh * r; } else { sw = img.width; sh = sw / r; }
  sw /= z; sh /= z;
  const sx = (img.width - sw) / 2 + (kb ? (img.width - sw) * 0.15 * Math.sin(t * 0.15) : 0), sy = (img.height - sh) / 2;
  ctx.drawImage(img, clamp(sx, 0, img.width - sw), clamp(sy, 0, img.height - sh), sw, sh, x, y, w, h);
  return true;
}
function placeholder(x, y, w, h, label) {
  ctx.save(); ctx.fillStyle = alpha(TH().fg, 0.06); ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = alpha(TH().fg, 0.18); ctx.setLineDash([12 * U, 10 * U]); ctx.lineWidth = 2 * U; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  ctx.setLineDash([]); ctx.fillStyle = alpha(TH().fg, 0.35); ctx.font = font(26 * U, 600); ctx.textAlign = "center"; ctx.fillText(label || "画像（未生成）", x + w / 2, y + h / 2);
  ctx.restore();
}

/* ============================================================
   背景（プリセットごと）
============================================================ */
function drawBackground(t) {
  const th = TH(); ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
  const pre = th.preset;
  if (pre === "whiteboard") {
    ctx.strokeStyle = alpha(th.fg, 0.05); ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60 * U) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60 * U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    return;
  }
  if (pre === "cyber") {
    // 奥へ流れる格子
    const hz = H * 0.62; ctx.save(); ctx.strokeStyle = alpha(th.accent2, 0.22); ctx.lineWidth = 1.5 * U;
    for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(W / 2 + k * 40 * U, hz); ctx.lineTo(W / 2 + k * 260 * U, H); ctx.stroke(); }
    for (let k = 0; k < 14; k++) { const z = ((k + (t * 0.6) % 1) / 14); const y = hz + (H - hz) * z * z; ctx.globalAlpha = z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    const g = ctx.createLinearGradient(0, hz - 200 * U, 0, hz + 40 * U); g.addColorStop(0, alpha(th.accent, 0)); g.addColorStop(1, alpha(th.accent, 0.22)); ctx.fillStyle = g; ctx.fillRect(0, hz - 200 * U, W, 240 * U);
    // 流れる16進コード
    ctx.save(); ctx.font = font(18 * U, 500, MONO); ctx.fillStyle = alpha(th.accent2, 0.13); ctx.textAlign = "left";
    for (let c = 0; c < 9; c++) { const x = (c * 0.113 + 0.03) * W; const sp = 30 + (c * 37) % 50; for (let r = 0; r < 26; r++) { const y = ((r * 46 * U + t * sp * U) % (H + 60 * U)) - 30 * U; const v = (Math.imul(c * 131 + r * 977 + Math.floor(t * 4), 2654435761) >>> 0).toString(16).slice(0, 6); ctx.fillText(v, x, y); } }
    ctx.restore();
    return;
  }
  // ゆっくり動く光
  const g1 = ctx.createRadialGradient(W * (0.25 + 0.08 * Math.sin(t * 0.21)), H * (0.3 + 0.06 * Math.cos(t * 0.17)), 0, W * 0.25, H * 0.3, Math.max(W, H) * 0.7);
  g1.addColorStop(0, alpha(th.accent, pre === "pop" ? 0.32 : 0.18)); g1.addColorStop(1, alpha(th.accent, 0));
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * (0.8 + 0.05 * Math.cos(t * 0.13)), H * (0.78 + 0.05 * Math.sin(t * 0.19)), 0, W * 0.8, H * 0.78, Math.max(W, H) * 0.6);
  g2.addColorStop(0, alpha(th.accent2, pre === "pop" ? 0.3 : 0.14)); g2.addColorStop(1, alpha(th.accent2, 0));
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  if (pre === "cinematic" || pre === "stylish") {
    ctx.strokeStyle = alpha(th.fg, 0.045); ctx.lineWidth = 1;
    const step = 90 * U, off = (t * 12 * U) % step;
    for (let x = -step + off; x < W + step; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H * 0.25, H); ctx.stroke(); }
  }
  if (pre === "cinematic") { const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
}
function darken(a) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); }
function bgImage(s, t, dur, dim = 0.45) { const img = sceneImage(s); if (img) { drawCover(img, 0, 0, W, H, t, dur); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(0,0,0,${dim * 0.6})`); g.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, dim + 0.3)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); return true; } return false; }
function accentBar(x, y, w, h, t, delay = 0) { const p = E.expo(prog(t, delay, 0.7)); ctx.fillStyle = TH().accent; ctx.fillRect(x, y, w * p, h); }
function tag(text, x, y, t, delay, sceneIdx, path, color) {
  if (!text) return 0; const p = E.back(prog(t, delay, 0.5)); if (p <= 0) return 0;
  ctx.save(); ctx.font = font(30 * U, 800); const tw = ctx.measureText(text).width; const pad = 16 * U, h = 52 * U;
  ctx.globalAlpha *= clamp(p, 0, 1); ctx.translate(x, y + h / 2); ctx.scale(p, p); ctx.translate(-x, -(y + h / 2));
  ctx.fillStyle = color || TH().accent; roundRect(x, y, tw + pad * 2, h, 6 * U); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, x + pad, y + h / 2 + 1);
  ctx.restore(); addHit(sceneIdx, path, x, y, tw + pad * 2, h); return h;
}
function safe() { return PORTRAIT ? { l: 80 * U, r: W - 80 * U, t: 200 * U, b: H * 0.66 } : { l: 130 * U, r: W - 130 * U, t: 110 * U, b: H - 210 * U }; }

/* ============================================================
   シーンのテンプレート（13種）
   ( s:シーン, t:シーン内の時刻, d:シーンの長さ, i:シーン番号 )
============================================================ */
function itemTimes(n, d, s, start = 0.6) { if (s.itemTimes && s.itemTimes.length) return s.itemTimes; const span = Math.max(0.8, Math.min(d * 0.72, d - 1) - start); return Array.from({ length: n }, (_, k) => start + span * k / Math.max(1, n)); }
function wordsOf(s) { if (s.items && s.items.length) return s.items; return String(s.texts.words || s.texts.title || "").split(/[|｜\n]/).map(x => x.trim()).filter(Boolean); }

const T = {};
T.title = (s, t, d, i) => {
  const th = TH(), S = safe(); const hasImg = bgImage(s, t, d, 0.5); const fg = hasImg ? "#ffffff" : th.fg;
  const cx = PORTRAIT ? W / 2 : S.l, align = PORTRAIT ? "center" : "left";
  const maxW = (S.r - S.l);
  const title = fitText(s.texts.title || "", maxW, (PORTRAIT ? 560 : 420) * U, (PORTRAIT ? 120 : 132) * U, 48 * U, 900, 1.18);
  const sub = s.texts.sub ? fitText(s.texts.sub, maxW, 160 * U, 46 * U, 26 * U, 600, 1.3) : null;
  const totalH = 70 * U + title.h + (sub ? 40 * U + sub.h : 0);
  let y = (PORTRAIT ? H * 0.42 : H * 0.5) - totalH / 2;
  if (s.texts.kicker) { const kx = PORTRAIT ? W / 2 - (ctx.font = font(30 * U, 800), ctx.measureText(s.texts.kicker).width / 2 + 16 * U) : cx; tag(s.texts.kicker, kx, y, t, 0.1, i, "texts.kicker"); }
  y += 70 * U;
  revealText(title, cx, y, align, fg, t, 0.25, 0.1, 0.7, 900, null, "texts.title", i);
  const by = y + title.h + 14 * U; const bw = Math.min(title.w, 260 * U);
  accentBar(PORTRAIT ? W / 2 - bw / 2 : cx, by, bw, 8 * U, t, 0.55);
  if (sub) revealText(sub, cx, by + 34 * U, align, alpha(fg, 0.82), t, 0.75, 0.08, 0.6, 600, null, "texts.sub", i);
};
T.headline = (s, t, d, i) => {
  const th = TH(), S = safe();
  if (!bgImage(s, t, d, 0.35)) placeholder(0, 0, W, H, s.image ? "背景画像（未生成）" : "");
  const maxW = S.r - S.l;
  const title = fitText(s.texts.title || "", maxW, (PORTRAIT ? 520 : 330) * U, (PORTRAIT ? 104 : 110) * U, 44 * U, 900, 1.2);
  const y = (PORTRAIT ? S.b - 40 * U : S.b - 20 * U) - title.h;
  tag(s.texts.label, S.l, y - 80 * U, t, 0.15, i, "texts.label");
  revealText(title, S.l, y, "left", "#fff", t, 0.3, 0.1, 0.7, 900, null, "texts.title", i);
  accentBar(S.l, y + title.h + 16 * U, Math.min(title.w, 320 * U), 8 * U, t, 0.6);
};
T.bullets = (s, t, d, i) => {
  const th = TH(), S = safe(); const items = s.items || [];
  const title = fitText(s.texts.title || "", S.r - S.l, 200 * U, (PORTRAIT ? 84 : 78) * U, 40 * U, 900);
  let y = S.t + (PORTRAIT ? 40 * U : 10 * U);
  revealText(title, S.l, y, "left", th.fg, t, 0.1, 0.08, 0.6, 900, null, "texts.title", i);
  accentBar(S.l, y + title.h + 12 * U, 140 * U, 7 * U, t, 0.35);
  y += title.h + 70 * U;
  const avail = S.b - y; const n = Math.max(1, items.length);
  const rowH = Math.min((PORTRAIT ? 220 : 150) * U, avail / n);
  const times = itemTimes(n, d, s);
  let lastShown = -1; times.forEach((tt, k) => { if (t >= tt) lastShown = k; });
  items.forEach((it, k) => {
    const p = E.out(prog(t, times[k], 0.55)); if (p <= 0) return;
    const ry = y + k * rowH; const x0 = S.l + (1 - p) * 60 * U;
    ctx.save(); ctx.globalAlpha *= p * (k === lastShown || !s.dimPrev ? 1 : 0.55);
    const r = 30 * U; ctx.fillStyle = k === lastShown ? th.accent : alpha(th.fg, 0.16);
    ctx.beginPath(); ctx.arc(x0 + r, ry + rowH / 2, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = font(30 * U, 900); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(k + 1), x0 + r, ry + rowH / 2 + 1);
    const tb = fitText(it, S.r - x0 - r * 2 - 30 * U, rowH * 0.92, (PORTRAIT ? 56 : 52) * U, 26 * U, 700, 1.25);
    ctx.font = font(tb.px, 700); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = th.fg;
    const ty = ry + rowH / 2 - tb.h / 2 + tb.px * 0.95;
    tb.lines.forEach((ln, j) => ctx.fillText(ln, x0 + r * 2 + 30 * U, ty + j * tb.lh));
    ctx.restore();
    addHit(i, "items." + k, x0 + r * 2 + 30 * U, ry + rowH / 2 - tb.h / 2, tb.w, tb.h);
  });
};
T.stat = (s, t, d, i) => {
  const th = TH(); const fg = bgImage(s, t, d, 0.6) ? "#ffffff" : th.fg;
  const raw = String(s.texts.value || "0"); const m = raw.match(/^([^\d\-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const p = E.out(prog(t, 0.3, Math.min(1.6, d * 0.5)));
  let shown = raw;
  if (m) { const num = parseFloat(m[2].replace(/,/g, "")); const dec = (m[2].split(".")[1] || "").length; let v = (num * p).toFixed(dec); if (m[2].includes(",")) v = Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); shown = m[1] + v + m[3]; }
  const cy = PORTRAIT ? H * 0.38 : H * 0.38; const R = (PORTRAIT ? 330 : 240) * U;
  ctx.save(); ctx.lineWidth = 14 * U; ctx.strokeStyle = alpha(fg, 0.1); ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = th.accent; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(W / 2, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * E.inOut(prog(t, 0.2, Math.min(1.8, d * 0.55)))); ctx.stroke(); ctx.restore();
  ctx.font = font(1, 900); const vb = fitText(shown, R * 1.6, R * 0.9, 220 * U, 60 * U, 900, 1.0);
  ctx.font = font(vb.px, 900); const vw = ctx.measureText(shown).width;
  const unit = s.texts.unit || ""; ctx.font = font(vb.px * 0.32, 800); const uw = ctx.measureText(unit).width;
  const sx = W / 2 - (vw + uw + 10 * U) / 2;
  ctx.globalAlpha = clamp(p * 2, 0, 1); ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.font = font(vb.px, 900); ctx.fillText(shown, sx, cy); addHit(i, "texts.value", sx, cy - vb.px / 2, vw, vb.px);
  ctx.font = font(vb.px * 0.32, 800); ctx.fillStyle = th.accent; ctx.fillText(unit, sx + vw + 10 * U, cy + vb.px * 0.22); addHit(i, "texts.unit", sx + vw + 10 * U, cy, uw, vb.px * 0.32);
  ctx.globalAlpha = 1;
  const lb = fitText(s.texts.label || "", W * 0.8, 160 * U, 60 * U, 30 * U, 800);
  revealText(lb, W / 2, cy + R + 50 * U, "center", fg, t, 0.6, 0.08, 0.6, 800, null, "texts.label", i);
  if (s.texts.note) { const nb = fitText(s.texts.note, W * 0.8, 120 * U, 36 * U, 22 * U, 500); revealText(nb, W / 2, cy + R + 60 * U + lb.h, "center", alpha(fg, 0.7), t, 0.85, 0.08, 0.6, 500, null, "texts.note", i); }
};
T.compare = (s, t, d, i) => {
  const th = TH(), S = safe(); const cols = s.cols || [{ label: "A", items: [] }, { label: "B", items: [] }];
  const title = fitText(s.texts.title || "", S.r - S.l, 150 * U, 72 * U, 36 * U, 900);
  revealText(title, W / 2, S.t, "center", th.fg, t, 0.1, 0.08, 0.6, 900, null, "texts.title", i);
  const top = S.t + title.h + 50 * U, gap = 40 * U;
  const boxes = PORTRAIT ? [[S.l, top, S.r - S.l, (S.b - top - gap) / 2], [S.l, top + (S.b - top - gap) / 2 + gap, S.r - S.l, (S.b - top - gap) / 2]]
    : [[S.l, top, (S.r - S.l - gap) / 2, S.b - top], [S.l + (S.r - S.l - gap) / 2 + gap, top, (S.r - S.l - gap) / 2, S.b - top]];
  boxes.forEach(([x, y, w, h], k) => {
    const c = cols[k] || { label: "", items: [] }; const p = E.out(prog(t, 0.3 + k * 0.35, 0.6)); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p; ctx.translate(PORTRAIT ? 0 : (k ? 1 : -1) * (1 - p) * 60 * U, PORTRAIT ? (1 - p) * 60 * U : 0);
    ctx.fillStyle = k ? alpha(th.accent, 0.16) : alpha(th.fg, 0.06); roundRect(x, y, w, h, 18 * U); ctx.fill();
    ctx.strokeStyle = k ? th.accent : alpha(th.fg, 0.2); ctx.lineWidth = 3 * U; ctx.stroke();
    const lb = fitText(c.label || "", w - 60 * U, 110 * U, 56 * U, 28 * U, 900);
    ctx.font = font(lb.px, 900); ctx.fillStyle = k ? th.accent : th.fg; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    lb.lines.forEach((ln, j) => ctx.fillText(ln, x + w / 2, y + 40 * U + lb.px + j * lb.lh));
    addHit(i, `cols.${k}.label`, x + w / 2 - lb.w / 2, y + 40 * U, lb.w, lb.h);
    const its = c.items || []; let yy = y + 70 * U + lb.h; const rh = Math.min(110 * U, (y + h - yy - 20 * U) / Math.max(1, its.length));
    its.forEach((it, j) => {
      const q = E.out(prog(t, 0.6 + k * 0.35 + j * 0.18, 0.5)); if (q <= 0) return;
      const tb = fitText(it, w - 100 * U, rh * 0.95, 42 * U, 22 * U, 600);
      ctx.globalAlpha = p * q; ctx.font = font(tb.px, 600); ctx.fillStyle = th.fg; ctx.textAlign = "left";
      ctx.fillStyle = k ? th.accent : alpha(th.fg, 0.5); ctx.fillRect(x + 36 * U, yy + rh / 2 - 5 * U, 10 * U, 10 * U);
      ctx.fillStyle = th.fg; tb.lines.forEach((ln, m) => ctx.fillText(ln, x + 66 * U, yy + rh / 2 - tb.h / 2 + tb.px * 0.9 + m * tb.lh));
      addHit(i, `cols.${k}.items.${j}`, x + 66 * U, yy + rh / 2 - tb.h / 2, tb.w, tb.h);
      yy += rh;
    });
    ctx.restore();
  });
  const vp = E.back(prog(t, 0.9, 0.5)); if (vp > 0) {
    const cx = PORTRAIT ? W / 2 : S.l + (S.r - S.l) / 2, cy = PORTRAIT ? top + (S.b - top) / 2 : top + (S.b - top) / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(vp, vp); ctx.fillStyle = th.fg; ctx.beginPath(); ctx.arc(0, 0, 46 * U, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = th.bg; ctx.font = font(36 * U, 900); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s.texts.vs || "VS", 0, 2); ctx.restore();
  }
};
T.steps = (s, t, d, i) => {
  const th = TH(), S = safe(); const items = s.items || []; const n = Math.max(1, items.length);
  const title = fitText(s.texts.title || "", S.r - S.l, 150 * U, 72 * U, 36 * U, 900);
  revealText(title, PORTRAIT ? S.l : W / 2, S.t, PORTRAIT ? "left" : "center", th.fg, t, 0.1, 0.08, 0.6, 900, null, "texts.title", i);
  const times = itemTimes(n, d, s, 0.5);
  const lineP = (k) => clamp((t - times[0]) / Math.max(0.1, (times[n - 1] - times[0]) || 0.5), 0, 1);
  if (PORTRAIT) {
    const x = S.l + 40 * U, y0 = S.t + title.h + 90 * U, y1 = S.b; const step = (y1 - y0) / n;
    ctx.strokeStyle = alpha(th.fg, 0.15); ctx.lineWidth = 6 * U; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + step * (n - 1)); ctx.stroke();
    ctx.strokeStyle = th.accent; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + step * (n - 1) * lineP()); ctx.stroke();
    items.forEach((it, k) => {
      const p = E.back(prog(t, times[k], 0.5)); const yy = y0 + step * k;
      ctx.save(); ctx.fillStyle = p > 0 ? th.accent : alpha(th.fg, 0.2); ctx.beginPath(); ctx.arc(x, yy, 32 * U * Math.max(0.6, p), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = font(28 * U, 900); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(k + 1), x, yy + 1);
      if (p > 0) { const tb = fitText(it, S.r - x - 70 * U, step * 0.9, 50 * U, 24 * U, 700); ctx.globalAlpha = clamp(p, 0, 1); ctx.font = font(tb.px, 700); ctx.fillStyle = th.fg; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; tb.lines.forEach((ln, m) => ctx.fillText(ln, x + 70 * U, yy - tb.h / 2 + tb.px * 0.9 + m * tb.lh)); addHit(i, "items." + k, x + 70 * U, yy - tb.h / 2, tb.w, tb.h); }
      ctx.restore();
    });
  } else {
    const y = H * 0.52, x0 = S.l + 80 * U, x1 = S.r - 80 * U; const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
    ctx.strokeStyle = alpha(th.fg, 0.15); ctx.lineWidth = 6 * U; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = th.accent; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * lineP(), y); ctx.stroke();
    items.forEach((it, k) => {
      const p = E.back(prog(t, times[k], 0.5)); const xx = n > 1 ? x0 + step * k : W / 2;
      ctx.save(); ctx.fillStyle = p > 0 ? th.accent : alpha(th.fg, 0.2); ctx.beginPath(); ctx.arc(xx, y, 40 * U * Math.max(0.6, p), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = font(34 * U, 900); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(k + 1), xx, y + 1);
      if (p > 0) { const bw = Math.min(step || 600 * U, 420 * U) * 0.92; const tb = fitText(it, bw, 220 * U, 46 * U, 22 * U, 700); ctx.globalAlpha = clamp(p, 0, 1); ctx.font = font(tb.px, 700); ctx.fillStyle = th.fg; ctx.textBaseline = "alphabetic"; tb.lines.forEach((ln, m) => ctx.fillText(ln, xx, y + 90 * U + tb.px + m * tb.lh)); addHit(i, "items." + k, xx - tb.w / 2, y + 90 * U, tb.w, tb.h); }
      ctx.restore();
    });
  }
};
T.quote = (s, t, d, i) => {
  const th = TH(), S = safe(); const fg = bgImage(s, t, d, 0.65) ? "#ffffff" : th.fg;
  const q = fitText(s.texts.quote || "", S.r - S.l - 80 * U, (PORTRAIT ? 700 : 460) * U, (PORTRAIT ? 70 : 68) * U, 30 * U, 700, 1.45);
  const y = (PORTRAIT ? H * 0.4 : H * 0.48) - q.h / 2;
  ctx.save(); ctx.globalAlpha = E.out(prog(t, 0, 0.6)); ctx.fillStyle = th.accent; ctx.font = font(220 * U, 900, '"Georgia",serif'); ctx.textAlign = "left"; ctx.fillText("“", S.l - 20 * U, y + 110 * U); ctx.restore();
  tag(s.texts.label || "引用", S.l + 40 * U, y - 110 * U, t, 0.05, i, "texts.label", alpha("#000000", 0.6));
  revealText(q, S.l + 40 * U, y, "left", fg, t, 0.25, 0.12, 0.7, 700, null, "texts.quote", i);
  if (s.texts.source) { const sb = fitText("— " + s.texts.source, S.r - S.l, 90 * U, 38 * U, 22 * U, 600); revealText(sb, S.r, y + q.h + 40 * U, "right", alpha(fg, 0.75), t, 0.6 + q.lines.length * 0.12, 0.08, 0.6, 600, null, "texts.source", i); }
};
T.split = (s, t, d, i) => {
  const th = TH(), S = safe(); const img = sceneImage(s);
  const p = E.inOut(prog(t, 0, 0.8));
  if (PORTRAIT) {
    const ih = H * 0.42; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, ih * p); ctx.clip(); if (!drawCover(img, 0, 0, W, ih, t, d)) placeholder(0, 0, W, ih); ctx.restore();
    ctx.fillStyle = th.accent; ctx.fillRect(0, ih * p - 6 * U, W * p, 8 * U);
    const tb = fitText(s.texts.title || "", S.r - S.l, 260 * U, 86 * U, 40 * U, 900); revealText(tb, S.l, ih + 70 * U, "left", th.fg, t, 0.5, 0.1, 0.6, 900, null, "texts.title", i);
    if (s.texts.body) { const bb = fitText(s.texts.body, S.r - S.l, S.b - ih - 140 * U - tb.h, 46 * U, 24 * U, 500, 1.5); revealText(bb, S.l, ih + 110 * U + tb.h, "left", alpha(th.fg, 0.85), t, 0.8, 0.07, 0.6, 500, null, "texts.body", i); }
  } else {
    const iw = W * 0.46, right = s.imageRight; const ix = right ? W - iw : 0;
    ctx.save(); ctx.beginPath(); right ? ctx.rect(W - iw * p, 0, iw * p, H) : ctx.rect(0, 0, iw * p, H); ctx.clip(); if (!drawCover(img, ix, 0, iw, H, t, d)) placeholder(ix, 0, iw, H); ctx.restore();
    const tx = right ? S.l : iw + 90 * U, tw = right ? W - iw - S.l - 90 * U : S.r - iw - 90 * U;
    const tb = fitText(s.texts.title || "", tw, 360 * U, 88 * U, 40 * U, 900);
    const bb = s.texts.body ? fitText(s.texts.body, tw, 420 * U, 42 * U, 22 * U, 500, 1.55) : null;
    const total = tb.h + (bb ? 50 * U + bb.h : 0); const y = H / 2 - total / 2 - 30 * U;
    revealText(tb, tx, y, "left", th.fg, t, 0.45, 0.1, 0.6, 900, null, "texts.title", i);
    accentBar(tx, y + tb.h + 14 * U, 120 * U, 7 * U, t, 0.7);
    if (bb) revealText(bb, tx, y + tb.h + 50 * U, "left", alpha(th.fg, 0.85), t, 0.8, 0.07, 0.6, 500, null, "texts.body", i);
  }
};
T.terminal = (s, t, d, i) => {
  const th = TH(), S = safe(); const lines = s.lines || [];
  const x = S.l - (PORTRAIT ? 20 * U : 0), w = S.r - S.l + (PORTRAIT ? 40 * U : 0); const y = PORTRAIT ? S.t + 40 * U : S.t + 20 * U, h = (PORTRAIT ? S.b - 40 * U : S.b + 60 * U) - y;
  const p = E.out(prog(t, 0, 0.5));
  ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 40 * U);
  ctx.fillStyle = "#0b0d12"; roundRect(x, y, w, h, 16 * U); ctx.fill(); ctx.strokeStyle = alpha(th.fg, 0.15); ctx.lineWidth = 2 * U; ctx.stroke();
  const TF = "#e8e6e1"; ctx.fillStyle = "#1a1d25"; roundRect(x, y, w, 56 * U, 16 * U); ctx.fill(); ctx.fillRect(x, y + 30 * U, w, 26 * U);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 34 * U + k * 30 * U, y + 28 * U, 9 * U, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = alpha(TF, 0.6); ctx.font = font(24 * U, 600); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s.texts.title || "terminal", x + w / 2, y + 29 * U); addHit(i, "texts.title", x + w / 3, y, w / 3, 56 * U);
  const px = (PORTRAIT ? 34 : 36) * U, lh = px * 1.55; ctx.font = font(px, 500, MONO); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const cps = s.cps || 28; let tt = 0.5; let yy = y + 56 * U + 30 * U + px; let cursorX = x + 30 * U, cursorY = yy;
  const maxW = w - 60 * U;
  for (let k = 0; k < lines.length; k++) {
    const raw = lines[k]; const isCmd = raw.startsWith("$ ");
    const dur = isCmd ? raw.length / cps : 0.12;
    const shown = isCmd ? raw.slice(0, Math.floor(clamp((t - tt) / dur, 0, 1) * raw.length)) : (t >= tt ? raw : "");
    if (t < tt) break;
    const wl = wrapLines(shown, maxW);
    wl.forEach((ln, m) => { if (yy > y + h - 20 * U) return; ctx.fillStyle = isCmd ? (m === 0 ? "#5fd4e0" : TF) : alpha(TF, 0.78); ctx.fillText(ln, x + 30 * U, yy); cursorX = x + 30 * U + ctx.measureText(ln).width; cursorY = yy; yy += lh; });
    addHit(i, "lines." + k, x + 30 * U, yy - lh * wl.length - px, maxW, lh * wl.length);
    tt += dur + (isCmd ? 0.35 : 0.08);
  }
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = TF; ctx.fillRect(cursorX + 4 * U, cursorY - px * 0.85, px * 0.55, px); }
  ctx.restore();
};
T.chart = (s, t, d, i) => {
  const th = TH(), S = safe(); const data = s.data || [];
  const title = fitText(s.texts.title || "", S.r - S.l, 150 * U, 72 * U, 36 * U, 900);
  revealText(title, S.l, S.t, "left", th.fg, t, 0.1, 0.08, 0.6, 900, null, "texts.title", i);
  const max = Math.max(1, ...data.map(x => +x.value || 0)); const top = S.t + title.h + 70 * U;
  const n = Math.max(1, data.length); const rowH = Math.min(140 * U, (S.b - top) / n); const labW = (PORTRAIT ? 260 : 340) * U; const barMax = S.r - S.l - labW - 200 * U;
  const best = data.reduce((b, x, k) => (+x.value > +(data[b] || {}).value ? k : b), 0);
  data.forEach((it, k) => {
    const p = E.out(prog(t, 0.4 + k * 0.15, 1.0)); const y = top + k * rowH;
    const lb = fitText(it.label || "", labW - 20 * U, rowH * 0.9, 40 * U, 20 * U, 700);
    ctx.globalAlpha = clamp(p * 2, 0, 1); ctx.font = font(lb.px, 700); ctx.fillStyle = th.fg; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    lb.lines.forEach((ln, m) => ctx.fillText(ln, S.l + labW - 20 * U, y + rowH / 2 - lb.h / 2 + lb.px * 0.9 + m * lb.lh));
    addHit(i, `data.${k}.label`, S.l + labW - 20 * U - lb.w, y + rowH / 2 - lb.h / 2, lb.w, lb.h);
    const bw = barMax * (+it.value || 0) / max * p; ctx.fillStyle = k === best ? th.accent : alpha(th.fg, 0.35);
    roundRect(S.l + labW, y + rowH * 0.2, Math.max(2, bw), rowH * 0.6, 8 * U); ctx.fill();
    ctx.fillStyle = th.fg; ctx.font = font(38 * U, 800); ctx.textAlign = "left"; const val = (+it.value || 0) * p; const dec = String(it.value).split(".")[1]?.length || 0;
    ctx.fillText(val.toFixed(dec) + (s.texts.unit || ""), S.l + labW + bw + 18 * U, y + rowH / 2 + 13 * U);
    addHit(i, `data.${k}.value`, S.l + labW + bw + 18 * U, y + rowH * 0.2, 160 * U, rowH * 0.6);
    ctx.globalAlpha = 1;
  });
  if (s.texts.note) { const nb = fitText(s.texts.note, S.r - S.l, 80 * U, 28 * U, 18 * U, 500); revealText(nb, S.r, S.b + 10 * U, "right", alpha(th.fg, 0.6), t, 1, 0, 0.5, 500, null, "texts.note", i); }
};
T.talk = (s, t, d, i) => {
  const th = TH(), S = safe(); const ch = SB.characters.find(c => c.id === s.character);
  const img = (ch && ch.refAsset && ASSETS.get(ch.refAsset) && ASSETS.get(ch.refAsset).img && !sceneImage(s)) ? ASSETS.get(ch.refAsset).img : sceneImage(s);
  const p = E.out(prog(t, 0, 0.7)); const bob = Math.sin(t * 2.2) * 6 * U;
  if (PORTRAIT) {
    const ih = H * 0.44, iw = W * 0.86; const ix = (W - iw) / 2, iy = H * 0.06 + (1 - p) * 80 * U + bob;
    ctx.save(); ctx.globalAlpha *= p; ctx.fillStyle = alpha(th.accent, 0.18); roundRect(ix, iy, iw, ih, 30 * U); ctx.fill(); ctx.beginPath(); roundRect(ix, iy, iw, ih, 30 * U); ctx.clip(); if (!drawCover(img, ix, iy, iw, ih, t, d, false)) placeholder(ix, iy, iw, ih, ch ? ch.name : "キャラクター"); ctx.restore();
    const tb = fitText(s.texts.title || "", S.r - S.l, 300 * U, 80 * U, 38 * U, 900); revealText(tb, W / 2, iy + ih + 70 * U, "center", th.fg, t, 0.4, 0.1, 0.6, 900, null, "texts.title", i);
    if (s.texts.body) { const bb = fitText(s.texts.body, S.r - S.l, 260 * U, 44 * U, 22 * U, 500, 1.5); revealText(bb, W / 2, iy + ih + 100 * U + tb.h, "center", alpha(th.fg, 0.85), t, 0.7, 0.07, 0.6, 500, null, "texts.body", i); }
  } else {
    const iw = W * 0.36, ih = H * 0.82; const ix = s.characterRight ? W - iw - 60 * U : 60 * U, iy = H - ih + (1 - p) * 80 * U + bob;
    ctx.save(); ctx.globalAlpha *= p; ctx.beginPath(); roundRect(ix, iy, iw, ih + 40 * U, 30 * U); ctx.clip(); if (!drawCover(img, ix, iy, iw, ih, t, d, false)) placeholder(ix, iy, iw, ih, ch ? ch.name : "キャラクター"); ctx.restore();
    const tx = s.characterRight ? S.l : ix + iw + 80 * U, tw = s.characterRight ? ix - S.l - 80 * U : S.r - tx;
    const tb = fitText(s.texts.title || "", tw, 360 * U, 86 * U, 40 * U, 900); const bb = s.texts.body ? fitText(s.texts.body, tw, 380 * U, 44 * U, 22 * U, 500, 1.5) : null;
    const y = H * 0.45 - (tb.h + (bb ? bb.h + 40 * U : 0)) / 2;
    revealText(tb, tx, y, "left", th.fg, t, 0.4, 0.1, 0.6, 900, null, "texts.title", i);
    if (bb) revealText(bb, tx, y + tb.h + 40 * U, "left", alpha(th.fg, 0.85), t, 0.7, 0.07, 0.6, 500, null, "texts.body", i);
  }
};
T.cta = (s, t, d, i) => {
  const th = TH(), S = safe(); const fg = bgImage(s, t, d, 0.6) ? "#ffffff" : th.fg; const items = s.items || [];
  const title = fitText(s.texts.title || "", S.r - S.l, 300 * U, (PORTRAIT ? 100 : 104) * U, 44 * U, 900);
  let y = (PORTRAIT ? H * 0.22 : H * 0.2);
  revealText(title, W / 2, y, "center", fg, t, 0.1, 0.1, 0.7, 900, null, "texts.title", i);
  y += title.h + 60 * U;
  items.forEach((it, k) => { const tb = fitText(it, S.r - S.l, 120 * U, 46 * U, 22 * U, 600); revealText(tb, W / 2, y, "center", alpha(fg, 0.88), t, 0.5 + k * 0.15, 0.06, 0.5, 600, null, "items." + k, i); y += tb.h + 22 * U; });
  if (s.texts.button) {
    const p = E.back(prog(t, 0.9 + items.length * 0.15, 0.6)); const pulse = 1 + 0.035 * Math.sin(t * 5);
    ctx.font = font(48 * U, 900); const bw = ctx.measureText(s.texts.button).width + 110 * U, bh = 110 * U; const by = Math.max(y + 40 * U, PORTRAIT ? H * 0.56 : H * 0.66);
    if (p > 0) { ctx.save(); ctx.translate(W / 2, by + bh / 2); ctx.scale(p * pulse, p * pulse); ctx.fillStyle = th.accent; roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s.texts.button, 0, 3); ctx.restore(); addHit(i, "texts.button", W / 2 - bw / 2, by, bw, bh); }
  }
};
T.kinetic = (s, t, d, i) => {
  const th = TH(), S = safe(); const fg = bgImage(s, t, d, 0.6) ? "#ffffff" : th.fg; const words = wordsOf(s); const n = Math.max(1, words.length);
  const times = itemTimes(n, d, s, 0.2); let k = 0; times.forEach((tt, j) => { if (t >= tt) k = j; });
  const wd = words[k] || ""; const p = E.back(prog(t, times[k], 0.45));
  const isAcc = s.texts.accent && wd.includes(s.texts.accent);
  const tb = fitText(wd, S.r - S.l, (PORTRAIT ? 700 : 520) * U, (PORTRAIT ? 170 : 190) * U, 50 * U, 900, 1.1);
  ctx.save(); ctx.translate(W / 2, (PORTRAIT ? H * 0.42 : H / 2)); const sc = lerp(1.25, 1, p); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 1.5, 0, 1);
  ctx.font = font(tb.px, 900); ctx.fillStyle = isAcc ? th.accent : fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  tb.lines.forEach((ln, m) => ctx.fillText(ln, 0, (m - (tb.lines.length - 1) / 2) * tb.lh)); ctx.restore();
  const path = s.items && s.items.length ? "items." + k : "texts.words"; addHit(i, path, W / 2 - tb.w / 2, (PORTRAIT ? H * 0.42 : H / 2) - tb.h / 2, tb.w, tb.h);
  for (let j = 0; j < n; j++) { ctx.fillStyle = j <= k ? th.accent : alpha(th.fg, 0.2); ctx.fillRect(W / 2 - n * 22 * U + j * 44 * U, (PORTRAIT ? H * 0.42 : H / 2) + tb.h / 2 + 60 * U, 30 * U, 6 * U); }
};

/* ============================================================
   1フレームの描画
============================================================ */
function drawScene(sc, t, collectHits) {
  const s = sc.s; const fn = T[s.template] || T.title;
  const saveHits = hitBoxes; if (!collectHits) hitBoxes = [];
  ctx.save(); drawBackground(sc.start + t); fn(s, t, sc.dur, sc.i); ctx.restore();
  if (!collectHits) hitBoxes = saveHits;
}
const TRANS_DUR = 0.5;
function renderFrame(time, opts = {}) {
  if (!TL || !TL.scenes.length) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); return; }
  time = clamp(time, 0, TL.total - 1e-3);
  const sc = sceneAt(time); const t = time - sc.start;
  hitBoxes = [];
  const tr = sc.s.transition || "fade";
  if (sc.i > 0 && t < TRANS_DUR && tr !== "cut") {
    const prev = TL.scenes[sc.i - 1]; const p = E.inOut(t / TRANS_DUR);
    drawScene(prev, prev.dur + t, false);
    ctx.save();
    if (tr === "fade") ctx.globalAlpha = p;
    else if (tr === "wipe") { ctx.beginPath(); ctx.rect(0, 0, W * p, H); ctx.clip(); }
    else if (tr === "slide") ctx.translate((1 - p) * W, 0);
    else if (tr === "zoom") { ctx.globalAlpha = p; ctx.translate(W / 2, H / 2); const z = lerp(1.15, 1, p); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    drawScene(sc, t, true);
    ctx.restore();
    if (tr === "wipe") { ctx.fillStyle = TH().accent; ctx.fillRect(W * p - 10 * U, 0, 12 * U, H); }
  } else drawScene(sc, t, true);
  if (TH().preset === "cyber") cyberFx(time, t);
  drawOverlay(time, sc, t);
}
// 走査線と、シーンの頭で一瞬走るノイズ（時刻だけで決まるので書き出しても同じ絵になる）
function cyberFx(time, t) {
  ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.16)"; for (let y = 0; y < H; y += 4 * U) ctx.fillRect(0, y, W, 1.5 * U); ctx.restore();
  const f = Math.floor(time * 30); const rnd = k => (Math.imul(f * 7919 + k * 104729, 2654435761) >>> 0) / 4294967296;
  const burst = t < 0.28 || rnd(1) < 0.012;
  if (!burst) return;
  for (let k = 0; k < 6; k++) {
    const y = rnd(10 + k) * H, h = (8 + rnd(20 + k) * 60) * U, dx = (rnd(30 + k) - 0.5) * 80 * U;
    ctx.drawImage(cv, 0, y, W, h, dx, y, W, h);
  }
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.25; ctx.fillStyle = TH().accent; ctx.fillRect(0, rnd(40) * H, W, 3 * U); ctx.restore();
}
function drawOverlay(time, sc, t) {
  const th = TH(); const m = SB.meta;
  // 進行バー
  ctx.fillStyle = alpha(th.fg, 0.08); ctx.fillRect(0, 0, W, 6 * U); ctx.fillStyle = th.accent; ctx.fillRect(0, 0, W * time / TL.total, 6 * U);
  // 番組名（隅）
  if (m.brand) { ctx.font = font(24 * U, 700); ctx.fillStyle = alpha(th.fg, 0.55); ctx.textAlign = PORTRAIT ? "center" : "right"; ctx.textBaseline = "top"; ctx.fillText(m.brand, PORTRAIT ? W / 2 : W - 40 * U, PORTRAIT ? 110 * U : 34 * U); }
  // 札（※フィクション など）
  const notice = sc.s.notice != null ? sc.s.notice : m.notice;
  if (notice) {
    ctx.save(); ctx.font = font(26 * U, 800); const nw = ctx.measureText(notice).width + 32 * U, nh = 46 * U;
    const nx = PORTRAIT ? 60 * U : 40 * U, ny = PORTRAIT ? 150 * U : 30 * U;
    ctx.fillStyle = "rgba(0,0,0,0.6)"; roundRect(nx, ny, nw, nh, 6 * U); ctx.fill();
    ctx.strokeStyle = th.accent; ctx.lineWidth = 2 * U; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(notice, nx + 16 * U, ny + nh / 2 + 1); ctx.restore();
    addHit(sc.i, "notice", nx, ny, nw, nh);
  }
  // 字幕
  const s = sc.s; const sub = (s.subtitle != null ? s.subtitle : s.narration) || "";
  if (m.subtitles && sub && s.showSubtitle !== false) {
    const maxChars = PORTRAIT ? 32 : 46; const chunks = subtitleChunks(sub, maxChars);
    const vd = sc.voiceDur || sub.length / CHARS_PER_SEC; const tt = t - VOICE_LEAD;
    if (tt >= 0 && tt <= vd + 0.3) {
      const total = chunks.reduce((a, c) => a + c.length, 0) || 1; let acc = 0, idx = chunks.length - 1;
      for (let k = 0; k < chunks.length; k++) { acc += chunks[k].length; if (tt <= vd * acc / total) { idx = k; break; } }
      const text = chunks[idx]; const maxW = PORTRAIT ? W * 0.86 : W * 0.8;
      const px = (PORTRAIT ? 50 : 46) * U; ctx.font = font(px, 800); const lines = wrapLines(text, maxW).slice(0, 2);
      const lh = px * 1.3; const by = PORTRAIT ? H * 0.72 : H - 70 * U - lines.length * lh;
      const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 50 * U;
      ctx.fillStyle = "rgba(0,0,0,0.62)"; roundRect(W / 2 - bw / 2, by - 14 * U, bw, lines.length * lh + 24 * U, 10 * U); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "top"; lines.forEach((l, k) => ctx.fillText(l, W / 2, by + k * lh));
      addHit(sc.i, "subtitle", W / 2 - bw / 2, by - 14 * U, bw, lines.length * lh + 24 * U);
    }
  }
}

/* ============================================================
   Gemini API（Canvas 内）
============================================================ */
async function apiCall(model, method, body) {
  const url = `${API_BASE}${model}:${method}?key=${msApiKey()}`;
  let last;
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) return await r.json();
      last = new Error(`${model}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`); last.status = r.status;
      if (r.status === 400 || r.status === 404 || r.status === 403) throw last;
    } catch (e) { last = e; if (e.status === 400 || e.status === 404 || e.status === 403) throw e; }
    await sleep(1200 * Math.pow(2, a));
  }
  throw last;
}
async function tryModels(kind, fn) {
  const list = MODELS[kind]; let lastErr;
  for (let k = 0; k < list.length; k++) {
    try { const r = await fn(list[k]); if (k > 0) { MODELS[kind] = [list[k], ...list.filter((_, j) => j !== k)]; } return r; } catch (e) { lastErr = e; console.warn(e); }
  }
  throw lastErr || new Error("モデルが見つかりません");
}
function pcmToWav(bytes, rate) { const h = new DataView(new ArrayBuffer(44)); const w = (o, s) => [...s].forEach((c, k) => h.setUint8(o + k, c.charCodeAt(0))); w(0, "RIFF"); h.setUint32(4, 36 + bytes.length, true); w(8, "WAVE"); w(12, "fmt "); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, "data"); h.setUint32(40, bytes.length, true); const out = new Uint8Array(44 + bytes.length); out.set(new Uint8Array(h.buffer), 0); out.set(bytes, 44); return out; }
async function genVoice(s, force) {
  if (!s.narration) return;
  const key = voiceKey(s);
  if (!force && ASSETS.get(key)) { s.voiceAsset = key; return; }
  if (!force) { const cached = await DB.get(key); if (cached) { await restoreAsset(key, cached); s.voiceAsset = key; return; } }
  const v = Object.assign({}, SB.meta.voice, s.voice || {});
  const text = v.style ? `次の文を${v.style}読み上げてください：\n${s.narration}` : s.narration;
  const json = await tryModels("tts", model => apiCall(model, "generateContent", {
    contents: [{ parts: [{ text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v.name } } } }
  }));
  const part = json?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error("音声が返ってきませんでした");
  const mime = part.inlineData.mimeType || "audio/L16;rate=24000"; const bytes = b64ToBytes(part.inlineData.data);
  let rec;
  if (/L16|pcm/i.test(mime)) { const rate = +(mime.match(/rate=(\d+)/) || [0, 24000])[1]; rec = { kind: "voice", mime: "audio/wav", bytes: pcmToWav(bytes, rate) }; }
  else rec = { kind: "voice", mime, bytes };
  usage.tts++;
  await restoreAsset(key, rec); DB.put(key, rec); s.voiceAsset = key;
}
async function genImage(s, force) {
  if (!s.image || !(s.image.prompt || "").trim()) return;
  const key = imageKey(s);
  if (!force && ASSETS.get(key)) { s.image.asset = key; return; }
  if (!force) { const cached = await DB.get(key); if (cached) { await restoreAsset(key, cached); s.image.asset = key; return; } }
  const prompt = fullImagePrompt(s); const ar = imageAspect(s);
  const refs = (s.image.characters || []).map(id => SB.characters.find(c => c.id === id)).filter(c => c && c.refAsset && ASSETS.get(c.refAsset)).map(c => ASSETS.get(c.refAsset));
  const json = await tryModels("image", async model => {
    if (model.startsWith("imagen")) {
      const r = await apiCall(model, "predict", { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: ar } });
      const b = r?.predictions?.[0]?.bytesBase64Encoded; if (!b) throw new Error("画像が返ってきませんでした"); return { data: b, mime: "image/png" };
    }
    const parts = [{ text: `Generate one image. Aspect ratio ${ar}. ${prompt}` }];
    refs.forEach(a => parts.push({ inlineData: { mimeType: a.mime, data: bytesToB64(a.bytes) } }));
    const body = { contents: [{ parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: ar } } };
    let r; try { r = await apiCall(model, "generateContent", body); } catch (e) { if (e.status === 400) { delete body.generationConfig.imageConfig; r = await apiCall(model, "generateContent", body); } else throw e; }
    const p = r?.candidates?.[0]?.content?.parts?.find(x => x.inlineData); if (!p) throw new Error("画像が返ってきませんでした"); return { data: p.inlineData.data, mime: p.inlineData.mimeType || "image/png" };
  });
  const rec = { kind: "image", mime: json.mime, bytes: b64ToBytes(json.data) };
  usage.image++;
  await restoreAsset(key, rec); DB.put(key, rec); s.image.asset = key;
}
async function restoreAsset(key, rec) {
  const a = { kind: rec.kind, mime: rec.mime, bytes: rec.bytes instanceof Uint8Array ? rec.bytes : new Uint8Array(rec.bytes) };
  if (a.kind === "image") { a.img = await loadImage(new Blob([a.bytes], { type: a.mime })); }
  else { a.buffer = await ac().decodeAudioData(a.bytes.slice().buffer); }
  ASSETS.set(key, a); return a;
}
function loadImage(blob) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(blob); }); }

let genBusy = false;
async function generateAll() {
  if (genBusy) return; genBusy = true; $("#btnGen").disabled = true; $("#btnGen").textContent = "生成中…";
  const jobs = [];
  SB.scenes.forEach(s => { if (s.narration && !sceneVoice(s)) jobs.push(["voice", s]); if (s.image && s.image.prompt && !sceneImage(s)) jobs.push(["image", s]); });
  let done = 0, fail = 0; const errs = [];
  const nv = jobs.filter(j => j[0] === "voice").length, ni = jobs.length - nv;
  const prog = () => { $("#genBar").style.width = Math.round(done / Math.max(1, jobs.length) * 100) + "%"; $("#genMsg").textContent = `${done} / ${jobs.length} 件（声 ${nv} 本・画像 ${ni} 枚）。1〜3 分かかります。この画面のままお待ちください。` + (fail ? `　失敗 ${fail} 件` : ""); };
  if (jobs.length) { $("#genTitle").textContent = "声と画像を作っています"; $("#genClose").style.display = "none"; prog(); openModal("#mGen"); }
  const run = async ([k, s]) => { try { k === "voice" ? await genVoice(s) : await genImage(s); } catch (e) { fail++; errs.push(`シーン ${SB.scenes.indexOf(s) + 1} の${k === "voice" ? "声" : "画像"}: ${e.message}`); } done++; prog(); status(`生成中 ${done}/${jobs.length}（声 ${usage.tts}・画像 ${usage.image} 回使用）`); rebuild(true); };
  const q = jobs.slice(); const workers = Array.from({ length: 2 }, async () => { while (q.length) await run(q.shift()); });
  await Promise.all(workers);
  genBusy = false; $("#btnGen").disabled = false; $("#btnGen").textContent = "声と画像を作る"; rebuild();
  if (!jobs.length) status("作る必要のある声・画像はありません", "ok");
  else if (fail) { status(`完了（失敗 ${fail} 件）: ${errs[0]}`, "err"); console.warn(errs); $("#genTitle").textContent = `できました（失敗 ${fail} 件）`; $("#genMsg").textContent = errs.join("　/　") + "　→ もう一度「声と画像を作る」を押すと、失敗した分だけ作り直します。"; $("#genClose").style.display = ""; }
  else { status(`声と画像ができました（今回 声 ${usage.tts}・画像 ${usage.image} 回）。「▶ 再生」で確認してください`, "ok"); $("#genTitle").textContent = "声と画像ができました"; setTimeout(() => { if (!genBusy) $("#mGen").style.display = "none"; }, 1200); }
}

/* ============================================================
   BGM：AI で作る（Lyria）／自動で作る（ブラウザ内で合成）
============================================================ */
function defaultMusicPrompt() {
  const m = SB.meta; if (m.bgm.prompt) return m.bgm.prompt;
  const st = { cyber: "dark synthwave, tense pulsing bass, glitchy textures", cinematic: "cinematic orchestral hybrid, elegant and tense", pop: "upbeat pop, bright, playful", whiteboard: "light lo-fi, calm, unobtrusive", stylish: "sleek modern electronic, confident" }[TH().preset] || "sleek modern electronic";
  return `${st} background music for a ${Math.round(TL.total)}-second video with narration. Minimal, no lead melody in the mid range, steady and loopable. Instrumental, no vocals.`;
}
async function genMusic(prompt) {
  const order = TL.total > 35 ? ["lyria-3-pro-preview", "lyria-3.5", ...MODELS.music] : MODELS.music;
  const errs = [];
  for (const model of [...new Set(order)]) {
    for (const mods of [["AUDIO", "TEXT"], ["AUDIO"]]) {
      try {
        const r = await apiCall(model, "generateContent", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: mods } });
        const p = r?.candidates?.[0]?.content?.parts?.find(x => x.inlineData && /audio/.test(x.inlineData.mimeType || "audio"));
        if (!p) throw new Error("音楽が返ってきませんでした");
        await restoreAsset("bgm", { kind: "bgm", mime: p.inlineData.mimeType || "audio/mpeg", bytes: b64ToBytes(p.inlineData.data) });
        delete SB.meta.bgm.synth; SB.meta.bgm.prompt = prompt; usage.music++;
        DB.put("bgm_last", { kind: "bgm", mime: ASSETS.get("bgm").mime, bytes: ASSETS.get("bgm").bytes });
        return model;
      } catch (e) { errs.push(`${model}: ${e.message}`); if (e.status !== 400) break; }
    }
  }
  throw new Error(errs.join(" ; "));
}
// 時刻と乱数の種だけで決まる、ループしやすい BGM を OfflineAudioContext で合成する
const SYNTH = {
  cyber: { bpm: 112, minor: true, drums: "four", arp: "square", bass: 8, pad: "sawtooth", cut: 1400 },
  cinematic: { bpm: 72, minor: true, drums: "pulse", arp: null, bass: 1, pad: "sawtooth", cut: 900 },
  stylish: { bpm: 104, minor: false, drums: "soft", arp: "triangle", bass: 8, pad: "triangle", cut: 2200 },
  pop: { bpm: 120, minor: false, drums: "pop", arp: "square", bass: 4, pad: "square", cut: 2600 },
  calm: { bpm: 84, minor: false, drums: null, arp: "triangle", bass: 1, pad: "triangle", cut: 1600 }
};
async function synthBgm(style, seconds) {
  const st = SYNTH[style] || SYNTH.stylish; const sr = 44100; seconds = Math.max(8, Math.min(seconds, 240));
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sr), sr);
  const beat = 60 / st.bpm, bar = beat * 4, bars = Math.ceil(seconds / bar);
  const master = ctx.createGain(); const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(0.55, 2); master.gain.setValueAtTime(0.55, Math.max(2, seconds - 3)); master.gain.linearRampToValueAtTime(0, seconds);
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const noise = ctx.createBuffer(1, sr, sr); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  const prog = st.minor ? [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-2, 2, 5]] : [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]];
  const hz = (base, n) => base * Math.pow(2, n / 12);
  const env = (g, t, a, d, peak) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const tone = (type, f, t, a, d, peak, cut, dest) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const g = ctx.createGain(); env(g, t, a, d, peak); let n = o; if (cut) { const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = cut; o.connect(fl); n = fl; } n.connect(g); g.connect(dest || master); o.start(t); o.stop(t + a + d + 0.05); };
  const hit = (t, type, peak) => {
    if (type === "kick") { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); env(g, t, 0.003, 0.3, peak); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.35); return; }
    const src = ctx.createBufferSource(); src.buffer = noise; const f = ctx.createBiquadFilter(); f.type = type === "hat" ? "highpass" : "bandpass"; f.frequency.value = type === "hat" ? 7000 : 1800; const g = ctx.createGain(); env(g, t, 0.002, type === "hat" ? 0.05 : 0.16, peak); src.connect(f); f.connect(g); g.connect(master); src.start(t, rnd() * 0.5); src.stop(t + 0.25);
  };
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar, ch = prog[b % 4];
    ch.forEach(n => [-6, 6].forEach(c => { const o = ctx.createOscillator(); o.type = st.pad; o.frequency.value = hz(220, n); o.detune.value = c; const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = st.cut * 0.6; const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.022, t0 + bar * 0.3); g.gain.linearRampToValueAtTime(0.0, t0 + bar + 0.08); o.connect(fl); fl.connect(g); g.connect(master); o.start(t0); o.stop(t0 + bar + 0.1); }));
    const bf = hz(55, ch[0]); const step = bar / st.bass;
    for (let k = 0; k < st.bass; k++) tone("sawtooth", bf, t0 + k * step, 0.01, Math.min(step * 0.9, 1.8), st.bass === 1 ? 0.12 : 0.16, 380);
    if (st.arp) { const notes = [...ch, ch[0] + 12]; for (let k = 0; k < 16; k++) if (st.arp !== "triangle" || k % 2 === 0) tone(st.arp, hz(440, notes[k % notes.length]), t0 + k * beat / 4, 0.005, beat * 0.35, 0.035, st.cut, null); }
    for (let k = 0; k < 4; k++) {
      const t = t0 + k * beat;
      if (st.drums === "four" || st.drums === "pop") { hit(t, "kick", 0.5); hit(t + beat / 2, "hat", 0.12); if (st.drums === "pop" && k % 2 === 1) hit(t, "snare", 0.18); if (st.drums === "four" && k === 3 && b % 2 === 1) hit(t + beat * 0.75, "snare", 0.12); }
      else if (st.drums === "soft") { if (k % 2 === 0) hit(t, "kick", 0.32); hit(t, "hat", 0.06); hit(t + beat / 2, "hat", 0.05); }
      else if (st.drums === "pulse" && k % 2 === 0) hit(t, "kick", 0.35);
    }
  }
  return await ctx.startRendering();
}
async function makeSynthBgm(style) {
  const buf = await synthBgm(style, (TL ? TL.total : 30) + 2);
  ASSETS.set("bgm", { kind: "bgm", mime: "synth", bytes: new Uint8Array(0), buffer: buf });
  SB.meta.bgm.synth = style;
}
async function ensureSynthBgm() { if (SB.meta.bgm.synth && !ASSETS.get("bgm")) { await makeSynthBgm(SB.meta.bgm.synth); } }
function bgmLabel() { const a = ASSETS.get("bgm"); if (!a) return "いまの BGM：なし"; if (a.mime === "synth") return `いまの BGM：自動で作った BGM（${$("#bgmStyle").querySelector(`[value="${SB.meta.bgm.synth}"]`)?.textContent || SB.meta.bgm.synth}・${a.buffer.duration.toFixed(0)} 秒）`; return `いまの BGM：${a.buffer.duration.toFixed(0)} 秒の音声（ループ再生）`; }
function openBgm() { $("#bgmPrompt").value = defaultMusicPrompt(); const st = SB.meta.bgm.synth || { cyber: "cyber", cinematic: "cinematic", pop: "pop", whiteboard: "calm" }[TH().preset] || "stylish"; $("#bgmStyle").value = st; $("#bgmNow").textContent = bgmLabel(); $("#bgmMsg").textContent = ""; openModal("#mBgm"); }
$("#bgmAi").onclick = async () => {
  const b = $("#bgmAi"); b.disabled = true; b.textContent = "作っています…（1〜2 分）"; $("#bgmMsg").style.color = ""; $("#bgmMsg").textContent = "Gemini の音楽生成で作っています。";
  try { snapshot(); const model = await genMusic($("#bgmPrompt").value.trim() || defaultMusicPrompt()); $("#bgmMsg").textContent = `できました（${model}）。「▶ 試聴」で確かめてください。`; status("AI で BGM を作りました", "ok"); }
  catch (e) { $("#bgmMsg").style.color = "#ff8a8a"; $("#bgmMsg").textContent = "AI では作れませんでした。「自動で作る」か「ファイルから」を使ってください。（" + e.message.slice(0, 300) + "）"; }
  b.disabled = false; b.textContent = "AI で作る"; $("#bgmNow").textContent = bgmLabel(); renderSceneButtons();
};
$("#bgmSynth").onclick = async () => { const b = $("#bgmSynth"); b.disabled = true; $("#bgmMsg").style.color = ""; $("#bgmMsg").textContent = "作っています…（10〜40 秒）"; try { snapshot(); await makeSynthBgm($("#bgmStyle").value); $("#bgmMsg").textContent = "できました。「▶ 試聴」で確かめてください。"; status("BGM を自動で作りました", "ok"); } catch (e) { $("#bgmMsg").textContent = "作れませんでした: " + e.message; } b.disabled = false; $("#bgmNow").textContent = bgmLabel(); };
$("#bgmFile").onclick = () => $("#fileBgm").click();
$("#bgmNone").onclick = () => { snapshot(); ASSETS.delete("bgm"); delete SB.meta.bgm.synth; $("#bgmNow").textContent = bgmLabel(); status("BGM を外しました"); };
let bgmPreview = null;
$("#bgmPlay").onclick = () => { const a = ASSETS.get("bgm"); if (!a) { $("#bgmMsg").textContent = "BGM がありません"; return; } if (bgmPreview) { try { bgmPreview.stop(); } catch (e) { } bgmPreview = null; return; } const x = ac(); x.resume(); const g = x.createGain(); g.gain.value = 0.8; const s = x.createBufferSource(); s.buffer = a.buffer; s.connect(g); g.connect(x.destination); s.start(0, 0, 10); s.onended = () => { bgmPreview = null; }; bgmPreview = s; };

/* ============================================================
   音（再生と書き出しで共通のミックス）
============================================================ */
function scheduleAudio(actx, dest, from) {
  const nodes = [];
  TL.scenes.forEach(sc => {
    const v = sceneVoice(sc.s); if (!v) return;
    const st = sc.start + VOICE_LEAD; const end = st + v.buffer.duration; if (end <= from) return;
    const src = actx.createBufferSource(); src.buffer = v.buffer; src.connect(dest);
    const off = Math.max(0, from - st); src.start(actx.currentTime + Math.max(0, st - from), off); nodes.push(src);
  });
  const bgm = ASSETS.get("bgm");
  if (bgm && bgm.buffer) {
    const g = actx.createGain(); const src = actx.createBufferSource(); src.buffer = bgm.buffer; src.loop = true; src.connect(g); g.connect(dest);
    const base = SB.meta.bgm.volume; const now = actx.currentTime;
    const at = (tt) => now + Math.max(0, tt - from);
    g.gain.setValueAtTime(base * 1.5, now);
    TL.scenes.forEach(sc => { const v = sceneVoice(sc.s); if (!v) return; const a = sc.start + VOICE_LEAD, b = a + v.buffer.duration; if (b < from) return; g.gain.linearRampToValueAtTime(base * 1.5, at(a - 0.3)); g.gain.linearRampToValueAtTime(base, at(a)); g.gain.setValueAtTime(base, at(b)); g.gain.linearRampToValueAtTime(base * 1.5, at(b + 0.4)); });
    const fo = Math.max(from, TL.total - 1.8); g.gain.setValueAtTime(base * 1.2, at(fo)); g.gain.linearRampToValueAtTime(0, at(TL.total));
    src.start(now, from % bgm.buffer.duration); src.stop(at(TL.total)); nodes.push(src);
  }
  return nodes;
}

/* ============================================================
   再生
============================================================ */
let playNodes = [], playT0 = 0, playFrom = 0;
function play() {
  if (!TL.total) return; if (playhead >= TL.total - 0.05) playhead = 0;
  const a = ac(); a.resume(); playing = true; playFrom = playhead; playT0 = a.currentTime; playNodes = scheduleAudio(a, a.destination, playhead);
  $("#btnPlay").textContent = "❚❚ 停止"; requestAnimationFrame(tick);
}
function stop() { playing = false; playNodes.forEach(n => { try { n.stop(); } catch (e) { } }); playNodes = []; $("#btnPlay").textContent = "▶ 再生"; }
function tick() {
  if (!playing) return;
  playhead = playFrom + (ac().currentTime - playT0);
  if (playhead >= TL.total) { playhead = TL.total; stop(); }
  draw(); requestAnimationFrame(tick);
}
function draw() {
  renderFrame(playhead);
  $("#seek").value = TL.total ? Math.round(playhead / TL.total * 1000) : 0;
  $("#time").textContent = `${fmtTime(playhead)} / ${fmtTime(TL.total)}`;
  const sc = sceneAt(playhead); if (sc && sc.i !== cur && playing) { cur = sc.i; renderSceneButtons(); renderSide(); }
}
function rebuild(keepSide) {
  TL = computeTimeline(); setSize(); $("#projTitle").textContent = SB.meta.title || "Motion Studio";
  cur = clamp(cur, 0, Math.max(0, SB.scenes.length - 1)); renderSceneButtons(); if (!keepSide) renderSide(); draw();
}
function gotoScene(k) { cur = k; const sc = TL.scenes[k]; if (sc) playhead = sc.start + Math.min(sc.dur * 0.6, 2.2); if (playing) { stop(); } renderSceneButtons(); renderSide(); draw(); }

/* ============================================================
   画面の文字をクリックして直す
============================================================ */
cv.addEventListener("click", ev => {
  const r = cv.getBoundingClientRect(); const x = (ev.clientX - r.left) * W / r.width, y = (ev.clientY - r.top) * H / r.height;
  const hit = [...hitBoxes].reverse().find(b => x >= b.x - 10 && x <= b.x + b.w + 10 && y >= b.y - 10 && y <= b.y + b.h + 10);
  if (!hit) { if (playing) stop(); else play(); return; }
  if (playing) stop();
  const s = SB.scenes[hit.sceneIdx]; const val = getPath(s, hit.path);
  const box = $("#editBox"); const wr = $("#stageWrap").getBoundingClientRect();
  box.style.left = (r.left - wr.left + hit.x * r.width / W) + "px"; box.style.top = (r.top - wr.top + hit.y * r.height / H) + "px";
  box.style.width = Math.max(220, hit.w * r.width / W + 20) + "px"; box.style.height = Math.max(60, hit.h * r.height / H + 20) + "px";
  box.value = val == null ? "" : String(val); box.style.display = "block"; box.focus(); box.select();
  box.onblur = () => commitEdit(); box.onkeydown = e => { if (e.key === "Escape") { box.onblur = null; box.style.display = "none"; } if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) box.blur(); };
  function commitEdit() { box.onblur = null; box.style.display = "none"; const nv = box.value; if (nv === (val == null ? "" : String(val))) return; snapshot(); setPath(s, hit.path, hit.path.endsWith(".value") && !isNaN(+nv) ? +nv : nv); cur = hit.sceneIdx; rebuild(); status("文字を直しました（Ctrl+Z 相当は「1つ前に戻す」）", "ok"); }
});

/* ============================================================
   右側の編集パネル
============================================================ */
const TEMPLATES = { title: "タイトル", headline: "見出し＋背景画像", bullets: "箇条書き", stat: "大きな数字", compare: "比較", steps: "手順", quote: "引用", split: "画像＋文章", terminal: "ターミナル", chart: "棒グラフ", talk: "キャラ＋セリフ", cta: "締め・告知", kinetic: "キネティック文字" };
const TEXT_KEYS = { title: ["kicker", "title", "sub"], headline: ["label", "title"], bullets: ["title"], stat: ["value", "unit", "label", "note"], compare: ["title"], steps: ["title"], quote: ["label", "quote", "source"], split: ["title", "body"], terminal: ["title"], chart: ["title", "unit", "note"], talk: ["title", "body"], cta: ["title", "button"], kinetic: ["accent"] };
const LIST_OF = { bullets: "items", steps: "items", cta: "items", kinetic: "items", terminal: "lines" };
function renderSceneButtons() {
  const el = $("#scenes"); el.innerHTML = "";
  SB.scenes.forEach((s, k) => {
    const b = document.createElement("button"); b.textContent = k + 1; b.className = k === cur ? "on" : ""; b.title = TEMPLATES[s.template] || s.template;
    const need = (s.narration && !sceneVoice(s)) || (s.image && s.image.prompt && !sceneImage(s));
    const dot = document.createElement("span"); dot.className = "dot"; dot.style.background = need ? "#e8a33d" : "#3fbf7f"; b.appendChild(dot);
    b.onclick = () => gotoScene(k); el.appendChild(b);
  });
}
function h(tag, attrs = {}, ...kids) { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => { if (k.startsWith("on")) e[k] = v; else if (k === "html") e.innerHTML = v; else e.setAttribute(k, v); }); kids.flat().forEach(c => e.append(c)); return e; }
function field(label, value, onchange, opts = {}) {
  const inp = opts.multi ? h("textarea", { rows: opts.rows || 3 }) : h("input", { type: opts.type || "text" }); inp.value = value == null ? "" : value;
  inp.onchange = () => { snapshot(); onchange(inp.value); rebuild(); };
  return [h("label", {}, label), inp];
}
function renderSide() {
  const side = $("#side"); side.innerHTML = ""; const s = SB.scenes[cur]; if (!s) { side.append(h("p", {}, "シーンがありません")); return; }
  const sc = TL.scenes[cur];
  side.append(h("h3", {}, `シーン ${cur + 1} / ${SB.scenes.length}　（${sc ? sc.dur.toFixed(1) : "-"} 秒）`));
  const sel = h("select"); Object.entries(TEMPLATES).forEach(([k, v]) => { const o = h("option", { value: k }, v); if (k === s.template) o.selected = true; sel.append(o); });
  sel.onchange = () => { snapshot(); s.template = sel.value; rebuild(); };
  side.append(h("label", {}, "型"), sel);
  (TEXT_KEYS[s.template] || []).forEach(k => side.append(...field("文字: " + k, s.texts[k], v => { s.texts[k] = v; }, { multi: ["title", "body", "quote", "sub"].includes(k), rows: 2 })));
  const lk = LIST_OF[s.template]; if (lk) side.append(...field(lk === "lines" ? "行（1行ずつ。コマンドは先頭に「$ 」）" : "項目（1行に1つ）", (s[lk] || []).join("\n"), v => { s[lk] = v.split("\n").filter(x => x.trim() !== ""); }, { multi: true, rows: 4 }));
  if (s.template === "compare") { [0, 1].forEach(k => { s.cols = s.cols || [{ label: "", items: [] }, { label: "", items: [] }]; side.append(...field(`比較 ${k ? "右" : "左"}（1行目=見出し）`, [s.cols[k].label, ...(s.cols[k].items || [])].join("\n"), v => { const a = v.split("\n").filter(x => x.trim()); s.cols[k] = { label: a[0] || "", items: a.slice(1) }; }, { multi: true, rows: 4 })); }); }
  if (s.template === "chart") side.append(...field("データ（ラベル=数値 を1行ずつ）", (s.data || []).map(d => `${d.label}=${d.value}`).join("\n"), v => { s.data = v.split("\n").filter(x => x.includes("=")).map(x => { const [a, b] = x.split("="); return { label: a.trim(), value: parseFloat(b) || 0 }; }); }, { multi: true, rows: 4 }));
  if (s.template === "talk") { const cs = h("select"); cs.append(h("option", { value: "" }, "（キャラなし）")); SB.characters.forEach(c => { const o = h("option", { value: c.id }, c.name); if (c.id === s.character) o.selected = true; cs.append(o); }); cs.onchange = () => { snapshot(); s.character = cs.value; rebuild(); }; side.append(h("label", {}, "キャラクター"), cs); }

  side.append(h("h3", {}, "ナレーション"));
  side.append(...field("読み上げ用の文（カタカナ・ひらがなで読みを直してよい）", s.narration, v => { s.narration = v; s.voiceAsset = null; }, { multi: true, rows: 3 }));
  side.append(...field("字幕（画面に出る正式表記）", s.subtitle, v => { s.subtitle = v; }, { multi: true, rows: 3 }));
  const v = sceneVoice(s);
  side.append(h("div", { class: "row" },
    h("button", { onclick: async () => { try { status("声を作り直しています…"); snapshot(); await genVoice(s, true); rebuild(); status("声を作り直しました", "ok"); } catch (e) { status("声の生成に失敗: " + e.message, "err"); } } }, v ? "声を作り直す" : "声を作る"),
    h("button", { onclick: () => { pendingVoiceScene = s; $("#fileVoice").click(); } }, "手元の音声に差し替え"),
    v ? h("button", { onclick: () => { const a = ac(); a.resume(); const src = a.createBufferSource(); src.buffer = v.buffer; src.connect(a.destination); src.start(); } }, "▶ 試聴") : ""));
  side.append(h("p", { class: "note" }, v ? `声: ${v.buffer.duration.toFixed(1)} 秒` : "声: まだありません"));

  side.append(h("h3", {}, "画像"));
  side.append(...field("画像の指示（英語推奨。文字は入れない）", s.image && s.image.prompt, v => { s.image = s.image || {}; s.image.prompt = v; s.image.asset = null; }, { multi: true, rows: 3 }));
  side.append(...field("言葉で直す（例：夕やけの背景にして）", "", v => { if (!v.trim()) return; s.image = s.image || {}; s.image.prompt = (s.image.prompt || "") + ". " + v; s.image.asset = null; }, {}));
  side.append(h("div", { class: "row" },
    h("button", { onclick: async () => { try { status("画像を作り直しています…"); snapshot(); await genImage(s, true); rebuild(); status("画像を作り直しました", "ok"); } catch (e) { status("画像の生成に失敗: " + e.message, "err"); } } }, sceneImage(s) ? "画像を作り直す" : "画像を作る"),
    h("button", { onclick: () => { pendingImageScene = s; $("#fileImg").click(); } }, "手元の画像に差し替え"),
    s.image ? h("button", { onclick: () => { snapshot(); delete s.image; rebuild(); } }, "画像なし") : ""));

  side.append(...field("左上の札（例：※フィクション。空なら出さない）", s.notice, v => { s.notice = v || undefined; }));
  side.append(h("h3", {}, "動き"));
  const tr = h("select"); ["fade", "wipe", "slide", "zoom", "cut"].forEach(k => { const o = h("option", { value: k }, { fade: "フェード", wipe: "ワイプ", slide: "スライド", zoom: "ズーム", cut: "カット" }[k]); if (k === (s.transition || "fade")) o.selected = true; tr.append(o); });
  tr.onchange = () => { snapshot(); s.transition = tr.value; rebuild(); }; side.append(h("label", {}, "切り替え"), tr);
  side.append(...field("最短の長さ（秒。空なら声に合わせる）", s.duration || "", v => { s.duration = parseFloat(v) || undefined; }, { type: "number" }));
  side.append(h("div", { class: "row" },
    h("button", { onclick: () => { snapshot(); const c = JSON.parse(JSON.stringify(s)); c.id = s.id + "b"; SB.scenes.splice(cur + 1, 0, c); cur++; rebuild(); } }, "複製"),
    h("button", { onclick: () => { if (cur > 0) { snapshot(); [SB.scenes[cur - 1], SB.scenes[cur]] = [SB.scenes[cur], SB.scenes[cur - 1]]; cur--; rebuild(); } } }, "← 前へ"),
    h("button", { onclick: () => { if (cur < SB.scenes.length - 1) { snapshot(); [SB.scenes[cur + 1], SB.scenes[cur]] = [SB.scenes[cur], SB.scenes[cur + 1]]; cur++; rebuild(); } } }, "後へ →"),
    h("button", { onclick: () => { if (SB.scenes.length > 1 && confirm("このシーンを削除しますか？")) { snapshot(); SB.scenes.splice(cur, 1); rebuild(); } } }, "削除")));

  side.append(h("h3", {}, "全体"));
  const asp = h("select"); ["16:9", "9:16"].forEach(k => { const o = h("option", { value: k }, k === "16:9" ? "横 16:9" : "縦 9:16（ショート）"); if (k === SB.meta.aspect) o.selected = true; asp.append(o); });
  asp.onchange = () => { snapshot(); SB.meta.aspect = asp.value; rebuild(); }; side.append(h("label", {}, "縦横"), asp);
  const pre = h("select"); ["stylish", "cinematic", "cyber", "pop", "whiteboard"].forEach(k => { const o = h("option", { value: k }, { stylish: "スタイリッシュ", cinematic: "シネマ", cyber: "サイバー", pop: "ポップ", whiteboard: "ホワイトボード" }[k]); if (k === TH().preset) o.selected = true; pre.append(o); });
  pre.onchange = () => { snapshot(); TH().preset = pre.value; rebuild(); }; side.append(h("label", {}, "背景の雰囲気"), pre);
  const colors = h("div", { class: "row" }); [["bg", "背景"], ["fg", "文字"], ["accent", "強調"], ["accent2", "副"]].forEach(([k, l]) => { const c = h("input", { type: "color" }); c.value = TH()[k]; c.onchange = () => { snapshot(); TH()[k] = c.value; rebuild(); }; colors.append(h("label", { style: "display:flex;gap:4px;align-items:center;margin:0" }, l, c)); }); side.append(colors);
  side.append(...field("声の調子（例：明るく少し速めに）", SB.meta.voice.style, v => { SB.meta.voice.style = v; }));
  if (SB.characters.length) {
    side.append(h("h3", {}, "キャラクターの参照画像（画像生成で顔や服をそろえる）"));
    SB.characters.forEach(c => { const has = c.refAsset && ASSETS.get(c.refAsset); side.append(h("div", { class: "row" }, h("span", { style: "flex:1" }, c.name + (has ? " ✓" : "")), h("button", { onclick: () => { pendingCharRef = c; $("#fileImg").click(); } }, has ? "差し替え" : "画像を入れる"))); });
  }
  side.append(h("p", { class: "note" }, `この画面で使った回数：声 ${usage.tts} 回・画像 ${usage.image} 回（1日の上限はプランで違います）`));
}

/* ============================================================
   ファイル入力
============================================================ */
let pendingImageScene = null, pendingCharRef = null, pendingVoiceScene = null;
async function readFile(f) { return new Uint8Array(await f.arrayBuffer()); }
$("#fileBgm").onchange = async e => { const f = e.target.files[0]; if (!f) return; try { await restoreAsset("bgm", { kind: "bgm", mime: f.type || "audio/mpeg", bytes: await readFile(f) }); delete SB.meta.bgm.synth; $("#bgmNow").textContent = bgmLabel(); DB.put("bgm_last", { kind: "bgm", mime: f.type, bytes: ASSETS.get("bgm").bytes }); status(`BGM を入れました（${ASSETS.get("bgm").buffer.duration.toFixed(0)} 秒・ループ再生）`, "ok"); } catch (er) { status("BGM を読めませんでした: " + er.message, "err"); } e.target.value = ""; };
$("#fileImg").onchange = async e => {
  const f = e.target.files[0]; if (!f) return; const bytes = await readFile(f); const key = "u_" + hash(f.name + f.size + Date.now());
  await restoreAsset(key, { kind: "image", mime: f.type || "image/png", bytes }); DB.put(key, { kind: "image", mime: f.type, bytes });
  snapshot();
  if (pendingCharRef) { pendingCharRef.refAsset = key; status(`${pendingCharRef.name} の参照画像を入れました`, "ok"); }
  else if (pendingImageScene) { pendingImageScene.image = pendingImageScene.image || {}; pendingImageScene.image.asset = key; status("画像を差し替えました", "ok"); }
  pendingCharRef = pendingImageScene = null; e.target.value = ""; rebuild();
};
$("#fileVoice").onchange = async e => { const f = e.target.files[0]; if (!f || !pendingVoiceScene) return; const key = "uv_" + hash(f.name + f.size + Date.now()); try { await restoreAsset(key, { kind: "voice", mime: f.type, bytes: await readFile(f) }); snapshot(); pendingVoiceScene.voiceAsset = key; status("音声を差し替えました", "ok"); rebuild(); } catch (er) { status("音声を読めませんでした: " + er.message, "err"); } pendingVoiceScene = null; e.target.value = ""; };

/* ============================================================
   保存・読込（素材ごと1つの .json に）
============================================================ */
function download(bytesOrBlob, name, type) { const blob = bytesOrBlob instanceof Blob ? bytesOrBlob : new Blob([bytesOrBlob], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
function fileBase() { const t = (SB.meta.title || "motion").replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40); const d = new Date(); const p = n => String(n).padStart(2, "0"); return `${t}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; }
function usedAssetKeys() { const ks = new Set(ASSETS.get("bgm") && ASSETS.get("bgm").mime !== "synth" ? ["bgm"] : []); SB.scenes.forEach(s => { ks.add(s.voiceAsset || voiceKey(s)); if (s.image) ks.add(s.image.asset || imageKey(s)); }); SB.characters.forEach(c => c.refAsset && ks.add(c.refAsset)); return [...ks].filter(k => ASSETS.get(k)); }
$("#btnSave").onclick = () => {
  const assets = {}; usedAssetKeys().forEach(k => { const a = ASSETS.get(k); assets[k] = { kind: a.kind, mime: a.mime, b64: bytesToB64(a.bytes) }; });
  download(JSON.stringify({ app: "motion-studio", version: 1, storyboard: SB, assets }), fileBase() + "_project.json", "application/json"); status("プロジェクトを保存しました（声・画像・BGM 込み）", "ok");
};
$("#btnLoad").onclick = () => $("#fileProj").click();
$("#btnPaste").onclick = () => { $("#pasteMsg").textContent = ""; openModal("#mPaste"); $("#pasteText").focus(); };
$("#pasteDo").onclick = () => {
  const j = parseStoryboard($("#pasteText").value);
  if (!j) { $("#pasteMsg").textContent = "台本データとして読めませんでした。{ から } までが全部入っているか確かめてください。"; $("#pasteMsg").style.color = "#ff8a8a"; return; }
  snapshot(); SB = j; normalize(); relinkAssets(); cur = 0; playhead = 0; syncTopControls(); closeModals(); rebuild(); restoreFromCache();
  status(`台本を読み込みました（${SB.scenes.length} シーン）。「声と画像を作る」を押してください`, "ok");
};
$("#fileProj").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text()); const assets = j.assets || {};
    for (const [k, a] of Object.entries(assets)) { const rec = { kind: a.kind, mime: a.mime, bytes: b64ToBytes(a.b64) }; await restoreAsset(k, rec); DB.put(k, rec); }
    // 台本が今の画面と同じ作品なら、台本はそのまま（Gemini が直した台本を優先）。素材だけ取り込む
    const replace = !SB.scenes.length || confirm("保存ファイルの台本で置き換えますか？\n［OK］置き換える　［キャンセル］今の台本のまま、声・画像・BGM だけ取り込む");
    if (replace && j.storyboard) { snapshot(); SB = j.storyboard; normalize(); }
    relinkAssets(); if (SB.meta.bgm.synth && (!ASSETS.get("bgm") || ASSETS.get("bgm").mime === "synth")) { ASSETS.delete("bgm"); await ensureSynthBgm().catch(() => { }); } rebuild(); status(`読み込みました（素材 ${Object.keys(assets).length} 件）`, "ok");
  } catch (er) { status("読み込めませんでした: " + er.message, "err"); }
  e.target.value = "";
};
// 台本の文が同じなら、前に作った声・画像を自動で使う（作り直しの回数を節約）
function relinkAssets() { SB.scenes.forEach(s => { if (s.voiceAsset && !ASSETS.get(s.voiceAsset)) s.voiceAsset = null; if (s.image && s.image.asset && !ASSETS.get(s.image.asset)) s.image.asset = null; }); }
async function restoreFromCache() {
  const keys = new Set(); SB.scenes.forEach(s => { keys.add(s.voiceAsset || voiceKey(s)); if (s.image) keys.add(s.image.asset || imageKey(s)); }); SB.characters.forEach(c => c.refAsset && keys.add(c.refAsset)); if (!SB.meta.bgm.synth) keys.add("bgm_last");
  let n = 0; for (const k of keys) { if (ASSETS.get(k)) continue; const rec = await DB.get(k); if (rec) { try { await restoreAsset(k === "bgm_last" ? "bgm" : k, rec); n++; } catch (e) { } } }
  relinkAssets(); try { await ensureSynthBgm(); } catch (e) { } if (n) { rebuild(); status(`前に作った素材を ${n} 件そのまま使います`, "ok"); }
}

/* ============================================================
   編集内容をコピー（Gemini のチャットへ渡す）
============================================================ */
$("#btnCopy").onclick = () => {
  const clean = JSON.parse(JSON.stringify(SB)); clean.scenes.forEach(s => { delete s.voiceAsset; if (s.image) delete s.image.asset; }); clean.characters.forEach(c => delete c.refAsset);
  $("#copyText").value = "【Motion Studio の現在の台本データ】\n以下は Canvas で手直しした最新の台本です。この内容を土台にして、文字・構成は勝手に戻さず、下に書く依頼だけを反映して storyboard を差し替えてください。\n```json\n" + JSON.stringify(clean, null, 1) + "\n```\n【直してほしいこと】\n";
  openModal("#mCopy");
};
$("#copyDo").onclick = async () => { const ta = $("#copyText"); try { await navigator.clipboard.writeText(ta.value); status("コピーしました。チャット欄に貼り付けてください", "ok"); } catch (e) { ta.select(); document.execCommand("copy"); status("コピーしました", "ok"); } };

/* ============================================================
   画面の文字を全て表示
============================================================ */
function textEntries() {
  const out = [];
  SB.scenes.forEach((s, i) => {
    Object.keys(s.texts || {}).forEach(k => out.push([i, "texts." + k]));
    ["items", "lines"].forEach(k => (s[k] || []).forEach((_, j) => out.push([i, `${k}.${j}`])));
    (s.cols || []).forEach((c, j) => { out.push([i, `cols.${j}.label`]); (c.items || []).forEach((_, m) => out.push([i, `cols.${j}.items.${m}`])); });
    (s.data || []).forEach((_, j) => out.push([i, `data.${j}.label`]));
    if (s.subtitle != null) out.push([i, "subtitle"]);
    if (s.notice) out.push([i, "notice"]);
  });
  return out;
}
$("#btnTexts").onclick = () => {
  const tb = $("#allTexts"); tb.innerHTML = "";
  textEntries().forEach(([i, p]) => { const ta = h("textarea", { rows: 1, "data-i": i, "data-p": p }); ta.value = getPath(SB.scenes[i], p) ?? ""; tb.append(h("tr", {}, h("td", {}, `${i + 1}. ${p}`), h("td", { style: "width:100%" }, ta))); });
  openModal("#mTexts");
};
$("#allTextsApply").onclick = () => { snapshot(); document.querySelectorAll("#allTexts textarea").forEach(ta => setPath(SB.scenes[+ta.dataset.i], ta.dataset.p, ta.value)); closeModals(); rebuild(); status("まとめて反映しました", "ok"); };
function openModal(id) { $(id).style.display = "flex"; }
function closeModals() { document.querySelectorAll(".modal").forEach(m => m.style.display = "none"); }
document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeModals);

/* ============================================================
   MP4 書き出し
   1) WebCodecs（速い・コマ落ちなし）→ 自前の MP4 組み立て
   2) 使えない環境では MediaRecorder（実時間で録画。mp4 か webm）
============================================================ */
let exportCancel = false;
let exportRunning = false;
$("#expCancel").onclick = () => { if (exportRunning) exportCancel = true; else closeModals(); };
function expProgress(p, msg) { $("#expBar").style.width = Math.round(p * 100) + "%"; if (msg) $("#expMsg").textContent = msg; }
async function renderMix(sr) {
  const len = Math.ceil(TL.total * sr); const off = new OfflineAudioContext(2, len, sr);
  scheduleAudio(off, off.destination, 0); return await off.startRendering();
}
async function pickVideoCodec(w, h, fps) {
  const br = (+($("#quality") && $("#quality").value) || 5) * 1e6;
  for (const codec of ["avc1.640028", "avc1.4d0028", "avc1.42e028", "avc1.42001f"]) {
    const cfg = { codec, width: w, height: h, bitrate: br, framerate: fps, avc: { format: "avc" }, latencyMode: "realtime" };
    try { const r = await VideoEncoder.isConfigSupported(cfg); if (r.supported) return cfg; } catch (e) { }
  }
  return null;
}
async function pickAudioCodec(sr) {
  for (const codec of ["mp4a.40.2", "opus"]) { const cfg = { codec, sampleRate: sr, numberOfChannels: 2, bitrate: 192000 }; try { const r = await AudioEncoder.isConfigSupported(cfg); if (r.supported) return cfg; } catch (e) { } }
  return null;
}
async function exportMP4() {
  if (playing) stop(); exportCancel = false; exportRunning = true; $("#expCancel").textContent = "中止"; openModal("#mExport"); $("#expTitle").textContent = "書き出し中"; expProgress(0, "準備しています…");
  const fps = SB.meta.fps || 30; const sr = 48000;
  try {
    const okWC = typeof VideoEncoder !== "undefined" && typeof AudioEncoder !== "undefined";
    const vcfg = okWC ? await pickVideoCodec(W, H, fps) : null; const acfg = okWC ? await pickAudioCodec(sr) : null;
    if (vcfg && acfg) { await exportWebCodecs(vcfg, acfg, fps, sr); }
    else { await exportRecorder(fps); }
  } catch (e) { console.error(e); $("#expTitle").textContent = "書き出しに失敗しました"; expProgress(0, e.message + "（もう一度押すと、録画方式で書き出します）"); window.__forceRecorder = true; return; }
  finally { exportRunning = false; $("#expCancel").textContent = "閉じる"; draw(); }
}
async function exportWebCodecs(vcfg, acfg, fps, sr) {
  if (window.__forceRecorder) { window.__forceRecorder = false; return exportRecorder(fps); }
  expProgress(0.01, "音を合成しています…");
  const mix = await renderMix(sr);
  const vChunks = [], aChunks = []; let avcC = null, asc = null, encErr = null;
  const ve = new VideoEncoder({ output: (ch, meta) => { const b = new Uint8Array(ch.byteLength); ch.copyTo(b); vChunks.push({ data: b, ts: ch.timestamp, dur: ch.duration, key: ch.type === "key" }); if (meta && meta.decoderConfig && meta.decoderConfig.description && !avcC) avcC = new Uint8Array(meta.decoderConfig.description.buffer ? meta.decoderConfig.description.buffer.slice(meta.decoderConfig.description.byteOffset || 0, (meta.decoderConfig.description.byteOffset || 0) + meta.decoderConfig.description.byteLength) : meta.decoderConfig.description); }, error: e => encErr = e });
  ve.configure(vcfg);
  const total = TL.total; const nFrames = Math.ceil(total * fps); const frameDur = 1e6 / fps;
  for (let f = 0; f < nFrames; f++) {
    if (exportCancel) { ve.close(); closeModals(); status("書き出しを中止しました"); return; }
    if (encErr) throw encErr;
    renderFrame(f / fps);
    const vf = new VideoFrame(cv, { timestamp: Math.round(f * frameDur), duration: Math.round(frameDur) });
    ve.encode(vf, { keyFrame: f % (fps * 2) === 0 }); vf.close();
    while (ve.encodeQueueSize > 6) await sleep(4);
    if (f % 10 === 0) { expProgress(0.05 + 0.85 * f / nFrames, `映像 ${Math.floor(f / fps)} / ${Math.ceil(total)} 秒`); await sleep(0); }
  }
  await ve.flush(); ve.close(); if (encErr) throw encErr;
  expProgress(0.92, "音を書き出しています…");
  const ae = new AudioEncoder({ output: (ch, meta) => { const b = new Uint8Array(ch.byteLength); ch.copyTo(b); aChunks.push({ data: b, ts: ch.timestamp, dur: ch.duration }); if (meta && meta.decoderConfig && meta.decoderConfig.description && !asc) { const d = meta.decoderConfig.description; asc = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset || 0, (d.byteOffset || 0) + d.byteLength) : d); } }, error: e => encErr = e });
  ae.configure(acfg);
  const L = mix.getChannelData(0), R = mix.getChannelData(1); const CH = 4800;
  for (let k = 0; k < L.length; k += CH) {
    const n = Math.min(CH, L.length - k); const buf = new Float32Array(n * 2); buf.set(L.subarray(k, k + n), 0); buf.set(R.subarray(k, k + n), n);
    const ad = new AudioData({ format: "f32-planar", sampleRate: sr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(k / sr * 1e6), data: buf }); ae.encode(ad); ad.close();
    while (ae.encodeQueueSize > 20) await sleep(2);
  }
  await ae.flush(); ae.close(); if (encErr) throw encErr;
  expProgress(0.97, "MP4 を組み立てています…");
  const mp4 = muxMP4({ width: W, height: H, fps, video: vChunks, avcC, audio: aChunks, audioCodec: acfg.codec, asc, sampleRate: sr, channels: 2 });
  download(new Blob([mp4], { type: "video/mp4" }), fileBase() + ".mp4");
  $("#expTitle").textContent = "書き出しました"; expProgress(1, `${(mp4.size / 1048576).toFixed(1)} MB の MP4 をダウンロードしました。`);
}
async function exportRecorder(fps) {
  expProgress(0, "この環境では録画方式で書き出します（動画と同じ時間がかかります）");
  const a = ac(); await a.resume(); const dest = a.createMediaStreamDestination();
  const stream = new MediaStream([...cv.captureStream(fps).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const types = ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
  const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)); if (!mime) throw new Error("このブラウザは書き出しに対応していません");
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6 }); const parts = []; rec.ondataavailable = e => e.data.size && parts.push(e.data);
  const done = new Promise(r => rec.onstop = r);
  playhead = 0; const nodes = scheduleAudio(a, dest, 0); const t0 = a.currentTime; rec.start(500);
  await new Promise(res => { const step = () => { if (exportCancel) { res(); return; } const t = a.currentTime - t0; if (t >= TL.total) { res(); return; } renderFrame(t); expProgress(t / TL.total, `録画中 ${fmtTime(t)} / ${fmtTime(TL.total)}（このタブを表示したままにしてください）`); requestAnimationFrame(step); }; step(); });
  nodes.forEach(n => { try { n.stop(); } catch (e) { } }); rec.stop(); await done;
  if (exportCancel) { closeModals(); status("書き出しを中止しました"); return; }
  const ext = mime.startsWith("video/mp4") ? "mp4" : "webm"; download(new Blob(parts, { type: mime.split(";")[0] }), fileBase() + "." + ext);
  $("#expTitle").textContent = "書き出しました"; expProgress(1, ext === "webm" ? "WebM で保存しました（YouTube にはそのままアップロードできます）" : "MP4 で保存しました");
}

/* ---------- 最小の MP4 組み立て（H.264 + AAC/Opus） ---------- */
function muxMP4(o) {
  const enc = new TextEncoder();
  const u32 = v => [v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255], u16 = v => [v >> 8 & 255, v & 255];
  const cat = arrs => { const n = arrs.reduce((a, b) => a + b.length, 0); const out = new Uint8Array(n); let p = 0; arrs.forEach(a => { out.set(a, p); p += a.length; }); return out; };
  const box = (type, ...payload) => { const body = cat(payload.map(p => p instanceof Uint8Array ? p : new Uint8Array(p))); return cat([new Uint8Array(u32(body.length + 8)), enc.encode(type), body]); };
  const full = (type, ver, flags, ...payload) => box(type, [ver, flags >> 16 & 255, flags >> 8 & 255, flags & 255], ...payload);
  const VTS = 90000; const mvts = 1000;
  const vid = o.video.slice().sort((a, b) => a.ts - b.ts), aud = o.audio.slice().sort((a, b) => a.ts - b.ts);
  const vDur = Math.round(VTS / o.fps);
  const aDurs = aud.map(c => Math.max(1, Math.round((c.dur || 0) * o.sampleRate / 1e6)) || (o.audioCodec === "opus" ? 960 : 1024));
  const vTotal = vid.length * vDur, aTotal = aDurs.reduce((a, b) => a + b, 0);
  const durMv = Math.max(Math.round(vTotal / VTS * mvts), Math.round(aTotal / o.sampleRate * mvts));
  const ftyp = box("ftyp", enc.encode("isom"), u32(512), enc.encode("isomiso2avc1mp41"));
  // mdat
  const mdatPayloadLen = vid.reduce((a, c) => a + c.data.length, 0) + aud.reduce((a, c) => a + c.data.length, 0);
  const mdatHeader = cat([new Uint8Array(u32(mdatPayloadLen + 8)), enc.encode("mdat")]);
  let off = ftyp.length + mdatHeader.length; const vOff = [], aOff = [];
  vid.forEach(c => { vOff.push(off); off += c.data.length; }); aud.forEach(c => { aOff.push(off); off += c.data.length; });
  const matrix = [...u32(0x10000), ...u32(0), ...u32(0), ...u32(0), ...u32(0x10000), ...u32(0), ...u32(0), ...u32(0), ...u32(0x40000000)];
  const mvhd = full("mvhd", 0, 0, u32(0), u32(0), u32(mvts), u32(durMv), u32(0x10000), u16(0x100), new Array(10).fill(0), matrix, new Array(24).fill(0), u32(3));
  const stts = (durs) => { const runs = []; durs.forEach(d => { const l = runs[runs.length - 1]; if (l && l[1] === d) l[0]++; else runs.push([1, d]); }); return full("stts", 0, 0, u32(runs.length), ...runs.map(r => [...u32(r[0]), ...u32(r[1])])); };
  const stsc = full("stsc", 0, 0, u32(1), u32(1), u32(1), u32(1));
  const stsz = cs => full("stsz", 0, 0, u32(0), u32(cs.length), ...cs.map(c => u32(c.data.length)));
  const stco = offs => full("stco", 0, 0, u32(offs.length), ...offs.map(u32));
  const dinf = box("dinf", full("dref", 0, 0, u32(1), full("url ", 0, 1)));
  const lang = u16(0x55c4);
  // 映像トラック
  const avc1 = box("avc1", new Array(6).fill(0), u16(1), new Array(16).fill(0), u16(o.width), u16(o.height), u32(0x480000), u32(0x480000), u32(0), u16(1), new Array(32).fill(0), u16(0x18), u16(0xffff), box("avcC", o.avcC || new Uint8Array(0)));
  const keyIdx = vid.map((c, k) => c.key ? k + 1 : 0).filter(Boolean);
  const vstbl = box("stbl", full("stsd", 0, 0, u32(1), avc1), stts(vid.map(() => vDur)), full("stss", 0, 0, u32(keyIdx.length), ...keyIdx.map(u32)), stsc, stsz(vid), stco(vOff));
  const vtrak = box("trak",
    full("tkhd", 0, 3, u32(0), u32(0), u32(1), u32(0), u32(Math.round(vTotal / VTS * mvts)), u32(0), u32(0), u16(0), u16(0), u16(0), u16(0), matrix, u32(o.width << 16), u32(o.height << 16)),
    box("mdia", full("mdhd", 0, 0, u32(0), u32(0), u32(VTS), u32(vTotal), lang, u16(0)), full("hdlr", 0, 0, u32(0), enc.encode("vide"), new Array(12).fill(0), enc.encode("VideoHandler\0")),
      box("minf", full("vmhd", 0, 1, new Array(8).fill(0)), dinf, vstbl)));
  // 音声トラック
  let entry;
  const audBase = [...new Array(6).fill(0), ...u16(1), ...new Array(8).fill(0), ...u16(o.channels), ...u16(16), ...u16(0), ...u16(0), ...u32(o.sampleRate << 16)];
  if (o.audioCodec === "opus") {
    entry = box("Opus", audBase, box("dOps", [0, o.channels], u16(312), u32(o.sampleRate), u16(0), [0]));
  } else {
    const ascB = o.asc && o.asc.length ? o.asc : new Uint8Array([0x11, 0x90]);
    const dsi = [5, ascB.length, ...ascB]; const dcd = [4, 13 + dsi.length, 0x40, 0x15, 0, 0, 0, ...u32(192000), ...u32(192000), ...dsi]; const sl = [6, 1, 2];
    const es = [3, 3 + dcd.length + sl.length, ...u16(1), 0, ...dcd, ...sl];
    entry = box("mp4a", audBase, full("esds", 0, 0, es));
  }
  const astbl = box("stbl", full("stsd", 0, 0, u32(1), entry), stts(aDurs), stsc, stsz(aud), stco(aOff));
  const atrak = box("trak",
    full("tkhd", 0, 3, u32(0), u32(0), u32(2), u32(0), u32(Math.round(aTotal / o.sampleRate * mvts)), u32(0), u32(0), u16(0), u16(1), u16(0x100), u16(0), matrix, u32(0), u32(0)),
    box("mdia", full("mdhd", 0, 0, u32(0), u32(0), u32(o.sampleRate), u32(aTotal), lang, u16(0)), full("hdlr", 0, 0, u32(0), enc.encode("soun"), new Array(12).fill(0), enc.encode("SoundHandler\0")),
      box("minf", full("smhd", 0, 0, u16(0), u16(0)), dinf, astbl)));
  const moov = box("moov", mvhd, vtrak, atrak);
  return new Blob([ftyp, mdatHeader, ...vid.map(c => c.data), ...aud.map(c => c.data), moov], { type: "video/mp4" });
}

/* ============================================================
   ボタン
============================================================ */
$("#btnPlay").onclick = () => playing ? stop() : play();
$("#btnGen").onclick = generateAll;
$("#btnBgm").onclick = openBgm;
$("#btnUndo").onclick = undo;
$("#btnExport").onclick = exportMP4;
$("#btnBig").onclick = () => { document.body.classList.toggle("big"); $("#btnBig").textContent = document.body.classList.contains("big") ? "元に戻す" : "大きく表示"; setTimeout(fitStage, 0); };
$("#seek").oninput = e => { if (playing) stop(); playhead = TL.total * e.target.value / 1000; const sc = sceneAt(playhead); if (sc.i !== cur) { cur = sc.i; renderSceneButtons(); renderSide(); } draw(); };
function syncTopControls() { $("#bgmVol").value = SB.meta.bgm.volume; const sel = $("#voiceSel"); if (![...sel.options].some(o => o.value === SB.meta.voice.name)) sel.prepend(h("option", { value: SB.meta.voice.name }, "声: " + SB.meta.voice.name)); sel.value = SB.meta.voice.name; }
const bv = $("#bgmVol"); bv.value = SB.meta.bgm.volume; bv.oninput = () => { SB.meta.bgm.volume = +bv.value; if (playing) { stop(); play(); } };
const vs = $("#voiceSel"); VOICES.forEach(v => { const o = h("option", { value: v }, "声: " + v); if (v === SB.meta.voice.name) o.selected = true; vs.append(o); });
if (!VOICES.includes(SB.meta.voice.name)) vs.prepend(h("option", { value: SB.meta.voice.name, selected: "selected" }, "声: " + SB.meta.voice.name));
vs.onchange = () => { snapshot(); SB.meta.voice.name = vs.value; SB.scenes.forEach(s => s.voiceAsset = null); rebuild(); status("声を変えました。「声と画像を作る」で作り直してください"); };
document.addEventListener("keydown", e => { if (e.target.matches("input,textarea,select")) return; if (e.code === "Space") { e.preventDefault(); playing ? stop() : play(); } if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); } });

rebuild();
restoreFromCache();
(document.fonts && document.fonts.ready || Promise.resolve()).then(() => draw());
status("準備できました。「声と画像を作る」を押してください");
if (NEED_PASTE) { openModal("#mPaste"); status("台本データがありません。「台本を貼る」から貼り付けてください", "err"); }
