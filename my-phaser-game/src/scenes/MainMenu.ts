import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    private background: GameObjects.Image;
    private title: GameObjects.Text;
    private startButton: GameObjects.Text;
    private instructionsText: GameObjects.Text;
    private sunGraphics: GameObjects.Graphics;
    private gridGraphics: GameObjects.Graphics;
    private mountainsGraphics: GameObjects.Graphics;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // RETROWAVEスタイルの背景を作成
        this.createRetrowaveBackground();

        // タイトルロゴ（洗練されたデザイン）
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x0066cc, 1);
        titleBg.fillRoundedRect(312, 150, 400, 100, 16);
        
        // 光沢効果
        const titleGloss = this.add.graphics();
        titleGloss.fillStyle(0xffffff, 0.2);
        titleGloss.fillRoundedRect(322, 160, 380, 40, 12);
        
        // 枠線
        const titleBorder = this.add.graphics();
        titleBorder.lineStyle(4, 0x003366, 1);
        titleBorder.strokeRoundedRect(312, 150, 400, 100, 16);
        
        // テキスト
        this.title = this.add.text(512, 200, 'テトーリス', {
            fontFamily: 'Impact, Arial Black',
            fontSize: 72,
            color: '#ffffff',
            stroke: '#003366',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // サブタイトル
        const subtitle = this.add.text(512, 260, 'with コロブチカ', {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#003366',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // テキストの影
        const titleShadow = this.add.text(516, 204, 'テトーリス', {
            fontFamily: 'Impact, Arial Black',
            fontSize: 72,
            color: '#003366',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.5);
        titleShadow.setDepth(-1);

        // スタートボタン
        this.startButton = this.add.text(512, 400, 'ゲームスタート', {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // ボタンのインタラクティブ設定
        this.startButton.setInteractive({ useHandCursor: true });
        
        // ホバー効果
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ color: '#ffff00' });
        });
        
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ color: '#ffffff' });
        });
        
        // クリック時の処理
        this.startButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        
        // キー入力でもゲーム開始
        this.input.keyboard?.on('keydown', () => {
            this.scene.start('Game');
        });

        // 操作説明
        this.instructionsText = this.add.text(512, 500, '操作方法:\n←→: 移動  ↓: 落下\nZ: 左回転  X: 右回転\nR: リセット  ESC: メニューに戻る\nM: サウンドオンオフ  B: BGMオンオフ', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        // 音声警告
        const soundWarning = this.add.text(512, 600, '⚠️ 注意: このゲームは音が鳴ります ⚠️', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // 警告テキストを点滅させる
        this.tweens.add({
            targets: soundWarning,
            alpha: 0.3,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 夕日色のグラデーション背景を作成する
     */
    private createRetrowaveBackground(): void {
        // 背景色（グラデーション）
        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(
            0x000033, // 上部の色（濃い青）
            0x000033, // 上部の色（濃い青）
            0xff3366, // 下部の色（ピンク）
            0xff3366, // 下部の色（ピンク）
            1
        );
        bgGradient.fillRect(0, 0, 1024, 768);
        bgGradient.setDepth(-10);
        
        // 背景全体のアニメーション
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 10000,
            repeat: -1,
            onUpdate: (tween) => {
                // 背景色のグラデーションを変化させる
                const value = tween.getValue();
                const hue1 = (value * 30 + 210) % 360; // 青系の色相
                const hue2 = (value * 30 + 330) % 360; // 赤系の色相
                
                // HSVからRGBに変換
                const color1 = Phaser.Display.Color.HSVToRGB(hue1 / 360, 0.8, 0.2);
                const color2 = Phaser.Display.Color.HSVToRGB(hue2 / 360, 0.8, 0.4);
                
                // 背景を再描画
                bgGradient.clear();
                bgGradient.fillGradientStyle(
                    color1.color, // 上部の色
                    color1.color, // 上部の色
                    color2.color, // 下部の色
                    color2.color, // 下部の色
                    1
                );
                bgGradient.fillRect(0, 0, 1024, 768);
            }
        });
    }
}
