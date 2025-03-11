import React from "react";
const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = "/auth/google"; // Redirect to backend for login
  };

  return (
    <button onClick={handleLogin} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
