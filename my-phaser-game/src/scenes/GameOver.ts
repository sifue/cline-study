import { Scene } from 'phaser';

export class GameOver extends Scene
{
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;
    private gameOverText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private restartButton: Phaser.GameObjects.Text;
    private menuButton: Phaser.GameObjects.Text;
    private score: number = 0;

    constructor ()
    {
        super('GameOver');
    }

    init (data: { score?: number })
    {
        // スコアを受け取る
        this.score = data.score || 0;
    }

    create ()
    {
        // カメラ設定
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // 背景
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);

        // ゲームオーバーテキスト
        this.gameOverText = this.add.text(512, 200, 'ゲームオーバー', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);

        // スコアテキスト
        this.scoreText = this.add.text(512, 300, `消去した行数: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        this.scoreText.setOrigin(0.5);

        // リスタートボタン
        this.restartButton = this.add.text(512, 400, 'もう一度プレイ', {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        this.restartButton.setOrigin(0.5);
        this.restartButton.setInteractive({ useHandCursor: true });
        
        // ホバー効果
        this.restartButton.on('pointerover', () => {
            this.restartButton.setStyle({ color: '#ffff00' });
        });
        
        this.restartButton.on('pointerout', () => {
            this.restartButton.setStyle({ color: '#ffffff' });
        });
        
        // クリック時の処理
        this.restartButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        // メニューボタン
        this.menuButton = this.add.text(512, 470, 'メインメニューに戻る', {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        this.menuButton.setOrigin(0.5);
        this.menuButton.setInteractive({ useHandCursor: true });
        
        // ホバー効果
        this.menuButton.on('pointerover', () => {
            this.menuButton.setStyle({ color: '#ffff00' });
        });
        
        this.menuButton.on('pointerout', () => {
            this.menuButton.setStyle({ color: '#ffffff' });
        });
        
        // クリック時の処理
        this.menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
