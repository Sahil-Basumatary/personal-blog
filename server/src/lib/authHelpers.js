export function getOwnerId() {
  return (
    process.env.OWNER_USER_ID ||
    process.env.VITE_OWNER_USER_ID || 
    "test-owner-id"
  );
}

export function getAuthUserIdFromReq(req) {
  try {
    if (typeof req.auth === "function") {
      const auth = req.auth();
      return auth?.userId || null;
    }

    if (req.auth && typeof req.auth === "object") {
      return req.auth.userId || null;
    }

    return null;
  } catch (err) {
    console.error("Error accessing req.auth:", err.message);
    return null;
  }
}

export function requireSignedInOwner(
  req,
  opts = {}
) {
  const {
    unauthStatus = 401,
    unauthMessage = "You must be signed in to perform this action.",
    forbiddenStatus = 403,
    forbiddenMessage = "You are not allowed to modify posts.",
    misconfigStatus = 500,
    misconfigMessage = "Server is not configured for write access yet.",
  } = opts;

  const authUserId = getAuthUserIdFromReq(req);
  const ownerId = getOwnerId();
  const isTestEnv = process.env.NODE_ENV === "test";
  if (!authUserId) {
    return {
      ok: false,
      status: unauthStatus,
      message: unauthMessage,
    };
  }
  if (!ownerId || (!isTestEnv && ownerId === "test-owner-id")) {
    console.warn(
      "OWNER_USER_ID is not set correctly so denying write operation."
    );
    return {
      ok: false,
      status: misconfigStatus,
      message: misconfigMessage,
    };
  }
  if (authUserId !== ownerId) {
    return {
      ok: false,
      status: forbiddenStatus,
      message: forbiddenMessage,
    };
  }
  return { ok: true, authUserId };
}

