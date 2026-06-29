import { render, screen, fireEvent, act } from "@testing-library/react";
import { SettingsProvider } from "./SettingsContext";
import { PlayerProvider, usePlayer } from "./PlayerContext";

// Stub Howler so no real audio is created in jsdom.
jest.mock("howler", () => {
  class Howl {
    constructor(opts) {
      this.opts = opts || {};
      this._seek = 0;
      this._playing = false;
      // Real Howl fires onload asynchronously (after the instance is assigned).
    }
    play() {
      this._playing = true;
      if (this.opts.onplay) this.opts.onplay();
    }
    pause() {
      this._playing = false;
      if (this.opts.onpause) this.opts.onpause();
    }
    stop() {
      this._playing = false;
    }
    unload() {}
    seek(s) {
      if (s === undefined) return this._seek;
      this._seek = s;
      return this;
    }
    duration() {
      return 100;
    }
    volume() {}
    playing() {
      return this._playing;
    }
  }
  return { Howl };
});

const song = (id) => ({
  _id: id,
  name: `T${id}`,
  artist: "x",
  thumbnail: "t",
  track: `u${id}`,
});

function Consumer() {
  const {
    currentSong,
    queue,
    playQueue,
    next,
    prev,
    addToQueue,
    removeFromQueue,
  } = usePlayer();
  return (
    <div>
      <span data-testid="current">{currentSong ? currentSong.name : "none"}</span>
      <span data-testid="len">{queue.length}</span>
      <button onClick={() => playQueue([song("1"), song("2"), song("3")], 0)}>
        play
      </button>
      <button onClick={next}>next</button>
      <button onClick={prev}>prev</button>
      <button onClick={() => addToQueue(song("4"))}>add</button>
      <button onClick={() => removeFromQueue(queue.length - 1)}>removeLast</button>
    </div>
  );
}

const renderPlayer = () =>
  render(
    <SettingsProvider>
      <PlayerProvider>
        <Consumer />
      </PlayerProvider>
    </SettingsProvider>
  );

const click = (label) =>
  act(() => {
    fireEvent.click(screen.getByText(label));
  });

beforeEach(() => localStorage.clear());

describe("PlayerContext queue", () => {
  it("plays a queue and advances with next/prev", () => {
    renderPlayer();
    expect(screen.getByTestId("current")).toHaveTextContent("none");

    click("play");
    expect(screen.getByTestId("current")).toHaveTextContent("T1");
    expect(screen.getByTestId("len")).toHaveTextContent("3");

    click("next");
    expect(screen.getByTestId("current")).toHaveTextContent("T2");

    click("prev");
    expect(screen.getByTestId("current")).toHaveTextContent("T1");
  });

  it("wraps from the last track to the first with next", () => {
    renderPlayer();
    click("play");
    click("next"); // T2
    click("next"); // T3
    click("next"); // wraps to T1
    expect(screen.getByTestId("current")).toHaveTextContent("T1");
  });

  it("adds to and removes from the queue", () => {
    renderPlayer();
    click("play");
    expect(screen.getByTestId("len")).toHaveTextContent("3");

    click("add");
    expect(screen.getByTestId("len")).toHaveTextContent("4");

    click("removeLast");
    expect(screen.getByTestId("len")).toHaveTextContent("3");
  });
});
