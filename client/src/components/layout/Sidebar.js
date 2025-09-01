import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  Category,
  People,
  Assessment,
  Person,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;
const miniDrawerWidth = 60;

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: []
    },
    {
      text: 'Productos',
      icon: <Inventory />,
      path: '/products',
      roles: []
    },
    {
      text: 'Categorías',
      icon: <Category />,
      path: '/categories',
      roles: ['admin', 'manager']
    },
    {
      text: 'Usuarios',
      icon: <People />,
      path: '/users',
      roles: ['admin']
    },
    {
      text: 'Reportes',
      icon: <Assessment />,
      path: '/reports',
      roles: ['admin', 'manager']
    }
  ];

  const bottomMenuItems = [
    {
      text: 'Mi Perfil',
      icon: <Person />,
      path: '/profile',
      roles: []
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isSelected = (path) => {
    return location.pathname === path;
  };

  const MenuItem = ({ item, isBottom = false }) => {
    if (item.roles.length > 0 && !hasPermission(item.roles)) {
      return null;
    }

    const selected = isSelected(item.path);

    return (
      <Tooltip title={!open ? item.text : ''} placement="right">
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            selected={selected}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              '&.Mui-selected': {
                backgroundColor: '#1976d2',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              },
              '&:hover': {
                backgroundColor: selected ? '#1565c0' : '#f5f5f5',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: selected ? 'white' : '#666',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                opacity: open ? 1 : 0,
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: selected ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniDrawerWidth,
          overflowX: 'hidden',
          transition: 'width 0.3s',
          border: 'none',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Espaciado para el navbar */}
      <Box sx={{ height: 64 }} />

      {/* Usuario info compacta */}
      {open && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#4caf50',
              }}
            />
            <Box>
              <Box sx={{ fontSize: '0.75rem', color: '#666' }}>
                Conectado como
              </Box>
              <Box sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {user?.name}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Menú principal */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <MenuItem key={item.text} item={item} />
        ))}
      </List>

      {/* Espaciador para empujar items al bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Menú inferior */}
      <Box>
        <Divider />
        <List sx={{ pb: 1 }}>
          {bottomMenuItems.map((item) => (
            <MenuItem key={item.text} item={item} isBottom />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
