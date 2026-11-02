# motion-studio-engine

Gemini アプリ（gemini.google.com）の Canvas で動く、モーショングラフィックス動画の編集アプリの本体です。
Gemini のスキル「Motion Studio」が作る短い HTML から、jsDelivr 経由で読み込まれます。

- 台本データ（JSON）から 13 種類のシーンをアニメーションで描画（16:9 / 9:16）
- Canvas 内の Gemini API でナレーション（TTS）と挿入画像を生成
- 画面の文字をクリックして修正、1 つ前に戻す、プロジェクトの保存・読込
- WebCodecs で MP4（H.264 + AAC/Opus）に書き出し。使えない環境では MediaRecorder で録画

## 読み込み方

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JunSuzuki1973/motion-studio-engine@1/studio.css">
<script type="application/json" id="storyboard">{ "meta": {...}, "scenes": [...] }</script>
<script>const apiKey = "";</script>
<script src="https://cdn.jsdelivr.net/gh/JunSuzuki1973/motion-studio-engine@1/studio.js"></script>
```

`@1` は v1.x.x のタグのうち最新を指します。

## 開発

このリポジトリのファイルは生成物です。元ファイルと台本の仕様は非公開の開発リポジトリにあり、`scripts/build_engine.py` で作っています。直接編集しないでください。
