import { Howl } from "howler";

Howler.autoSuspend = false;

export class InvalidTrack extends Error { };
export class VolumeOutOfRange extends Error { };
export class VolumeStepOutOfRange extends VolumeOutOfRange { };

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

  public setVolume(newVolume: number): void {
    if (newVolume < 0 || newVolume > 1) {
      throw new VolumeOutOfRange(`setVolume: New volume value=${newVolume} must be [0, 1]`);
    }

    this.fade(this.volume(), newVolume, 0);
  }

  public fader(step: number, fading?: number): number {
    if (Math.abs(step) < 0 || Math.abs(step) > 1) {
      throw new VolumeStepOutOfRange(`fader: Step absolute value=${step} must be [0, 1]`);
    }

    const newVolume = this.volume() + step < 0 ? 0 :
      (this.volume() + step > 1 ? 1 : this.volume() + step)
    return this.fade(this.volume(), newVolume, fading || this.fadingDuration).volume();
  }
}

class Mixer {
  private sounds: Map<string, Track>;

  constructor() {
    this.sounds = new Map();
  }

  public tracks(): Array<Track> {
    return Array.from(this.sounds.values());
  }

  public load(id: string, src: string): void {
    this.sounds.set(id, new Track(src));
  }

  public remove(id: string): void {
    const track = this.sounds.get(id);
    if (track) {
      track.unload();
      this.sounds.delete(id);
    }
  }

  public track(id: string): Track {
    const t = this.sounds.get(id);
    if (t) {
      return t
    }

    throw new InvalidTrack(`track: Track with id=${id} was not loaded`);
  }
}

export default Mixer;
