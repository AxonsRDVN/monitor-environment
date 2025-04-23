import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslation } from "react-i18next";
import useNavigationItems from "../../hook/useNavigationItems";
import { FileCopyOutlined, Menu } from "@mui/icons-material";

const Sidebar = () => {
  const menuItems = useNavigationItems();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const { isMenuOpen, setIsMenuOpen } = useContext(AppContext);
  const { t } = useTranslation("translation");
  const isSmallScreen = useMediaQuery("(max-width:1050px)");

  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.path &&
        item.path !== "/" &&
        location.pathname.startsWith(item.path)
      ) {
        setActiveItem(item.text);
      }

      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.path === location.pathname) {
            setActiveItem(subItem.text);
            setOpenSubmenu((prevState) => ({
              ...prevState,
              [item.text]: true,
            }));
          }
        });
      }
    });
  }, [location.pathname]);
  const handleToggleSubmenu = (item) => {
    setOpenSubmenu((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
  };
  const renderMenuList = () => (
    <List
      sx={{
        padding: "30px 10px 0",
      }}
    >
      {menuItems?.map((item, index) => (
        <div key={index}>
          {!item.subItems ? (
            <ListItem
              button
              component={Link}
              to={item.path}
              onClick={() => handleSetActiveItem(item.text)}
              sx={{
                backgroundColor:
                  activeItem === item.text ? "#0C4DA0" : "transparent",
                color: activeItem === item.text ? "white" : "black",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor:
                    activeItem !== item.text ? "lightgray" : "#004092",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeItem === item.text ? "white" : "black",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: activeItem === item.text ? "white" : "black",
                }}
              />
            </ListItem>
          ) : (
            <>
              <ListItem
                button
                onClick={() => handleToggleSubmenu(item.text)}
                sx={{
                  backgroundColor:
                    activeItem === item.text ? "#0C4DA0" : "transparent",
                  color: activeItem === item.text ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeItem === item.text ? "white" : "black",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: activeItem === item.text ? "white" : "black",
                  }}
                />
                {openSubmenu[item.text] ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItem>

              <Collapse
                in={openSubmenu[item.text]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem
                      button
                      key={subIndex}
                      sx={{
                        pl: 4,
                        borderRadius: "5px",
                        backgroundColor:
                          activeItem === subItem.text
                            ? "#0C4DA0"
                            : "transparent",
                        color: activeItem === subItem.text ? "white" : "black",
                        "&:hover": {
                          backgroundColor:
                            activeItem !== subItem.text
                              ? "lightgray"
                              : "#004092",
                        },
                      }}
                      component={Link}
                      to={subItem.path}
                      onClick={() => handleSetActiveItem(subItem.text)}
                    >
                      <ListItemText
                        primary={subItem.text}
                        sx={{
                          color:
                            activeItem === subItem.text ? "white" : "black",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </div>
      ))}
    </List>
  );

  return (
    <>
      {isSmallScreen ? (
        <>
          {/* Nút mở Drawer khi màn hình nhỏ */}
          <IconButton
            onClick={() => setIsMenuOpen(true)}
            sx={{ position: "absolute", top: 20, left: 16, zIndex: 1 }}
          >
            <Menu />
          </IconButton>

          {/* Drawer hiển thị menu */}
          <Drawer
            anchor="left"
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          >
            <div style={{ width: 280, height: "100vh", background: "#ffffff" }}>
              <IconButton
                onClick={() => setIsMenuOpen(false)}
                sx={{ margin: "10px" }}
              >
                <CloseIcon />
              </IconButton>
              {renderMenuList()}
            </div>
          </Drawer>
        </>
      ) : (
        // Hiển thị menu bình thường khi màn hình lớn
        <div
          style={{
            width: "280px",
            height: "100vh",
            background: "#ffffff",
            position: "fixed",
            top: "85px",
          }}
        >
          {renderMenuList()}
        </div>
      )}
    </>
  );
};

export default Sidebar;
