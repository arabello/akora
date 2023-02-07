import { Howl } from "howler";

Howler.autoSuspend = false;

export class InvalidTrack extends Error { };
export class VolumeOutOfRange extends Error { };

class Track extends Howl {
  private src: string;
  private fadingDuration: number;
  constructor(src: string) {
    super({
      src: [src],
      preload: true,
      autoplay: true,
      loop: true,
      volume: 0,
    });

    this.src = src;
    this.fadingDuration = 1500;
  }

  public source(): string {
    return this.src;
  }

  public fader(newVolume: number, fading?: number): void {
    if (newVolume < 0 || newVolume > 1) {
      throw new VolumeOutOfRange(`fader: Target volume value=${newVolume} must be [0, 1]`);
    }

    this.fade(this.volume(), newVolume, fading || this.fadingDuration);
  }
}

class SoundEngine {
  private sounds: Map<string, Track>;

  constructor() {
    this.sounds = new Map();
  }

  public tracks(): Array<Track> {
    return Array.from(this.sounds.values());
  }

  public load(src: string): void {
    this.sounds.set(src, new Track(src));
  }

  public track(id: string): Track {
    const t = this.sounds.get(id);
    if (t) {
      return t
    }

    throw new InvalidTrack(`fader: Track with id=${id} was not loaded`);
  }
}

export default SoundEngine;
