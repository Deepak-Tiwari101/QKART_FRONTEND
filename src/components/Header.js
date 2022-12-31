import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const handleLogOut = (e, history) => {
  e.preventDefault();
  localStorage.clear();
  // history.push('/');
  window.location.reload();
};

const Header = ({ children, hasHiddenAuthButtons }) => {
  // console.log(hasHiddenAuthButtons)

  const history = useHistory();

  let isLoggedIn = localStorage.getItem("username") === null ? false : true;
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>

      {!hasHiddenAuthButtons && children}

      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      ) : isLoggedIn ? (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Avatar
            alt={localStorage.getItem("username")}
            src="public/avatar.png"
          />
          <p>{`${localStorage.getItem("username")}`}</p>
          <Button variant="text" onClick={(e) => handleLogOut(e, history)}>
            LOGOUT
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button variant="text" onClick={() => history.push("/login")}>
            LOGIN
          </Button>
          <Button variant="contained" onClick={() => history.push("/register")}>
            Register
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;
