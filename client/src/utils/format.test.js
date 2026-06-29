import { formatTime, artistName, greetingKey } from "./format";

describe("formatTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(605)).toBe("10:05");
  });

  it("handles invalid input", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(undefined)).toBe("0:00");
  });
});

describe("artistName", () => {
  it("returns a string artist as-is", () => {
    expect(artistName("Arijit Singh")).toBe("Arijit Singh");
  });

  it("joins a populated user object", () => {
    expect(artistName({ firstName: "Jane", lastName: "Doe" })).toBe("Jane Doe");
    expect(artistName({ firstName: "Solo" })).toBe("Solo");
  });

  it("falls back to Unknown Artist", () => {
    expect(artistName(null)).toBe("Unknown Artist");
    expect(artistName({})).toBe("Unknown Artist");
  });
});

describe("greetingKey", () => {
  it("returns a valid greeting key", () => {
    expect(["goodMorning", "goodAfternoon", "goodEvening"]).toContain(
      greetingKey()
    );
  });
});
