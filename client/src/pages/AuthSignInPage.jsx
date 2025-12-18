import { SignIn } from "@clerk/clerk-react";

function AuthSignInPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

export default AuthSignInPage;