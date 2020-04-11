import React from "react";
import { useAuth0 } from "../utils/react-auth0-spa";
import { Button, AppBar, Toolbar, IconButton,
  Typography } from '@material-ui/core';
import { Menu } from '@material-ui/icons'

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton edge="start">
          <Menu />
        </IconButton>
        <Typography variant="h6">
          News
        </Typography>
        {!isAuthenticated && <Button color="inherit" onClick={() => loginWithRedirect({})}>Log in</Button>}
        {isAuthenticated && <Button color="inherit" onClick={() => logout()}>Log out</Button>}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;