/**
 * テトリミノの定義と操作を行うクラス
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrominoData {
  type: TetrominoType;
  color: number;
  shape: number[][];
}

export class Tetromino {
  private static readonly SHAPES: Record<TetrominoType, number[][]> = {
    'I': [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    'O': [
      [1, 1],
      [1, 1]
    ],
    'T': [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    'S': [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    'Z': [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    'J': [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    'L': [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  };

  private static readonly COLORS: Record<TetrominoType, number> = {
    'I': 0x00ffff, // シアン
    'O': 0xffff00, // 黄色
    'T': 0x800080, // 紫
    'S': 0x00ff00, // 緑
    'Z': 0xff0000, // 赤
    'J': 0x0000ff, // 青
    'L': 0xff7f00  // オレンジ
  };

  public type: TetrominoType;
  public shape: number[][];
  public color: number;
  public x: number;
  public y: number;

  constructor(type: TetrominoType, x: number, y: number) {
    this.type = type;
    this.shape = JSON.parse(JSON.stringify(Tetromino.SHAPES[type])); // ディープコピー
    this.color = Tetromino.COLORS[type];
    this.x = x;
    this.y = y;
  }

  /**
   * テトリミノを左に回転させる
   */
  rotateLeft(): void {
    if (this.type === 'O') return; // Oは回転しない

    const size = this.shape.length;
    const newShape = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        newShape[size - 1 - x][y] = this.shape[y][x];
      }
    }

    this.shape = newShape;
  }

  /**
   * テトリミノを右に回転させる
   */
  rotateRight(): void {
    if (this.type === 'O') return; // Oは回転しない

    const size = this.shape.length;
    const newShape = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        newShape[x][size - 1 - y] = this.shape[y][x];
      }
    }

    this.shape = newShape;
  }

  /**
   * ランダムなテトリミノを生成する
   */
  static getRandomTetromino(x: number, y: number): Tetromino {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Tetromino(randomType, x, y);
  }

  /**
   * テトリミノのデータを取得する
   */
  getData(): TetrominoData {
    return {
      type: this.type,
      color: this.color,
      shape: this.shape
    };
  }
}
