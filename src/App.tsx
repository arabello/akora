import { useState } from "react";
import Mixer from "./mixer";

const BASE_PATH = "assets";

const mixer = new Mixer();

const library: Map<string, string> = new Map();
[`beep.mp3`, `beep2.mp3`].map(id => library.set(id, `${BASE_PATH}/id`));

const App = () => {
  const [pool, setPool] = useState<Array<string>>([]);
  mixer.on('load', (id) => setPool(pool.concat(id)));
  mixer.on('remove', (id) => setPool(pool.filter(x => x != id)));

  return (
    <div>
      <h1>Night Focus</h1>
      <div>
        <ul>
          {Array.from(library.entries()).map(([id, url]) =>
            <li key={id}>
              {pool.includes(id) ?
                <span>{id}</span> :
                <a href="#" onClick={() => mixer.load(id, url)}>{id}</a>}
            </li>
          )}
        </ul>
      </div>
      <hr />
      <div>
        <ul>
          {pool.map(id =>
            <li key={id}>
              <button onClick={() => mixer.track(id).fader(0.2)}>+</button>{` `}
              <button onClick={() => mixer.track(id).fader(-0.2)}>-</button>{` `}
              <button onClick={() => mixer.remove(id)}>x</button>{` `}
              <span>{id}</span>{` `}
              <span>{`-`.repeat(mixer.track(id).volume())}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
};

export default App;
