import React from "react";
import { Button } from "@mui/material";
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <Button
      variant="contained"
      color="primary"
      component="a"
      onClick={handleLogin}
      style={{ padding: "10px 20px", fontSize: "16px" }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;
