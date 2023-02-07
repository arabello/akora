import { useState } from "react";
import Mixer from "./soundengine";

const BASE_PATH = "assets";

const mixer = new Mixer();

const App = () => {
  const [loadedSources, setLoadedSources] = useState<Array<string>>([]);
  const sources = [
    `beep.mp3`,
    `beep2.mp3`
  ];
  const onSourceAdd = (src: string) => {
    mixer.load(src, `${BASE_PATH}/${src}`);
    setLoadedSources(loadedSources.concat(src));
  }

  const onSourceDelete = (src: string) => {
    mixer.remove(`${BASE_PATH}/${src}`);
    setLoadedSources(loadedSources.filter(x => x !== src));
  }

  return (
    <div>
      <h1>Night Focus</h1>
      <div>
        <ul>
          {sources.map(src =>
            <li key={src}>
              {loadedSources.includes(src) ?
                <span>{src}</span> :
                <a href="#" onClick={() => onSourceAdd(src)}>{src}</a>}
            </li>
          )}
        </ul>
      </div>
      <hr />
      <div>
        <ul>
          {loadedSources.map(src =>
            <li key={src}>
              <button onClick={() => mixer.track(src).fader(0.2)}>+</button>{` `}
              <button onClick={() => mixer.track(src).fader(-0.2)}>-</button>{` `}
              <button onClick={() => onSourceDelete(src)}>x</button>{` `}
              <span>{src}</span>{` `}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
};

export default App;
