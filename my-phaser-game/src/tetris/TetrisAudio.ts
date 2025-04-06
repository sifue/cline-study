/**
 * テトリスゲームのサウンドを管理するクラス
 */
import { Scene } from 'phaser';

export class TetrisAudio {
  private scene: Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  
  // サウンドキー
  private static readonly SOUND_KEYS = {
    MOVE: 'move',
    ROTATE: 'rotate',
    DROP: 'drop',
    LINE_CLEAR_1: 'line_clear_1',
    LINE_CLEAR_2: 'line_clear_2',
    LINE_CLEAR_3: 'line_clear_3',
    LINE_CLEAR_4: 'line_clear_4',
    LEVEL_UP: 'level_up',
    GAME_OVER: 'game_over',
    BGM: 'bgm'
  };
  
  // サウンドのオンオフ状態
  private soundEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  
  // BGM
  private bgm: Phaser.Sound.BaseSound | null = null;
  
  // 共有AudioContext
  private audioContext: AudioContext | null = null;
  
  // サウンド再生中フラグ（キーごと）
  private playingSound: Record<string, boolean> = {
    move: false,
    rotate: false,
    drop: false,
    line_clear_1: false,
    line_clear_2: false,
    line_clear_3: false,
    line_clear_4: false,
    level_up: false,
    game_over: false
  };
  
