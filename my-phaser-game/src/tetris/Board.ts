/**
 * テトリスのゲームボードを管理するクラス
 */
import { Tetromino } from './Tetromino';

export class Board {
  // ボードのサイズ
  public readonly width: number = 10;
  public readonly height: number = 20;

  // ボードの状態（0: 空, 非0: ブロックの色）
  private grid: number[][];

  // 現在のテトリミノ
  private currentTetromino: Tetromino | null = null;

  // 次のテトリミノ
  private nextTetromino: Tetromino | null = null;

  // 消去した行数
  private clearedLines: number = 0;

  // ゲームオーバーフラグ
  private gameOver: boolean = false;

  // ラインクリア時のコールバック
  private onLineClear: ((lines: number) => void) | null = null;

  // ゲームオーバー時のコールバック
  private onGameOver: (() => void) | null = null;

  constructor() {
    // ボードの初期化
    this.grid = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
    
    // 最初のテトリミノを生成
    this.generateNewTetromino();
  }

  /**
   * ボードの状態を取得する
   */
  getGrid(): number[][] {
    return this.grid;
  }

  /**
   * 現在のテトリミノを取得する
   */
  getCurrentTetromino(): Tetromino | null {
    return this.currentTetromino;
  }

  /**
   * 次のテトリミノを取得する
   */
  getNextTetromino(): Tetromino | null {
    return this.nextTetromino;
  }

  /**
   * 消去した行数を取得する
   */
  getClearedLines(): number {
    return this.clearedLines;
  }

  /**
   * ゲームオーバーかどうかを取得する
   */
  isGameOver(): boolean {
    return this.gameOver;
  }

  /**
   * ラインクリア時のコールバックを設定する
   */
  setOnLineClear(callback: (lines: number) => void): void {
    this.onLineClear = callback;
  }

  /**
   * ゲームオーバー時のコールバックを設定する
   */
  setOnGameOver(callback: () => void): void {
    this.onGameOver = callback;
  }

  /**
   * 新しいテトリミノを生成する
   */
  private generateNewTetromino(): void {
    // 現在のテトリミノを次のテトリミノに設定
    if (this.nextTetromino) {
      this.currentTetromino = this.nextTetromino;
      this.currentTetromino.x = Math.floor(this.width / 2) - Math.floor(this.currentTetromino.shape[0].length / 2);
      this.currentTetromino.y = 0;
    } else {
      // 最初のテトリミノを生成
      this.currentTetromino = Tetromino.getRandomTetromino(
        Math.floor(this.width / 2) - 1,
        0
      );
    }

    // 次のテトリミノを生成
    this.nextTetromino = Tetromino.getRandomTetromino(0, 0);

    // 衝突チェック（ゲームオーバー判定）
    if (this.checkCollision()) {
      this.gameOver = true;
      if (this.onGameOver) {
        this.onGameOver();
      }
    }
  }

  /**
   * テトリミノを左に移動する
   */
  moveLeft(): boolean {
    if (!this.currentTetromino || this.gameOver) return false;

    this.currentTetromino.x--;
    if (this.checkCollision()) {
      this.currentTetromino.x++;
      return false;
    }
    return true;
  }

  /**
   * テトリミノを右に移動する
   */
  moveRight(): boolean {
    if (!this.currentTetromino || this.gameOver) return false;

    this.currentTetromino.x++;
    if (this.checkCollision()) {
      this.currentTetromino.x--;
      return false;
    }
    return true;
  }

  /**
   * テトリミノを下に移動する
   */
  moveDown(): boolean {
    if (!this.currentTetromino || this.gameOver) return false;

    this.currentTetromino.y++;
    if (this.checkCollision()) {
      this.currentTetromino.y--;
      this.lockTetromino();
      return false;
    }
    return true;
  }

  /**
   * テトリミノを左に回転する
   */
  rotateLeft(): boolean {
    if (!this.currentTetromino || this.gameOver) return false;

    this.currentTetromino.rotateLeft();
    if (this.checkCollision()) {
      this.currentTetromino.rotateRight(); // 元に戻す
      return false;
    }
    return true;
  }

