import { Howl } from "howler";

Howler.autoSuspend = false;

export class InvalidTrack extends Error { };
export class VolumeOutOfRange extends Error { };
export class VolumeStepOutOfRange extends VolumeOutOfRange { };

class Track extends Howl {
  private _url: string;
  private _fadingDuration: number;
  constructor(url: string) {
    super({
      src: [url],
      preload: true,
      autoplay: true,
      loop: true,
      volume: 0,
    });

    this._url = url;
    this._fadingDuration = 1500;
  }

  public url(): string {
    return this._url;
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
    return this.fade(this.volume(), newVolume, fading || this._fadingDuration).volume();
  }
}

export type Event = "load" | "remove";
export type EventCallback = (id: string) => void;

class Mixer {
  private _tracks: Map<string, Track>;
  private _callbacks: {
    load: EventCallback,
    remove: EventCallback
  }

  constructor() {
    this._tracks = new Map();
    this._callbacks = {
      load: () => { },
      remove: () => { }
    }
  }

  public tracks(): Array<Track> {
    return Array.from(this._tracks.values());
  }

  public track(id: string): Track {
    const t = this._tracks.get(id);
    if (t) {
      return t
    }

    throw new InvalidTrack(`track: Track with id=${id} was not loaded`);
  }

  public load(id: string, src: string): void {
    const track = new Track(src);
    this._tracks.set(id, track);
    this._callbacks.load(id);
  }

  public remove(id: string): void {
    const track = this._tracks.get(id);
    if (track) {
      track.unload();
      this._tracks.delete(id);
      this._callbacks.remove(id);
    }
  }

  public on(event: Event, callback: EventCallback): void {
    this._callbacks[event] = callback;
  }

  public off(event: Event): void {
    this._callbacks[event] = () => { }
  }
}

export default Mixer;