  // サウンド再生タイムアウト（キーごと）
  private soundTimeouts: Record<string, number> = {};
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.createSounds();
  }
  
  /**
   * サウンドを作成する
   */
  private createSounds(): void {
    // 各サウンドを直接作成
    this.createDirectSound(TetrisAudio.SOUND_KEYS.MOVE, 220, 0.1);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.ROTATE, 330, 0.15);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.DROP, 165, 0.2);
    
    // ライン消去音（1〜4列）
    this.createDirectSound(TetrisAudio.SOUND_KEYS.LINE_CLEAR_1, 440, 0.3);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.LINE_CLEAR_2, 523.25, 0.4);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.LINE_CLEAR_3, 659.25, 0.5);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.LINE_CLEAR_4, 880.0, 0.6);
    
    this.createDirectSound(TetrisAudio.SOUND_KEYS.LEVEL_UP, 523.25, 0.5);
    this.createDirectSound(TetrisAudio.SOUND_KEYS.GAME_OVER, 196, 0.8);
  }
  
  /**
   * 直接サウンドを作成する（Web Audio APIを使用）
   */
  private createDirectSound(key: string, frequency: number, duration: number): void {
    try {
      // サウンドキーを小文字に変換（playingSoundのキーと一致させるため）
      const soundKey = key.toLowerCase();
      
      // サウンドオブジェクトを作成
      const sound = {
        play: (config?: Phaser.Types.Sound.SoundConfig) => {
          try {
            // サウンドが無効の場合は再生しない
            if (!this.soundEnabled) return;
            
            // 既に再生中の場合は何もしない（連続再生防止）
            if (this.playingSound[soundKey]) {
              console.log(`Sound ${key} is already playing, skipping`);
              return;
            }
            
            // 音声を再生する前にユーザーインタラクションを確認
            this.ensureAudioContext();
            
            // AudioContextを確保または作成
            if (!this.audioContext) {
              this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            // AudioContextが停止している場合は再開
            if (this.audioContext.state === 'suspended') {
              this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 音の設定（キーに応じて波形を変更）
            switch (key) {
              case TetrisAudio.SOUND_KEYS.MOVE:
                oscillator.type = 'sine';
                break;
              case TetrisAudio.SOUND_KEYS.ROTATE:
                oscillator.type = 'square';
                break;
              case TetrisAudio.SOUND_KEYS.DROP:
                oscillator.type = 'sine';
                break;
              case TetrisAudio.SOUND_KEYS.LINE_CLEAR_1:
              case TetrisAudio.SOUND_KEYS.LINE_CLEAR_2:
              case TetrisAudio.SOUND_KEYS.LINE_CLEAR_3:
              case TetrisAudio.SOUND_KEYS.LINE_CLEAR_4:
                oscillator.type = 'square';
                break;
              case TetrisAudio.SOUND_KEYS.LEVEL_UP:
                oscillator.type = 'sawtooth';
                break;
              case TetrisAudio.SOUND_KEYS.GAME_OVER:
                oscillator.type = 'sawtooth';
                break;
              default:
                oscillator.type = 'sine';
            }
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // 音量の設定（音量を上げる）
            const volume = config?.volume !== undefined ? config.volume * 2 : 1.0;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            // 接続
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 再生中フラグを設定
            this.playingSound[soundKey] = true;
            
            // 再生
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
            // 既存のタイムアウトをクリア
            if (this.soundTimeouts[soundKey]) {
              window.clearTimeout(this.soundTimeouts[soundKey]);
            }
            
            // 再生終了後に再生中フラグをリセットするタイムアウトを設定
            this.soundTimeouts[soundKey] = window.setTimeout(() => {
              this.playingSound[soundKey] = false;
              console.log(`Sound ${key} playback completed`);
            }, duration * 1000 + 50); // 少し余裕を持たせる
            
            // クリーンアップ
            oscillator.onended = () => {
              oscillator.disconnect();
              gainNode.disconnect();
            };
            
            // デバッグ用ログ
            console.log(`Playing sound ${key} with frequency ${frequency} and volume ${volume}`);
          } catch (error) {
            console.warn(`Error playing sound ${key}:`, error);
            // エラーが発生した場合も再生中フラグをリセット
            this.playingSound[soundKey] = false;
          }
        }
      } as unknown as Phaser.Sound.BaseSound;
      
      // サウンドを保存
      this.sounds.set(key, sound);
    } catch (error) {
      console.warn(`Error creating sound ${key}:`, error);
    }
  }
  
  /**
   * AudioContextを確保する（ユーザーインタラクションが必要）
   */
  private ensureAudioContext(): void {
    try {
      // AudioContextを作成して即座に再開
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // 無音の短い音を再生して、AudioContextを有効化
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      gainNode.gain.value = 0.001; // ほぼ無音
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.001);
      
      // クリーンアップ
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn('Error ensuring audio context:', error);
    }
  }
  
  /**
   * サウンドをロードする
   */
  preload(): void {
    // サウンドファイルがある場合はロード
    try {
      // 移動音
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.MOVE,
        'assets/sounds/move.mp3'
      );
      
      // 回転音
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.ROTATE,
        'assets/sounds/rotate.mp3'
      );
      
      // 落下音
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.DROP,
        'assets/sounds/drop.mp3'
      );
      
      // ライン消去音（1〜4列）
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.LINE_CLEAR_1,
        'assets/sounds/line_clear_1.mp3'
      );
      
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.LINE_CLEAR_2,
        'assets/sounds/line_clear_2.mp3'
      );
      
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.LINE_CLEAR_3,
        'assets/sounds/line_clear_3.mp3'
      );
      
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.LINE_CLEAR_4,
        'assets/sounds/line_clear_4.mp3'
      );
      
      // レベルアップ音
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.LEVEL_UP,
        'assets/sounds/level_up.mp3'
      );
      
      // ゲームオーバー音
      this.scene.load.audio(
        TetrisAudio.SOUND_KEYS.GAME_OVER,
        'assets/sounds/game_over.mp3'
      );
      
      // BGM
      this.createTetrisBGM();
    } catch (error) {
      console.warn('Error loading sound files:', error);
    }
  }
  
  /**
   * テトリス風のBGMを作成する
   */
  private createTetrisBGM(): void {
    try {
      // Web Audio APIを使用してBGMを生成
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // BGMの音符（テトリスのテーマ曲の一部）
      const notes = [
        { note: 'E5', duration: 0.25 },
        { note: 'B4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.125 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'E5', duration: 0.25 },
        { note: 'D5', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.375 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'E5', duration: 0.25 },
        { note: 'C5', duration: 0.25 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.375 },
        { note: 'D5', duration: 0.125 },
        { note: 'F5', duration: 0.25 },
        { note: 'A5', duration: 0.25 },
        { note: 'G5', duration: 0.125 },
        { note: 'F5', duration: 0.125 },
        { note: 'E5', duration: 0.375 },
        { note: 'C5', duration: 0.125 },
        { note: 'E5', duration: 0.25 },
        { note: 'D5', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.25 },
        { note: 'B4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'E5', duration: 0.25 },
        { note: 'C5', duration: 0.25 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.25 }
      ];
      
      // 音符の周波数マップ
      const noteFrequency: Record<string, number> = {
        'A4': 440.0,
        'B4': 493.88,
        'C5': 523.25,
        'D5': 587.33,
        'E5': 659.25,
        'F5': 698.46,
        'G5': 783.99,
        'A5': 880.0
      };
      
      // BGMオブジェクトを作成
      const bgm = {
        play: (config?: Phaser.Types.Sound.SoundConfig) => {
          if (!this.bgmEnabled) return;
          
          try {
            // AudioContextを確保
            this.ensureAudioContext();
            
            // 新しいAudioContextを作成
            const bgmContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // 音量の設定
            const volume = config?.volume !== undefined ? config.volume : 0.3;
            const masterGain = bgmContext.createGain();
            masterGain.gain.value = volume;
            masterGain.connect(bgmContext.destination);
            
            // 音符を順番に再生
            let startTime = bgmContext.currentTime;
            
            const playNotes = (index: number) => {
              if (index >= notes.length) {
                // 最後まで再生したら最初に戻る（ループ再生）
                startTime = bgmContext.currentTime;
                playNotes(0);
                return;
              }
              
              const note = notes[index];
              const frequency = noteFrequency[note.note];
              const duration = note.duration;
              
              // オシレーターを作成
              const oscillator = bgmContext.createOscillator();
              oscillator.type = 'square';
              oscillator.frequency.value = frequency;
              
              // エンベロープを作成
              const noteGain = bgmContext.createGain();
              noteGain.gain.setValueAtTime(0.001, startTime);
              noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
              noteGain.gain.linearRampToValueAtTime(0.3, startTime + duration * 0.6);
              noteGain.gain.linearRampToValueAtTime(0.001, startTime + duration);
              
              // 接続
              oscillator.connect(noteGain);
              noteGain.connect(masterGain);
              
              // 再生
              oscillator.start(startTime);
              oscillator.stop(startTime + duration);
              
              // クリーンアップ
              oscillator.onended = () => {
                oscillator.disconnect();
                noteGain.disconnect();
                
                // 次の音符を再生
                if (this.bgmEnabled) {
                  playNotes(index + 1);
                }
              };
              
              // 次の音符の開始時間を更新
              startTime += duration;
            };
            
            // 最初の音符から再生開始
            playNotes(0);
            
            console.log('Playing BGM');
          } catch (error) {
            console.warn('Error playing BGM:', error);
          }
        },
        stop: () => {
          // BGMを停止する処理（実際には新しい音符の再生を停止するだけ）
          this.bgmEnabled = false;
          console.log('BGM stopped');
        }
      } as unknown as Phaser.Sound.BaseSound;
      
      // BGMを保存
      this.bgm = bgm;
      this.sounds.set(TetrisAudio.SOUND_KEYS.BGM, bgm);
    } catch (error) {
      console.warn('Error creating BGM:', error);
    }
  }
  
  /**
   * 移動音を再生する
   */
  playMoveSound(): void {
    this.playSoundSafely(TetrisAudio.SOUND_KEYS.MOVE, { volume: 0.5 });
  }
  
  /**
   * 回転音を再生する
   */
  playRotateSound(): void {
    this.playSoundSafely(TetrisAudio.SOUND_KEYS.ROTATE, { volume: 0.5 });
  }
  
  /**
   * 落下音を再生する
   */
  playDropSound(): void {
    this.playSoundSafely(TetrisAudio.SOUND_KEYS.DROP, { volume: 0.6 });
  }
  
  /**
   * ライン消去音を再生する（消した列数に応じて音を変える）
   */
  playLineClearSound(lines: number = 1): void {
    // 消した列数に応じて音を変える
    switch (lines) {
      case 1:
        this.playSoundSafely(TetrisAudio.SOUND_KEYS.LINE_CLEAR_1, { volume: 0.7 });
        break;
      case 2:
        this.playSoundSafely(TetrisAudio.SOUND_KEYS.LINE_CLEAR_2, { volume: 0.8 });
        break;
      case 3:
        this.playSoundSafely(TetrisAudio.SOUND_KEYS.LINE_CLEAR_3, { volume: 0.9 });
        break;
      case 4:
        this.playSoundSafely(TetrisAudio.SOUND_KEYS.LINE_CLEAR_4, { volume: 1.0 });
        break;
      default:
        this.playSoundSafely(TetrisAudio.SOUND_KEYS.LINE_CLEAR_1, { volume: 0.7 });
        break;
    }
  }
  
  /**
   * レベルアップ音を再生する
   */
  playLevelUpSound(): void {
    this.playSoundSafely(TetrisAudio.SOUND_KEYS.LEVEL_UP, { volume: 0.7 });
  }
  
  /**
   * ゲームオーバー音を再生する
   */
  playGameOverSound(): void {
    this.playSoundSafely(TetrisAudio.SOUND_KEYS.GAME_OVER, { volume: 0.7 });
  }
  
  /**
   * サウンドを安全に再生する（サウンドが存在しない場合はエラーを回避）
   */
  private playSoundSafely(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    // サウンドが無効の場合は再生しない
    if (!this.soundEnabled && key !== TetrisAudio.SOUND_KEYS.BGM) return;
    
    try {
      // まずファイルからロードされたサウンドを試す
      if (this.scene.sound.get(key)) {
        this.scene.sound.play(key, config);
        console.log(`Playing sound: ${key} from file`);
        return;
      }
      
      // ファイルがない場合は生成したサウンドを使用
      const sound = this.sounds.get(key);
      if (sound) {
        sound.play(config);
        console.log(`Playing sound: ${key} from generated sound`);
      } else {
        console.warn(`Sound not found: ${key}`);
        
        // 緊急対応：直接Web Audio APIを使用してサウンドを生成して再生
        this.playFallbackSound(key);
      }
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
      
      // エラーが発生した場合も緊急対応
      this.playFallbackSound(key);
    }
  }
  
  /**
   * BGMを再生する
   */
  playBGM(): void {
    if (!this.bgmEnabled) return;
    
    try {
      console.log('Starting BGM playback...');
      
      // AudioContextを確保
      this.ensureAudioContext();
      
      // Web Audio APIを使用してBGMを生成
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // BGMの音符（テトリスのテーマ曲の一部）
      const notes = [
        { note: 'E5', duration: 0.25 },
        { note: 'B4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.125 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'E5', duration: 0.25 },
        { note: 'D5', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.375 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'E5', duration: 0.25 },
        { note: 'C5', duration: 0.25 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.375 }
      ];
      
      // 音符の周波数マップ
      const noteFrequency: Record<string, number> = {
        'A4': 440.0,
        'B4': 493.88,
        'C5': 523.25,
        'D5': 587.33,
        'E5': 659.25,
        'F5': 698.46,
        'G5': 783.99,
        'A5': 880.0
      };
      
      // 音量の設定
      const masterGain = audioContext.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(audioContext.destination);
      
      // 音符を順番に再生
      let startTime = audioContext.currentTime;
      
      const playNotes = (index: number) => {
        if (!this.bgmEnabled) {
          console.log('BGM disabled, stopping playback');
          return;
        }
        
        if (index >= notes.length) {
          // 最後まで再生したら最初に戻る（ループ再生）
          startTime = audioContext.currentTime;
          playNotes(0);
          return;
        }
        
        const note = notes[index];
        const frequency = noteFrequency[note.note];
        const duration = note.duration;
        
        // オシレーターを作成
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = frequency;
        
        // エンベロープを作成
        const noteGain = audioContext.createGain();
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
        noteGain.gain.linearRampToValueAtTime(0.3, startTime + duration * 0.6);
        noteGain.gain.linearRampToValueAtTime(0.001, startTime + duration);
        
        // 接続
        oscillator.connect(noteGain);
        noteGain.connect(masterGain);
        
        // 再生
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        console.log(`Playing BGM note: ${note.note} at time ${startTime}`);
        
        // クリーンアップ
        oscillator.onended = () => {
          oscillator.disconnect();
          noteGain.disconnect();
          
          // 次の音符を再生
          if (this.bgmEnabled) {
            playNotes(index + 1);
          }
        };
        
        // 次の音符の開始時間を更新
        startTime += duration;
      };
      
      // 最初の音符から再生開始
      playNotes(0);
      
      console.log('BGM playback started');
    } catch (error) {
      console.warn('Error playing BGM:', error);
    }
  }
  
  /**
   * BGMを停止する
   */
  stopBGM(): void {
    if (!this.bgm) return;
    
    try {
      this.bgm.stop();
      this.bgmEnabled = false;
    } catch (error) {
      console.warn('Error stopping BGM:', error);
    }
  }
  
  /**
   * サウンドのオンオフを切り替える
   */
  toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
  
  /**
   * BGMのオンオフを切り替える
   */
  toggleBGM(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    
    if (this.bgmEnabled) {
      this.playBGM();
    } else {
      this.stopBGM();
    }
    
    return this.bgmEnabled;
  }
  
  /**
   * サウンドが有効かどうかを取得する
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
  
  /**
   * BGMが有効かどうかを取得する
   */
  isBGMEnabled(): boolean {
    return this.bgmEnabled;
  }
  
  /**
   * フォールバックサウンドを再生する（緊急対応）
   */
  private playFallbackSound(key: string): void {
    if (!this.soundEnabled) return;
    
    // サウンドキーを小文字に変換（playingSoundのキーと一致させるため）
    const soundKey = key.toLowerCase();
    
    // 既に再生中の場合は何もしない（連続再生防止）
    if (this.playingSound[soundKey]) {
      console.log(`Sound ${key} is already playing, skipping`);
      return;
    }
    
    try {
      // AudioContextを確保または作成
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // AudioContextが停止している場合は再開
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // キーに応じて異なる周波数を設定
      let frequency = 440; // デフォルト
      let duration = 0.2; // デフォルト
      
      switch (key) {
        case TetrisAudio.SOUND_KEYS.MOVE:
          frequency = 220;
          duration = 0.1;
          break;
        case TetrisAudio.SOUND_KEYS.ROTATE:
          frequency = 330;
          duration = 0.15;
          break;
        case TetrisAudio.SOUND_KEYS.DROP:
          frequency = 165;
          duration = 0.2;
          break;
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_1:
          frequency = 440;
          duration = 0.3;
          break;
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_2:
          frequency = 523.25;
          duration = 0.4;
          break;
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_3:
          frequency = 659.25;
          duration = 0.5;
          break;
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_4:
          frequency = 880.0;
          duration = 0.6;
          break;
        case TetrisAudio.SOUND_KEYS.LEVEL_UP:
          frequency = 523.25;
          duration = 0.5;
          break;
        case TetrisAudio.SOUND_KEYS.GAME_OVER:
          frequency = 196;
          duration = 0.8;
          break;
      }
      
      // 音の設定（キーに応じて波形を変更）
      switch (key) {
        case TetrisAudio.SOUND_KEYS.MOVE:
          oscillator.type = 'sine';
          break;
        case TetrisAudio.SOUND_KEYS.ROTATE:
          oscillator.type = 'square';
          break;
        case TetrisAudio.SOUND_KEYS.DROP:
          oscillator.type = 'sine';
          break;
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_1:
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_2:
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_3:
        case TetrisAudio.SOUND_KEYS.LINE_CLEAR_4:
          oscillator.type = 'square';
          break;
        case TetrisAudio.SOUND_KEYS.LEVEL_UP:
          oscillator.type = 'sawtooth';
          break;
        case TetrisAudio.SOUND_KEYS.GAME_OVER:
          oscillator.type = 'sawtooth';
          break;
        default:
          oscillator.type = 'sine';
      }
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // 音量の設定（音量を上げる）
      gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      // 接続
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 再生中フラグを設定
      this.playingSound[soundKey] = true;
      
      // 再生
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
      
      console.log(`Playing fallback sound: ${key} with frequency ${frequency}`);
      
      // 既存のタイムアウトをクリア
      if (this.soundTimeouts[soundKey]) {
        window.clearTimeout(this.soundTimeouts[soundKey]);
      }
      
      // 再生終了後に再生中フラグをリセットするタイムアウトを設定
      this.soundTimeouts[soundKey] = window.setTimeout(() => {
        this.playingSound[soundKey] = false;
        console.log(`Sound ${key} playback completed`);
      }, duration * 1000 + 50); // 少し余裕を持たせる
      
      // クリーンアップ
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn(`Error playing fallback sound ${key}:`, error);
      // エラーが発生した場合も再生中フラグをリセット
      this.playingSound[soundKey] = false;
    }
  }
}
