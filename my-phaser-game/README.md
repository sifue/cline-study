# Phaser Tetris

Phaser.jsを使用して作成したテトリスゲームです。HTML5とTypeScriptで実装されており、GitHub Pagesなどの静的ホスティングサービスで簡単に公開できます。

![テトリスゲーム](screenshot.png)

## 遊び方

1. タイトル画面で任意のキーを押すか、「ゲームスタート」ボタンをクリックするとゲームが始まります。
2. 以下のキーを使ってテトリミノを操作します：
   - **←→**: 左右に移動
   - **↓**: 下に落下
   - **Z**: 左回転
   - **X**: 右回転
   - **R**: リセット（いつでもゲームをリスタートできます）
   - **ESC**: メインメニューに戻る
3. ラインを揃えると消去され、スコアが加算されます。
4. ブロックが画面上部に積み上がるとゲームオーバーです。

## 仕様

- 標準的な10x20のマス目
- 7種類の標準的なテトリミノ（I, O, T, S, Z, J, L）
- 各テトリミノは標準的な色で表示
- ラインが消える際の視覚的なエフェクトとサウンド
- キュートでポップなデザイン
- 消した列数のカウント機能
- ゲームオーバー表示とリスタート機能

## 開発環境

- Node.js
- TypeScript
- Phaser 3
- Vite (ビルドツール)

## ローカルでの実行方法

1. リポジトリをクローンします：
   ```
   git clone https://github.com/yourusername/phaser-tetris.git
   cd phaser-tetris
   ```

2. 依存関係をインストールします：
   ```
   npm install
   ```

3. 開発サーバーを起動します：
   ```
   npm run dev
   ```

4. ブラウザで http://localhost:8080 にアクセスしてゲームをプレイします。

## ビルド方法

本番環境用にビルドするには以下のコマンドを実行します：

```
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## GitHub Pagesへの公開方法

1. リポジトリをGitHubにプッシュします：
   ```
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. GitHub Pagesの設定を行います：
   - GitHubのリポジトリページに移動します
   - 「Settings」タブをクリックします
   - 左側のメニューから「Pages」を選択します
   - 「Source」セクションで「Deploy from a branch」を選択します
   - ブランチを「main」に、フォルダを「/(root)」または「/docs」に設定します
     - `/docs` を使用する場合は、vite.config.jsの出力先を `docs` に変更する必要があります
   - 「Save」をクリックします

3. vite.config.jsの設定：
   - GitHub Pagesでサブディレクトリにデプロイする場合は、baseパスを設定する必要があります
   - vite.config.jsを以下のように編集します：

```javascript
// vite.config.js
export default {
  base: '/phaser-tetris/', // リポジトリ名を指定
  // その他の設定...
}
```

4. ビルドして公開：
   ```
   npm run build
   git add dist
   git commit -m "Add dist for GitHub Pages"
   git push origin main
   ```

5. GitHub Actionsを使用する場合：
   - `.github/workflows/deploy.yml` ファイルを作成して自動デプロイを設定することもできます

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。
