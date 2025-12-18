import { SignUp } from "@clerk/clerk-react";

function AuthSignUpPage() {
  return (
    <div style={{ padding: "4rem 0", display: "flex", justifyContent: "center" }}>
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

export default AuthSignUpPage;