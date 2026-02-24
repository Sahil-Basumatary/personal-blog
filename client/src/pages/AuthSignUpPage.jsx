import { SignUp } from "@clerk/clerk-react";
import { SEO } from "../config/seo";

function AuthSignUpPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <title>{`Sign Up | ${SEO.siteName}`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

export default AuthSignUpPage;