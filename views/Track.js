import { useStateValue } from "../state";
import "./track.css";

const prova = [
  [1, 2],
  [3, 5],
  [7,10.5]
];

export default function Track({play}) {
  let bpm = 60;
  let bar = 15;
  let metric = 4;
  let bars = [];
  const [state, dispatch] = useStateValue();

  let time_loop = (metric * bar * 60000) / bpm;
  let time_loop_ms = time_loop + "ms";

  document.documentElement.style.setProperty("--loop-time", time_loop_ms);

  let position;
  for (let i = 1; i < bar; i++) {
    position = (100 * i) / bar;
    position = position + "%";
    bars.push(
      <line x1={position} y1="0" x2={position} y2="100%" className="bars" />
    );
  }
  console.log(play)

  return (
      <div className="track">
        <svg width="100%" height="100%">
          <line x1="0" y1="0" x2="0" y2="100%" className={"cursor-line " + play}  />
          {bars}
          {state.currentLoop.map((note, index) => {
            let x = note[0] * 1000 *100 / time_loop + "%";
            //let width = (note[1] - note[0]) * 1000 *100 / time_loop + "%";
            let width=2+"%"
            return (
              <rect x={x} y="40%" rx="0.5%"  width={width} height="20%" className="note"/>
            );
          })}
        </svg>
      </div>
  );
}