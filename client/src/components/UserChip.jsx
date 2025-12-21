import { useUser, useClerk } from "@clerk/clerk-react";

function UserChip({ surface = "dark" }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();

  if (!isLoaded) return null;

  const displayName =
    user?.firstName ||
    user?.username ||
    (user?.primaryEmailAddress &&
      user.primaryEmailAddress.emailAddress.split("@")[0]) ||
    "there";

  const containerClass = `user-chip user-chip--${surface}`;

  if (!isSignedIn) {
    return (
      <button
        className={`nav-signin ${
          surface === "light" ? "nav-signin--light" : ""
        }`}
        onClick={() => openSignIn()}
      >
        Sign in
      </button>
    );
  }

  return (
    <div className={containerClass}>
      <div className="user-chip-main">
        <div className="user-chip-avatar">
          <img src="/icons/user.svg" alt="User avatar" />
        </div>

      <div className="user-chip-text">
        <span className="user-chip-greeting">Hi,</span>
        <span className="user-chip-name">{displayName}</span>
      </div>
      </div>

      <button
        className="user-chip-signout"
        onClick={() => signOut({ redirectUrl: "/" })}
      >
        Sign out
      </button>
    </div>
  );
}

export default UserChip;