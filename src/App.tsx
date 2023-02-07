import SoundEngine from "./soundengine";

const BASE_PATH = "assets";

const App = () => {
  const seng = new SoundEngine();
  const sources = [
    `beep.mp3`,
    `beep2.mp3`
  ].map(x => `${BASE_PATH}/${x}`);
  sources.map(x => seng.load(x));
  return (
    <div>
      <h1>Night Focus</h1>
      {seng.tracks().map(
        track => <button key={track.source()} onClick={() => track.fader(1.0)}>{track.source()}</button>
      )
      }
    </div>
  )
};

export default App;
