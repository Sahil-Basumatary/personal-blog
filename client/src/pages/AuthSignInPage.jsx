import { SignIn } from "@clerk/clerk-react";
import { SEO } from "../config/seo";

function AuthSignInPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <title>{`Sign In | ${SEO.siteName}`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

export default AuthSignInPage;