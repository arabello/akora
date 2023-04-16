import { Howl } from "howler";
import { useState } from "react";

Howler.autoSuspend = false;

export class Channel extends Howl {
  private _url: string;

  constructor(url: string, volume: number = 0) {
    super({
      preload: true,
      autoplay: true,
      loop: true,
      src: [url],
      volume: volume < 0 ? 0 : volume > 1 ? 1 : volume,
    });
    this._url = url;
  }

  public url(): string {
    return this._url;
  }

  public fade(step: number, duration: number = 0) {
    super.fade(this.volume(), this.volume() + step, duration);
    return this;
  }
}

export type ChannelInfo = {
  id: string;
  url: string;
  volume: number;
};

export const useMixer = (initChannels: Array<ChannelInfo> = []) => {
  const [channels, setChannels] = useState<Record<string, Channel>>(
    initChannels.reduce(
      (acc, chInfo) => ({
        ...acc,
        [chInfo.id]: new Channel(chInfo.url, chInfo.volume),
      }),
      {}
    )
  );

  const load = (id: string, url: string, volume: number = 0) =>
    setChannels({
      ...channels,
      [id]: new Channel(url, volume),
    });

  const unload = (id: string) => {
    const { [id]: trackToRemove, ...rest } = channels;
    trackToRemove.unload();
    setChannels(rest);
  };

  return {
    load,
    unload,
    channels,
  };
};
