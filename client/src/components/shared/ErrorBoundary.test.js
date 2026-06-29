import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const Boom = () => {
  throw new Error("kaboom");
};

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("safe content")).toBeInTheDocument();
  });

  it("renders a recoverable fallback when a child throws", () => {
    // React logs the caught error to console.error — silence it for this test.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
    spy.mockRestore();
  });
});
