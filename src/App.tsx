import { useState } from "react";
import Mixer, { TrackInfo } from "./mixer";

const BASE_PATH = "assets";

const mixer = new Mixer();

const library: Map<string, string> = new Map();
[`beep.mp3`, `beep2.mp3`].map(id => library.set(id, `${BASE_PATH}/${id}`));

const App = () => {
  const [tracksInfo, setTracksInfo] = useState<Array<TrackInfo>>([]);

  mixer.on('load', () => setTracksInfo(mixer.tracks()));
  mixer.on('remove', () => setTracksInfo(mixer.tracks()));
  mixer.on('volume', () => setTracksInfo(mixer.tracks()));

  return (
    <div>
      <h1>Night Focus</h1>
      <div>
        <ul>
          {Array.from(library.entries()).map(([id, url]) =>
            <li key={id}>
              {tracksInfo.map(x => x.id).includes(id) ?
                <span>{id}</span> :
                <a href="#" onClick={() => mixer.load(id, url)}>{id}</a>}
            </li>
          )}
        </ul>
      </div>
      <hr />
      <div>
        <ul>
          {tracksInfo.map(track =>
            <li key={track.id}>
              <button onClick={() => mixer.track(track.id).fader(0.2)}>+</button>{` `}
              <button onClick={() => mixer.track(track.id).fader(-0.2)}>-</button>{` `}
              <button onClick={() => mixer.remove(track.id)}>x</button>{` `}
              <span>{track.id}</span>{` `}
              {track.volume > 0 && <span>|</span>}
              <span>{`-`.repeat(Math.round(track.volume * 10))}</span>
              {track.volume == 1 && <span>|</span>}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
};

export default App;
