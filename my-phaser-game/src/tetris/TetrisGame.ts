/**
 * テトリスゲームのメインクラス
 */
import { Scene, Input } from 'phaser';
import { Board } from './Board';
import { TetrisRenderer } from './TetrisRenderer';
import { TetrisAudio } from './TetrisAudio';

export class TetrisGame {
  private scene: Scene;
  private board: Board;
  private renderer: TetrisRenderer;
  private audio: TetrisAudio;
  
  // ゲームの状態
  private paused: boolean = false;
  private gameSpeed: number = 1000; // ミリ秒
  private lastMoveTime: number = 0;
  
  // キー入力の遅延（連続入力防止）
  private keyDelay: number = 100; // ミリ秒
  private lastKeyTime: Record<string, number> = {
    left: 0,
    right: 0,
    down: 0,
    z: 0,
    x: 0,
    r: 0,
    m: 0,
    b: 0
  };
  
  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    
    // オーディオの作成（先に作成して、初期化時のサウンドを再生できるようにする）
    this.audio = new TetrisAudio(scene);
    
    // ボードの作成
    this.board = new Board();
    
    // レンダラーの作成
    this.renderer = new TetrisRenderer(scene, this.board, x, y);
    
    // コールバックの設定
    this.board.setOnLineClear((lines) => {
      // 消した列数に応じてサウンドを変える
      this.audio.playLineClearSound(lines);
      
      // ラインクリアエフェクトを表示
      // 消去された行のインデックスを取得
      // Board.tsのclearLinesメソッドでは、下から上に向かってラインをチェックしているため、
      // 消去された行は下から上に向かって連続している可能性が高い
      const clearedLines = [];
      let y = this.board.height - 1;
      let count = 0;
      
      // 下から上に向かって、消去された行を探す
      while (y >= 0 && count < lines) {
        // 行が空かどうかをチェック（消去された直後は上の行が下に移動しているため、空の行はない）
        // 代わりに、消去された行の数だけ、下から順番に行を追加
        clearedLines.push(y);
        count++;
        y--;
      }
      
      // エフェクトを表示
      this.renderer.showLineClearEffect(clearedLines);
    });
    
    this.board.setOnGameOver(() => {
      this.audio.playGameOverSound();
      this.renderer.showGameOverEffect();
    });
    
