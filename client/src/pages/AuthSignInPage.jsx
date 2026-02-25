import { SignIn } from "@clerk/clerk-react";
import { SEOHead } from "../components/SEOHead";

function AuthSignInPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <SEOHead title="Sign In" description="" url="/sign-in" noIndex />
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

export default AuthSignInPage;