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
}

export type ChannelInfo = {
  id: string;
  url: string;
  volume: number;
};

const Mixer = new Map<string, Channel>();

export const useMixer = (
  initChannels: Array<ChannelInfo> = [],
  onStateChange: (e: Event) => void = () => {},
) => {
  const [channels, setChannels] = useState<Record<string, ChannelInfo>>(
    initChannels.reduce(
      (acc, chInfo) => ({
        ...acc,
        [chInfo.id]: chInfo,
      }),
      {},
    ),
  );

  Object.values(channels).forEach((chInfo) => {
    if (!Mixer.has(chInfo.id)) {
      Mixer.set(chInfo.id, new Channel(chInfo.url, chInfo.volume));
    }
  });

  Mixer.forEach((ch, id) => {
    if (!channels[id]) {
      ch.unload();
      Mixer.delete(id);
    }
  });

  const load = (id: string, url: string, volume: number = 0) =>
    setChannels({
      ...channels,
      [id]: {
        id,
        url,
        volume,
      },
    });

  const unload = (id: string) => {
    const { [id]: chToRemove, ...rest } = channels;
    setChannels(rest);
  };

  const volume = (id: string, step: number) => {
    const channel = Mixer.get(id);
    if (!channel) {
      return;
    }

    const newVolume = channel.volume() + step;
    if (newVolume < 0 || newVolume > 1) {
      return;
    }
    channel.volume(newVolume);

    setChannels({
      ...channels,
      [id]: {
        ...channels[id],
        volume: channel.volume(),
      },
    });
  };

  const muteAll = (mute: boolean) => {
    Mixer.forEach((ch) => ch.mute(mute));
  };

  Howler.ctx != null && (Howler.ctx.onstatechange = onStateChange);

  return {
    load,
    unload,
    volume,
    muteAll,
    channels,
  };
};