    // BGMを再生
    this.audio.playBGM();
  }
  
  /**
   * サウンドをロードする
   */
  preload(): void {
    this.audio.preload();
  }
  
  // 前回のテトリミノ位置（地面設置時のエフェクト表示用）
  private lastTetrominoY: number = -1;
  
  /**
   * ゲームを更新する
   */
  update(time: number): void {
    if (this.paused) return;
    
    // リセットキー（いつでもリセット可能）
    if (this.isKeyJustDown('R', time)) {
      this.reset();
      return;
    }
    
    // ゲームオーバー時は操作を受け付けない
    if (this.board.isGameOver()) {
      this.renderer.update();
      return;
    }
    
    // キー入力の処理
    this.handleInput(time);
    
    // 一定時間ごとにテトリミノを下に移動
    if (time - this.lastMoveTime > this.gameSpeed) {
      this.lastMoveTime = time;
      
      // 現在のテトリミノを取得
      const currentTetromino = this.board.getCurrentTetromino();
      
      // 現在のテトリミノのY座標を保存（地面設置時のエフェクト表示用）
      let currentY = -1;
      if (currentTetromino) {
        currentY = currentTetromino.y;
      }
      
      // テトリミノが下に移動できなかった場合（地面に設置された場合）
      const moveResult = this.board.moveDown();
      if (!moveResult) {
        // 落下音を再生
        this.audio.playDropSound();
        
        // 地面設置エフェクトを表示（テトリミノが存在する場合のみ）
        // 前回のY座標と比較して、テトリミノが移動した場合のみエフェクトを表示
        if (currentTetromino && currentY >= 0 && currentY !== this.lastTetrominoY) {
          this.renderer.showDropEffect(currentTetromino);
        }
      }
      
      // 現在のY座標を保存
      if (currentTetromino) {
        this.lastTetrominoY = currentTetromino.y;
      }
    }
    
    // 描画の更新
    this.renderer.update();
  }
  
  /**
   * ゲームをリセットする
   */
  reset(): void {
    this.board.reset();
    this.lastMoveTime = 0;
    this.paused = false;
    this.lastTetrominoY = -1; // 前回のテトリミノ位置をリセット
  }
  
  /**
   * キー入力を処理する
   */
  private handleInput(time: number): void {
    // 左キー
    if (this.isKeyDown('LEFT')) {
      if (time - this.lastKeyTime.left > this.keyDelay) {
        this.lastKeyTime.left = time;
        if (this.board.moveLeft()) {
          this.audio.playMoveSound();
        }
      }
    }
    
    // 右キー
    if (this.isKeyDown('RIGHT')) {
      if (time - this.lastKeyTime.right > this.keyDelay) {
        this.lastKeyTime.right = time;
        if (this.board.moveRight()) {
          this.audio.playMoveSound();
        }
      }
    }
    
    // 下キー
    if (this.isKeyDown('DOWN')) {
      if (time - this.lastKeyTime.down > this.keyDelay) {
        this.lastKeyTime.down = time;
        if (this.board.moveDown()) {
          this.audio.playMoveSound();
        }
      }
    }
    
    // Zキー（左回転）- JustDownを使用して一度だけ適用
    if (this.isKeyJustDown('Z', time)) {
      if (this.board.rotateLeft()) {
        this.audio.playRotateSound();
      }
    }
    
    // Xキー（右回転）- JustDownを使用して一度だけ適用
    if (this.isKeyJustDown('X', time)) {
      if (this.board.rotateRight()) {
        this.audio.playRotateSound();
      }
    }
    
    // Mキー（サウンドのオンオフ）- JustDownを使用して一度だけ適用
    if (this.isKeyJustDown('M', time)) {
      const soundEnabled = this.audio.toggleSound();
      console.log(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`);
      
      // サウンドが有効になった場合、確認音を再生
      if (soundEnabled) {
        this.audio.playMoveSound();
      }
    }
    
    // Bキー（BGMのオンオフ）- JustDownを使用して一度だけ適用
    if (this.isKeyJustDown('B', time)) {
      const bgmEnabled = this.audio.toggleBGM();
      console.log(`BGM ${bgmEnabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  /**
   * キーが押されているかどうかを取得する
   */
  private isKeyDown(key: string): boolean {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return false;
    
    switch (key) {
      case 'LEFT':
        return keyboard.addKey(Input.Keyboard.KeyCodes.LEFT).isDown;
      case 'RIGHT':
        return keyboard.addKey(Input.Keyboard.KeyCodes.RIGHT).isDown;
      case 'DOWN':
        return keyboard.addKey(Input.Keyboard.KeyCodes.DOWN).isDown;
      case 'Z':
        return keyboard.addKey(Input.Keyboard.KeyCodes.Z).isDown;
      case 'X':
        return keyboard.addKey(Input.Keyboard.KeyCodes.X).isDown;
      case 'R':
        return keyboard.addKey(Input.Keyboard.KeyCodes.R).isDown;
      case 'M':
        return keyboard.addKey(Input.Keyboard.KeyCodes.M).isDown;
      case 'B':
        return keyboard.addKey(Input.Keyboard.KeyCodes.B).isDown;
      default:
        return false;
    }
  }
  
  /**
   * キーが今押されたかどうかを取得する
   */
  private isKeyJustDown(key: string, time: number): boolean {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return false;
    
    const isDown = this.isKeyDown(key);
    const keyTime = this.lastKeyTime[key.toLowerCase() as keyof typeof this.lastKeyTime] || 0;
    
    if (isDown && time - keyTime > this.keyDelay) {
      this.lastKeyTime[key.toLowerCase() as keyof typeof this.lastKeyTime] = time;
      console.log(`Key ${key} just pressed at time ${time}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * ゲームを一時停止する
   */
  pause(): void {
    this.paused = true;
  }
  
  /**
   * ゲームを再開する
   */
  resume(): void {
    this.paused = false;
  }
  
  /**
   * ゲームスピードを設定する
   */
  setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }
}
