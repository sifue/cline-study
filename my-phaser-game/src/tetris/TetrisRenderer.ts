/**
 * テトリスゲームのレンダリングを行うクラス
 */
import { Scene, GameObjects } from 'phaser';
import { Board } from './Board';
import { Tetromino } from './Tetromino';

export class TetrisRenderer {
  private scene: Scene;
  private board: Board;
  
  // ブロックのサイズ
  private blockSize: number = 30;
  
  // ボードの位置
  private boardX: number;
  private boardY: number;
  
  // グラフィックスオブジェクト
  private boardGraphics: GameObjects.Graphics;
  private gridGraphics: GameObjects.Graphics;
  private tetrominoGraphics: GameObjects.Graphics;
  private nextTetrominoGraphics: GameObjects.Graphics;
  
  // ブロック画像を管理するためのコンテナ
  private boardBlocks: GameObjects.Container;
  private tetrominoBlocks: GameObjects.Container;
  private nextTetrominoBlocks: GameObjects.Container;
  
  // テキストオブジェクト
  private linesText: GameObjects.Text;
  private nextText: GameObjects.Text;
  private gameOverText: GameObjects.Text;
  private instructionsText: GameObjects.Text;
  
  constructor(scene: Scene, board: Board, x: number, y: number) {
    this.scene = scene;
    this.board = board;
    this.boardX = x;
    this.boardY = y;
    
    // グラフィックスオブジェクトの作成
    this.boardGraphics = this.scene.add.graphics();
    this.gridGraphics = this.scene.add.graphics();
    this.tetrominoGraphics = this.scene.add.graphics();
    this.nextTetrominoGraphics = this.scene.add.graphics();
    
    // ブロックコンテナの作成
    this.boardBlocks = this.scene.add.container(0, 0);
    this.tetrominoBlocks = this.scene.add.container(0, 0);
    this.nextTetrominoBlocks = this.scene.add.container(0, 0);
    
    // テキストオブジェクトの作成
    this.linesText = this.scene.add.text(
      this.boardX + this.board.width * this.blockSize + 20,
      this.boardY,
      'Lines: 0',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    this.nextText = this.scene.add.text(
      this.boardX + this.board.width * this.blockSize + 20,
      this.boardY + 60,
      'Next:',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    this.gameOverText = this.scene.add.text(
      this.boardX + this.board.width * this.blockSize / 2,
      this.boardY + this.board.height * this.blockSize / 2,
      'GAME OVER\nPress R to restart',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    
    this.instructionsText = this.scene.add.text(
      this.boardX + this.board.width * this.blockSize + 20,
      this.boardY + 200,
      '操作方法:\n\n←→: 移動\n↓: 落下\nZ: 左回転\nX: 右回転\nR: リセット',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    
    // 初期描画
    this.drawBoard();
    this.drawGrid();
  }
  
  /**
   * 描画を更新する
   */
  update(): void {
    // 古いブロックを削除
    this.boardBlocks.removeAll(true);
    this.tetrominoBlocks.removeAll(true);
    this.nextTetrominoBlocks.removeAll(true);
    
    this.drawBoard();
    this.drawTetromino();
    this.drawNextTetromino();
    this.updateTexts();
    
    // ゲームオーバー表示
    this.gameOverText.setVisible(this.board.isGameOver());
  }
  
  /**
   * ボードを描画する
   */
  private drawBoard(): void {
    this.boardGraphics.clear();
    
    // ボードの背景
    this.boardGraphics.fillStyle(0x000000, 0.8);
    this.boardGraphics.fillRect(
      this.boardX,
      this.boardY,
      this.board.width * this.blockSize,
      this.board.height * this.blockSize
    );
    
    // 固定されたブロックを描画
    const grid = this.board.getGrid();
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        if (grid[y][x] !== 0) {
          this.drawBlock(
            this.boardGraphics,
            this.boardX + x * this.blockSize,
            this.boardY + y * this.blockSize,
            grid[y][x]
          );
        }
      }
    }
  }
  
  /**
   * グリッドを描画する
   */
  private drawGrid(): void {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    // 縦線
    for (let x = 0; x <= this.board.width; x++) {
      this.gridGraphics.beginPath();
      this.gridGraphics.moveTo(this.boardX + x * this.blockSize, this.boardY);
      this.gridGraphics.lineTo(
        this.boardX + x * this.blockSize,
        this.boardY + this.board.height * this.blockSize
      );
      this.gridGraphics.closePath();
      this.gridGraphics.strokePath();
    }
    
    // 横線
    for (let y = 0; y <= this.board.height; y++) {
      this.gridGraphics.beginPath();
      this.gridGraphics.moveTo(this.boardX, this.boardY + y * this.blockSize);
      this.gridGraphics.lineTo(
        this.boardX + this.board.width * this.blockSize,
        this.boardY + y * this.blockSize
      );
      this.gridGraphics.closePath();
      this.gridGraphics.strokePath();
    }
  }
  
  /**
   * 現在のテトリミノを描画する
   */
  private drawTetromino(): void {
    this.tetrominoGraphics.clear();
    
    const tetromino = this.board.getCurrentTetromino();
    if (!tetromino) return;
    
    const shape = tetromino.shape;
    const posX = tetromino.x;
    const posY = tetromino.y;
    const color = tetromino.color;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          this.drawBlock(
            this.tetrominoGraphics,
            this.boardX + (posX + x) * this.blockSize,
            this.boardY + (posY + y) * this.blockSize,
            color
          );
        }
      }
    }
  }
  
  /**
   * 次のテトリミノを描画する
   */
  private drawNextTetromino(): void {
    this.nextTetrominoGraphics.clear();
    
    const nextTetromino = this.board.getNextTetromino();
    if (!nextTetromino) return;
    
    const shape = nextTetromino.shape;
    const color = nextTetromino.color;
    
    // 次のテトリミノの表示位置
    const nextX = this.boardX + this.board.width * this.blockSize + 50;
    const nextY = this.boardY + 100;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          this.drawBlock(
            this.nextTetrominoGraphics,
            nextX + x * this.blockSize,
            nextY + y * this.blockSize,
            color
          );
        }
      }
    }
  }
  
  /**
   * ブロックを描画する
   */
  private drawBlock(
    graphics: GameObjects.Graphics,
    x: number,
    y: number,
    color: number
  ): void {
    // ブロックの背景
    const blockBg = this.scene.add.graphics();
    blockBg.fillStyle(color, 1);
    blockBg.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
    
    // ハイライト（左上）
    const highlight = this.scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.5);
    highlight.fillRect(x + 1, y + 1, this.blockSize - 2, 5);
    highlight.fillRect(x + 1, y + 1, 5, this.blockSize - 2);
    
    // シャドウ（右下）
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRect(x + this.blockSize - 6, y + 1, 5, this.blockSize - 2);
    shadow.fillRect(x + 1, y + this.blockSize - 6, this.blockSize - 2, 5);
    
    // 光沢効果
    const gloss = this.scene.add.graphics();
    gloss.fillStyle(0xffffff, 0.2);
    gloss.fillRect(x + 6, y + 6, this.blockSize - 12, this.blockSize - 12);
    
    // 適切なコンテナに追加
    if (graphics === this.boardGraphics) {
      this.boardBlocks.add(blockBg);
      this.boardBlocks.add(highlight);
      this.boardBlocks.add(shadow);
      this.boardBlocks.add(gloss);
    } else if (graphics === this.tetrominoGraphics) {
      this.tetrominoBlocks.add(blockBg);
      this.tetrominoBlocks.add(highlight);
      this.tetrominoBlocks.add(shadow);
      this.tetrominoBlocks.add(gloss);
    } else if (graphics === this.nextTetrominoGraphics) {
      this.nextTetrominoBlocks.add(blockBg);
      this.nextTetrominoBlocks.add(highlight);
      this.nextTetrominoBlocks.add(shadow);
      this.nextTetrominoBlocks.add(gloss);
    }
    
    // グリッド線を描画
    graphics.lineStyle(1, 0x000000, 0.5);
    graphics.strokeRect(x, y, this.blockSize, this.blockSize);
  }
  
  /**
   * テキストを更新する
   */
  private updateTexts(): void {
    this.linesText.setText(`Lines: ${this.board.getClearedLines()}`);
  }
  
  /**
   * ラインクリア時のエフェクトを表示する
   */
  showLineClearEffect(lineIndices: number[]): void {
    // ラインクリアエフェクト用のグラフィックス
    const effectGraphics = this.scene.add.graphics();
    
    // クリアした行を白く光らせる
    effectGraphics.fillStyle(0xffffff, 0.8);
    for (const lineIndex of lineIndices) {
      effectGraphics.fillRect(
        this.boardX,
        this.boardY + lineIndex * this.blockSize,
        this.board.width * this.blockSize,
        this.blockSize
      );
    }
    
    // 光るパーティクルエフェクト
    for (const lineIndex of lineIndices) {
      for (let i = 0; i < 20; i++) {
        const x = this.boardX + Math.random() * this.board.width * this.blockSize;
        const y = this.boardY + lineIndex * this.blockSize + this.blockSize / 2;
        
        // 星型のパーティクル
        const particle = this.scene.add.star(
          x, y,
          5, // 5つの頂点
          4, // 内側の半径
          8, // 外側の半径
          0xffff00, // 黄色
          1 // アルファ値
        );
        
        // パーティクルのアニメーション
        this.scene.tweens.add({
          targets: particle,
          x: x + (Math.random() * 60 - 30),
          y: y + (Math.random() * 60 - 30),
          scale: { from: 0.5, to: 0 },
          alpha: { from: 1, to: 0 },
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
    
    // 行が消える前に点滅エフェクト
    let flashCount = 0;
    const flashInterval = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        flashCount++;
        effectGraphics.clear();
        
        if (flashCount % 2 === 0) {
          effectGraphics.fillStyle(0xffffff, 0.8);
          for (const lineIndex of lineIndices) {
            effectGraphics.fillRect(
              this.boardX,
              this.boardY + lineIndex * this.blockSize,
              this.board.width * this.blockSize,
              this.blockSize
            );
          }
        }
        
        if (flashCount >= 6) {
          flashInterval.destroy();
          effectGraphics.destroy();
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // コンソールにログを出力（デバッグ用）
    console.log('Line clear effect shown for lines:', lineIndices);
  }
  
  /**
   * テトリミノが地面に付いた瞬間のエフェクトを表示する
   */
  showDropEffect(tetromino: Tetromino | null): void {
    if (!tetromino) return;
    
    // コンソールにログを出力（デバッグ用）
    console.log('Drop effect shown for tetromino at position:', tetromino.x, tetromino.y);
    
    const shape = tetromino.shape;
    const posX = tetromino.x;
    const posY = tetromino.y;
    
    // 衝撃波エフェクト
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const blockX = this.boardX + (posX + x) * this.blockSize + this.blockSize / 2;
          const blockY = this.boardY + (posY + y) * this.blockSize + this.blockSize / 2;
          
          // 衝撃波の円
          const shockwave = this.scene.add.circle(
            blockX,
            blockY,
            this.blockSize / 2,
            0xffffff,
            0.5
          );
          
          // 衝撃波のアニメーション
          this.scene.tweens.add({
            targets: shockwave,
            scale: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              shockwave.destroy();
            }
          });
          
          // 小さな粒子
          for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.blockSize / 2;
            const particleX = blockX + Math.cos(angle) * distance;
            const particleY = blockY + Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(
              particleX,
              particleY,
              2,
              0xffffff,
              1
            );
            
            // 粒子のアニメーション
            this.scene.tweens.add({
              targets: particle,
              x: particleX + Math.cos(angle) * this.blockSize,
              y: particleY + Math.sin(angle) * this.blockSize,
              alpha: 0,
              duration: 500,
              ease: 'Power2',
              onComplete: () => {
                particle.destroy();
              }
            });
          }
        }
      }
    }
  }
  
  /**
   * ゲームオーバー時のエフェクトを表示する
   */
  showGameOverEffect(): void {
    // ゲームオーバーエフェクト用のグラフィックス
    const effectGraphics = this.scene.add.graphics();
    
    // 画面全体を赤く点滅させる
    effectGraphics.fillStyle(0xff0000, 0.5);
    effectGraphics.fillRect(
      this.boardX,
      this.boardY,
      this.board.width * this.blockSize,
      this.board.height * this.blockSize
    );
    
    // エフェクトのアニメーション
    this.scene.tweens.add({
      targets: effectGraphics,
      alpha: 0,
      duration: 1000,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        effectGraphics.destroy();
      }
    });
    
    // 爆発エフェクト
    const centerX = this.boardX + this.board.width * this.blockSize / 2;
    const centerY = this.boardY + this.board.height * this.blockSize / 2;
    
    // 大きな爆発
    const explosion = this.scene.add.circle(
      centerX,
      centerY,
      10,
      0xff0000,
      1
    );
    
    // 爆発のアニメーション
    this.scene.tweens.add({
      targets: explosion,
      scale: 20,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // 破片のパーティクル
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * this.blockSize * 5;
      const particleX = centerX;
      const particleY = centerY;
      
      const particle = this.scene.add.rectangle(
        particleX,
        particleY,
        Math.random() * 10 + 5,
        Math.random() * 10 + 5,
        0xff0000,
        1
      );
      
      // 粒子のアニメーション
      this.scene.tweens.add({
        targets: particle,
        x: particleX + Math.cos(angle) * distance,
        y: particleY + Math.sin(angle) * distance,
        angle: Math.random() * 360,
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}
