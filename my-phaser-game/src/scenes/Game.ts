import { Scene } from 'phaser';
import { TetrisGame } from '../tetris/TetrisGame';
import { TetrisAudio } from '../tetris/TetrisAudio';

export class Game extends Scene
{
    private tetrisGame: TetrisGame;
    private titleText: Phaser.GameObjects.Text;
    private sunGraphics: Phaser.GameObjects.Graphics;
    private gridGraphics: Phaser.GameObjects.Graphics;
    private mountainsGraphics: Phaser.GameObjects.Graphics;

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        // サウンドファイルのロード
        this.load.audio('move', 'assets/sounds/move.mp3');
        this.load.audio('rotate', 'assets/sounds/rotate.mp3');
        this.load.audio('drop', 'assets/sounds/drop.mp3');
        this.load.audio('line_clear', 'assets/sounds/line_clear.mp3');
        this.load.audio('level_up', 'assets/sounds/level_up.mp3');
        this.load.audio('game_over', 'assets/sounds/game_over.mp3');
    }

    create ()
    {
        // RETROWAVEスタイルの背景を作成
        this.createRetrowaveBackground();

        // タイトルロゴ（洗練されたデザイン）
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x0066cc, 0.8);
        titleBg.fillRoundedRect(412, 70, 200, 60, 10);
        
        // 光沢効果
        const titleGloss = this.add.graphics();
        titleGloss.fillStyle(0xffffff, 0.2);
        titleGloss.fillRoundedRect(417, 75, 190, 20, 8);
        
        // 枠線
        const titleBorder = this.add.graphics();
        titleBorder.lineStyle(3, 0x003366, 1);
        titleBorder.strokeRoundedRect(412, 70, 200, 60, 10);
        
        // テキスト
        this.titleText = this.add.text(512, 100, 'テトーリス', {
            fontFamily: 'Impact, Arial Black',
            fontSize: 36,
            color: '#ffffff',
            stroke: '#003366',
            strokeThickness: 4,
            align: 'center'
        });
        this.titleText.setOrigin(0.5);
        
        // サブタイトル
        const subtitle = this.add.text(512, 130, 'with コロブチカ', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffff00',
            stroke: '#003366',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
        
        // テキストの影
        const titleShadow = this.add.text(514, 102, 'テトーリス', {
            fontFamily: 'Impact, Arial Black',
            fontSize: 36,
            color: '#003366',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.5);
        titleShadow.setDepth(-1);

        // テトリスゲームの作成
        this.tetrisGame = new TetrisGame(this, 362, 150);

        // ESCキーでメインメニューに戻る
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                this.scene.start('MainMenu');
            });
        }
    }

    update (time: number, delta: number)
    {
        // テトリスゲームの更新
        this.tetrisGame.update(time);
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
