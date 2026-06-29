export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

// Auth is carried by an httpOnly cookie set by the server, so the token is
// never readable from JavaScript. Every request opts into sending it.
async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    const err = new Error(
      "Cannot reach the server. Make sure the Moodwave API is running."
    );
    err.status = 0;
    throw err;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    /* empty/non-JSON body */
  }

  if (!response.ok) {
    const err = new Error(
      (data && data.error) || `Request failed (${response.status})`
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) =>
    request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
