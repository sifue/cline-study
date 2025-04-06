import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene so we can display it here
        this.add.image(512, 384, 'background');

        // ロード中のテキスト
        const loadingText = this.add.text(512, 320, 'ロード中...', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game
        this.load.setPath('assets');

        // 画像
        this.load.image('logo', 'logo.png');
        // ブロック画像は一時的にロゴ画像で代用
        this.load.image('block', 'logo.png');
        
        // サウンド
        this.load.audio('move', 'sounds/move.mp3');
        this.load.audio('rotate', 'sounds/rotate.mp3');
        this.load.audio('drop', 'sounds/drop.mp3');
        this.load.audio('line_clear', 'sounds/line_clear.mp3');
        this.load.audio('level_up', 'sounds/level_up.mp3');
        this.load.audio('game_over', 'sounds/game_over.mp3');
        
        // ダミーのサウンドファイルを作成（実際のファイルがない場合）
        this.createDummySounds();
    }

    create ()
    {
        //  When all the assets have loaded it's often worth creating global objects here that the rest of the game can use.
        //  For example you can define global animations here so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition such as a camera fade.
        this.scene.start('MainMenu');
    }
    
    /**
     * ダミーのサウンドファイルを作成する（実際のファイルがない場合）
     */
    private createDummySounds(): void {
        // サウンドファイルのパス
        const soundPaths = [
            'sounds/move.mp3',
            'sounds/rotate.mp3',
            'sounds/drop.mp3',
            'sounds/line_clear.mp3',
            'sounds/level_up.mp3',
            'sounds/game_over.mp3'
        ];
        
        // サウンドファイルが存在しない場合、ダミーのサウンドを作成
        for (const path of soundPaths) {
            this.cache.audio.get(path.split('/').pop()?.split('.')[0] || '');
        }
    }
}
