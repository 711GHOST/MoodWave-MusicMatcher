import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Search from "./Search";

// Mock the data layer and heavy children so the test focuses on Search's own
// logic (querying, tabs, and song pagination).
jest.mock("../api/search", () => ({ searchAll: jest.fn() }));
jest.mock("../api/songs", () => ({ searchSongs: jest.fn() }));
jest.mock("../context/PlayerContext", () => ({
  usePlayer: () => ({ playQueue: jest.fn() }),
}));
jest.mock("../components/cards/SongRow", () => ({
  __esModule: true,
  default: ({ song }) => <div data-testid="song">{song.name}</div>,
}));
jest.mock("../components/cards/PlaylistCard", () => ({
  __esModule: true,
  default: ({ playlist }) => <div data-testid="playlist">{playlist.name}</div>,
}));
jest.mock("../components/cards/ArtistCard", () => ({
  __esModule: true,
  default: ({ artist }) => <div data-testid="artist">{artist.name}</div>,
}));

import { searchAll } from "../api/search";
import { searchSongs } from "../api/songs";

const songs = (from, to) =>
  Array.from({ length: to - from }, (_, i) => ({
    _id: `s${from + i}`,
    name: `Song ${from + i}`,
  }));

beforeEach(() => jest.clearAllMocks());

const runSearch = () => {
  const input = screen.getByPlaceholderText("Songs, playlists, or artists");
  fireEvent.change(input, { target: { value: "a" } });
  fireEvent.keyDown(input, { key: "Enter" });
};

describe("Search", () => {
  it("renders songs, playlists and artists for a query", async () => {
    searchAll.mockResolvedValue({
      songs: songs(0, 10),
      playlists: [{ _id: "p1", name: "Chill" }],
      artists: [{ name: "Sunny Days", songCount: 4, thumbnail: "t" }],
      songsTotal: 14,
      songsHasMore: true,
    });
    render(<Search />);
    runSearch();

    await waitFor(() =>
      expect(screen.getAllByTestId("song")).toHaveLength(10)
    );
    expect(screen.getByTestId("playlist")).toHaveTextContent("Chill");
    expect(screen.getByTestId("artist")).toHaveTextContent("Sunny Days");
    expect(screen.getByText("Load more songs")).toBeInTheDocument();
  });

  it("appends the next page of songs and hides the control when exhausted", async () => {
    searchAll.mockResolvedValue({
      songs: songs(0, 10),
      playlists: [],
      artists: [],
      songsTotal: 14,
      songsHasMore: true,
    });
    searchSongs.mockResolvedValue({ data: songs(10, 14), hasMore: false });

    render(<Search />);
    runSearch();
    await waitFor(() => expect(screen.getAllByTestId("song")).toHaveLength(10));

    fireEvent.click(screen.getByText("Load more songs"));
    await waitFor(() => expect(screen.getAllByTestId("song")).toHaveLength(14));
    expect(screen.queryByText("Load more songs")).not.toBeInTheDocument();
    expect(searchSongs).toHaveBeenCalledWith("a", 2, 10);
  });

  it("shows an empty state when nothing matches", async () => {
    searchAll.mockResolvedValue({
      songs: [],
      playlists: [],
      artists: [],
      songsTotal: 0,
      songsHasMore: false,
    });
    render(<Search />);
    runSearch();
    await waitFor(() =>
      expect(screen.getByText("No results found")).toBeInTheDocument()
    );
  });
});