  /**
   * テトリミノを右に回転する
   */
  rotateRight(): boolean {
    if (!this.currentTetromino || this.gameOver) return false;

    this.currentTetromino.rotateRight();
    if (this.checkCollision()) {
      this.currentTetromino.rotateLeft(); // 元に戻す
      return false;
    }
    return true;
  }

  /**
   * テトリミノを一気に落下させる
   */
  hardDrop(): void {
    if (!this.currentTetromino || this.gameOver) return;

    while (this.moveDown()) {
      // 底まで落下
    }
  }

  /**
   * テトリミノの衝突をチェックする
   */
  private checkCollision(): boolean {
    if (!this.currentTetromino) return false;

    const shape = this.currentTetromino.shape;
    const posX = this.currentTetromino.x;
    const posY = this.currentTetromino.y;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = posX + x;
          const boardY = posY + y;

          // ボードの範囲外
          if (
            boardX < 0 ||
            boardX >= this.width ||
            boardY < 0 ||
            boardY >= this.height
          ) {
            return true;
          }

          // 他のブロックと衝突
          if (boardY >= 0 && this.grid[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * テトリミノをボードに固定する
   */
  private lockTetromino(): void {
    if (!this.currentTetromino) return;

    // 現在のテトリミノの情報を保存
    const shape = this.currentTetromino.shape;
    const posX = this.currentTetromino.x;
    const posY = this.currentTetromino.y;
    const color = this.currentTetromino.color;

    // テトリミノをグリッドに固定
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = posX + x;
          const boardY = posY + y;

          if (
            boardX >= 0 &&
            boardX < this.width &&
            boardY >= 0 &&
            boardY < this.height
          ) {
            this.grid[boardY][boardX] = color;
          }
        }
      }
    }

    // ラインクリアチェック
    const clearedLines = this.clearLines();
    if (clearedLines > 0) {
      this.clearedLines += clearedLines;
      if (this.onLineClear) {
        this.onLineClear(clearedLines);
      }
    }

    // 新しいテトリミノを生成
    this.generateNewTetromino();
  }

  /**
   * ラインを消去する
   */
  private clearLines(): number {
    let linesCleared = 0;
    const clearedLines: number[] = []; // 消去したラインのインデックスを保存
    
    // 下から上に向かってラインをチェック
    for (let y = this.height - 1; y >= 0; y--) {
      // ラインが埋まっているかチェック
      let isFilled = true;
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === 0) {
          isFilled = false;
          break;
        }
      }
      
      // ラインが埋まっていれば消去
      if (isFilled) {
        // 消去したラインのインデックスを保存
        clearedLines.push(y);
        
        // ラインを消去
        for (let x = 0; x < this.width; x++) {
          this.grid[y][x] = 0;
        }
        
        // 上のラインを下に移動
        for (let yy = y; yy > 0; yy--) {
          for (let x = 0; x < this.width; x++) {
            this.grid[yy][x] = this.grid[yy - 1][x];
          }
        }
        
        // 一番上のラインをクリア
        for (let x = 0; x < this.width; x++) {
          this.grid[0][x] = 0;
        }
        
        // 消去したライン数をカウント
        linesCleared++;
        
        // 同じラインを再チェック（上のラインが下に移動したため）
        y++;
      }
    }
    
    // 消去したライン数を返す
    return linesCleared;
  }

  /**
   * ゲームをリセットする
   */
  reset(): void {
    // ボードの初期化
    this.grid = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
    
    // テトリミノの初期化
    this.currentTetromino = null;
    this.nextTetromino = null;
    
    // 消去した行数の初期化
    this.clearedLines = 0;
    
    // ゲームオーバーフラグの初期化
    this.gameOver = false;
    
    // 最初のテトリミノを生成
    this.generateNewTetromino();
  }

  /**
   * ゲームの状態を更新する
   */
  update(): void {
    if (this.gameOver) return;
    this.moveDown();
  }
}
