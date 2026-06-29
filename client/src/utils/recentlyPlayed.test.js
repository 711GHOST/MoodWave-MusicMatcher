import {
  getRecentlyPlayed,
  pushRecentlyPlayed,
  clearRecentlyPlayed,
} from "./recentlyPlayed";

const song = (id) => ({
  _id: id,
  name: `Song ${id}`,
  artist: "Tester",
  thumbnail: "t",
  track: "u",
});

beforeEach(() => {
  localStorage.clear();
});

describe("recentlyPlayed", () => {
  it("stores songs most-recent-first", () => {
    pushRecentlyPlayed(song("a"));
    pushRecentlyPlayed(song("b"));
    expect(getRecentlyPlayed().map((s) => s._id)).toEqual(["b", "a"]);
  });

  it("de-duplicates and moves a replayed song to the front", () => {
    pushRecentlyPlayed(song("a"));
    pushRecentlyPlayed(song("b"));
    pushRecentlyPlayed(song("a"));
    const ids = getRecentlyPlayed().map((s) => s._id);
    expect(ids).toEqual(["a", "b"]);
  });

  it("caps the history at 20 entries", () => {
    for (let i = 0; i < 25; i += 1) pushRecentlyPlayed(song(`s${i}`));
    expect(getRecentlyPlayed()).toHaveLength(20);
    expect(getRecentlyPlayed()[0]._id).toBe("s24");
  });

  it("ignores songs without an id and clears history", () => {
    pushRecentlyPlayed({ name: "no id" });
    expect(getRecentlyPlayed()).toHaveLength(0);
    pushRecentlyPlayed(song("a"));
    clearRecentlyPlayed();
    expect(getRecentlyPlayed()).toHaveLength(0);
  });
});
