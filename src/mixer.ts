import { Howl } from "howler";

Howler.autoSuspend = false;

export class InvalidTrack extends Error { }
export class VolumeOutOfRange extends Error { }
export class VolumeStepOutOfRange extends VolumeOutOfRange { }

type ChannelInfo = {
  id: string;
  url: string;
  volume: number;
};

class Channel extends Howl {
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
      throw new VolumeStepOutOfRange(
        `fader: Step absolute value=${step} must be [0, 1]`
      );
    }

    const newVolume =
      this.volume() + step < 0
        ? 0
        : this.volume() + step > 1
          ? 1
          : this.volume() + step;

    // Fading duration can't be 0 https://github.com/goldfire/howler.js/issues/1549
    this.fade(this.volume(), newVolume, fading || this._fadingDuration || 1);

    return newVolume;
  }
}

class Mixer {
  private _tracks: Map<string, Channel>;

  constructor() {
    this._tracks = new Map();
  }

  public channels(): Array<ChannelInfo> {
    return Array.from(this._tracks.entries()).map(([id, track]) => ({
      id,
      url: track.url(),
      volume: track.volume(),
    }));
  }

  public channel(id: string): Channel {
    const t = this._tracks.get(id);

    if (t) {
      return t;
    }

    throw new InvalidTrack(`track: Track with id=${id} was not loaded`);
  }

  public load(id: string, url: string): ChannelInfo {
    const track = new Channel(url);
    this._tracks.set(id, track);
    return {
      id,
      url,
      volume: track.volume(),
    };
  }

  public remove(id: string): void {
    const track = this._tracks.get(id);
    if (track) {
      track.unload();
    }
  }
}

export default Mixer;
