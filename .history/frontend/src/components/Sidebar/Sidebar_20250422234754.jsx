// SidebarComponent.jsx
import React from "react";
import { NavLink } from "react-router-dom";
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

const SidebarItem = ({ label, path, icon }) => (
  <NavLink to={path} style={{ textDecoration: "none", color: "inherit" }}>
    {({ isActive }) => (
      <ListItemButton selected={isActive}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={label} />
      </ListItemButton>
    )}
  </NavLink>
);

const SidebarParent = ({ label, icon, children }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItemButton onClick={handleClick}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={label} />
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
