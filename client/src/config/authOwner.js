const OWNER_IDS = [
  import.meta.env.VITE_OWNER_USER_ID,
  import.meta.env.VITE_OWNER_USER_ID_DEV,
].filter(Boolean);

export const OWNER_USER_ID = OWNER_IDS[0] || "";
export const isOwnerUser = (userId) => OWNER_IDS.includes(userId);