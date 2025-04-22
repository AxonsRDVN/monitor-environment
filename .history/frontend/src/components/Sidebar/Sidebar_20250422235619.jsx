// SidebarComponent.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { SIDEBAR_MENU } from "../../config/sidebar.config";

const activeStyle = {
  backgroundColor: "#0C4DA0",
  color: "#ffffff",
  "& .MuiListItemIcon-root": {
    color: "#ffffff",
  },
};

const SidebarItem = ({ label, path, icon }) => (
  <NavLink to={path} style={{ textDecoration: "none" }} end>
    {({ isActive }) => (
      <ListItemButton sx={isActive ? activeStyle : {}}>
        {icon && (
          <ListItemIcon sx={isActive ? { color: "#ffffff" } : {}}>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={label}
          sx={isActive ? { color: "#ffffff" } : {}}
        />
      </ListItemButton>
    )}
  </NavLink>
);

const SidebarParent = ({ label, icon, children }) => {
  const location = useLocation();
  const hasActiveChild = React.Children.toArray(children).some((child) => {
    return location.pathname === child.props.path;
  });
  const [open, setOpen] = React.useState(hasActiveChild);

  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={hasActiveChild ? activeStyle : {}}
      >
        {icon && (
          <ListItemIcon sx={hasActiveChild ? { color: "#ffffff" } : {}}>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={label}
          sx={hasActiveChild ? { color: "#ffffff" } : {}}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
};

const Sidebar = () => {
  return (
    <Box sx={{ width: 280, bgcolor: "#f5f5f5", height: "100vh", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        MENU
      </Typography>
      <List>
        {SIDEBAR_MENU.map((item) =>
          item.children ? (
            <SidebarParent key={item.label} label={item.label} icon={item.icon}>
              {item.children.map((child) => (
                <SidebarItem
                  key={child.path}
                  label={child.label}
                  path={child.path}
                  icon={child.icon}
                />
              ))}
            </SidebarParent>
          ) : (
            <SidebarItem
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
            />
          )
        )}
      </List>
    </Box>
  );
};

export default Sidebar;
