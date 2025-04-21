import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';
import Logo from '../assets/Logo-dark.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Box,
  Divider
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const NavbarDB = ({ title, byline }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  // Get first letter of each word in name for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div position="static" color="default" >
      <div className="m-1 flex justify-between items-center h-18 p-3 border-[#989898] bg-white border rounded-md">
        {/* Left section - Logo and Title */}
        <div className="flex items-center gap-4">
          <div>
            <Typography variant="h6" className="font-bold">
              {title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {byline}
            </Typography>
          </div>
        </div>

        {/* Right section - User Info and Menu */}
        <div className="flex items-center gap-4">

          <Button
  onClick={handleMenuOpen}
  color="inherit"
  className="text-gray-700"
  startIcon={
    <div className="w-10 h-10 flex justify-center items-center rounded-full bg-yellow-400 font-semibold text-white">
      {user?.name ? getInitials(user.name) : <AccountCircleIcon />}
    </div>
  }
>
  <div className="flex flex-col items-start text-left">
    <span className="font-bold">{user?.name || 'User'}</span>
    <span className="text-xs text-gray-500">
      {user?.role || user?.roles?.[0] || 'No role'}
    </span>
  </div>
</Button>


          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                Signed in as {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon className="mr-2" fontSize="small" />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSignOut} className="text-red-600">
              <ExitToAppIcon className="mr-2" fontSize="small" />
              Sign Out
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default NavbarDB;