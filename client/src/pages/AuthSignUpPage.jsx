import { SignUp } from "@clerk/clerk-react";
import { SEOHead } from "../components/SEOHead";

function AuthSignUpPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <SEOHead title="Sign Up" description="" url="/sign-up" noIndex />
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

export default AuthSignUpPage;