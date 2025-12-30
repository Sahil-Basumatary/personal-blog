import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/clerk-react";
import "./UserChip.css";

function UserChip({ surface = "dark" }) {
  const { user } = useUser();

  const firstName =
    user?.firstName ||
    (user?.fullName ? user.fullName.split(" ")[0] : null) ||
    user?.username ||
    "there";

  return (
    <div className={`user-chip user-chip--${surface}`}>
      <SignedOut>
        <SignInButton mode="redirect">
          <button type="button" className="user-chip-signin">
            <span className="user-chip-signin-label">Sign in</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="user-chip-main">
          <div className="user-chip-avatar">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt={firstName} />
            )}
          </div>

          <div className="user-chip-text">
            <span className="user-chip-greeting">Hi,</span>
            <span className="user-chip-name">{firstName}</span>
          </div>
        </div>

        <SignOutButton>
          <button type="button" className="user-chip-signout">
            Sign out
          </button>
        </SignOutButton>
      </SignedIn>
    </div>
  );
}

export default UserChip;