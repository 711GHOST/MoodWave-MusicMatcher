import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

// The provider talks to the API only through this module - mock it.
jest.mock("../api/auth", () => ({
  getMe: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  goPremium: jest.fn(),
}));
import * as authApi from "../api/auth";

function Consumer() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <span data-testid="who">{user ? user.email : "anon"}</span>
      <button onClick={() => login("demo", "pw")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const renderApp = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

beforeEach(() => jest.clearAllMocks());

describe("AuthContext", () => {
  it("restores a session from the cookie via /auth/me", async () => {
    authApi.getMe.mockResolvedValueOnce({ user: { email: "me@x.com" } });
    renderApp();
    await waitFor(() =>
      expect(screen.getByTestId("who")).toHaveTextContent("me@x.com")
    );
  });

  it("stays logged out when /auth/me fails", async () => {
    authApi.getMe.mockRejectedValueOnce(new Error("401"));
    renderApp();
    await waitFor(() =>
      expect(screen.getByTestId("who")).toHaveTextContent("anon")
    );
  });

  it("logs in then logs out, clearing the user", async () => {
    authApi.getMe.mockRejectedValueOnce(new Error("401"));
    authApi.login.mockResolvedValueOnce({ user: { email: "demo@x.com" } });
    authApi.logout.mockResolvedValueOnce({ message: "ok" });
    renderApp();
    await waitFor(() =>
      expect(screen.getByTestId("who")).toHaveTextContent("anon")
    );

    await act(async () => {
      fireEvent.click(screen.getByText("login"));
    });
    await waitFor(() =>
      expect(screen.getByTestId("who")).toHaveTextContent("demo@x.com")
    );

    await act(async () => {
      fireEvent.click(screen.getByText("logout"));
    });
    await waitFor(() =>
      expect(screen.getByTestId("who")).toHaveTextContent("anon")
    );
    expect(authApi.logout).toHaveBeenCalled();
  });
});
