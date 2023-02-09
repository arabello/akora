import { Howl } from "howler";

Howler.autoSuspend = false;

export class InvalidTrack extends Error { };
export class VolumeOutOfRange extends Error { };
export class VolumeStepOutOfRange extends VolumeOutOfRange { };

export type TrackInfo = {
  id: string;
  url: string;
  volume: number;
}

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
    this._fadingDuration = 0;
  }

  public url(): string {
    return this._url;
  }

  public fader(step: number, fading?: number): number {
    if (Math.abs(step) < 0 || Math.abs(step) > 1) {
      throw new VolumeStepOutOfRange(`fader: Step absolute value=${step} must be [0, 1]`);
    }
    console.log('volume', this.volume());
    const newVolume = this.volume() + step < 0 ? 0 :
      (this.volume() + step > 1 ? 1 : this.volume() + step)
    console.log('newVolume', newVolume);

    // Fading duration can't be 0 https://github.com/goldfire/howler.js/issues/1549
    return this.fade(this.volume(), newVolume, fading || this._fadingDuration || 1).volume();
  }
}

export type Event = "load" | "remove" | "volume";
export type EventCallback = (id: string) => void;

class Mixer {
  private _tracks: Map<string, Track>;
  private _callbacks: { [k in Event]: EventCallback }

  constructor() {
    this._tracks = new Map();
    this._callbacks = {
      load: () => { },
      remove: () => { },
      volume: () => { },
    }
  }

  public tracks(): Array<TrackInfo> {
    return Array.from(this._tracks.entries()).map(([id, track]) => ({
      id,
      url: track.url(),
      volume: track.volume()
    }));
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
    track.on('fade', () => this._callbacks.volume(id));
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
