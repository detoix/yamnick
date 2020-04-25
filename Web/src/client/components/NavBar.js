import React from "react";
import { Link } from 'react-router-dom'  
import { useAuth0 } from "../utils/react-auth0-spa";
import { Button, AppBar, Toolbar, IconButton,
  Typography } from '@material-ui/core';
import { Home } from '@material-ui/icons'

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Link to='/'>
          <IconButton>
            <Home />
          </IconButton>
        </Link>
        <Typography variant="h6">
          {!isAuthenticated && <Button color="inherit" onClick={() => loginWithRedirect({})}>Log in</Button>}
          {isAuthenticated && <Button color="inherit" onClick={() => logout()}>Log out</Button>}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;