export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

let authToken = null;

// AuthContext keeps this in sync with the logged-in user's JWT.
export const setAuthToken = (token) => {
  authToken = token;
};

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
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
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
