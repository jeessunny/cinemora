import React, { useState } from 'react';
import { 
  Box, Typography, Avatar, List, ListItem, ListItemButton, 
  ListItemText, ListItemIcon, Divider, Switch, IconButton
} from '@mui/material';
import { 
  DeleteSweep, RestartAlt, Palette, Visibility, VisibilityOff,
  DragIndicator, ArrowUpward, ArrowDownward, ColorLens,
  Animation, ViewDay, Search, Settings, Logout, DeleteForever
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import useStore from '../store';
import ConfirmDialog from '../components/ConfirmDialog';
import SegmentedButton from '../components/SegmentedButton';

const ACCENT_COLORS = [
  { label: 'Red', value: '#E50914' },
  { label: 'Blue', value: '#2196F3' },
  { label: 'Purple', value: '#9C27B0' },
  { label: 'Green', value: '#4CAF50' },
  { label: 'Orange', value: '#FF9800' },
  { label: 'Pink', value: '#E91E63' },
  { label: 'Teal', value: '#009688' },
  { label: 'Amber', value: '#FFC107' },
  { label: 'Cyan', value: '#00BCD4' },
  { label: 'Indigo', value: '#3F51B5' },
];

// Section label helper (replaces [Genre] with actual genre name)
const getSectionLabel = (section, selectedGenres) => {
  if (section.id === 'genre1') return `Because You Like ${selectedGenres[0] || 'Action'}`;
  if (section.id === 'genre2') return `More ${selectedGenres[1] || 'Sci-Fi'}`;
  return section.label;
};

// Sortable item wrapper component
function SortableSectionItem({ section, index, selectedGenres, toggleHomeSection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative'
  };

  return (
    <Box ref={setNodeRef} style={style}>
      {index > 0 && !isDragging && <Divider />}
      <ListItem sx={{ py: 1, px: 1.5, gap: 0.5, bgcolor: isDragging ? 'surface.surfaceContainerHighest' : 'transparent', borderRadius: isDragging ? '8px' : 0 }}>
        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'grab',
            p: 1,
            mr: 0.5,
            touchAction: 'none'
          }}
        >
          <DragIndicator sx={{ color: 'text.disabled', fontSize: 22 }} />
        </Box>

        <ListItemText 
          primary={getSectionLabel(section, selectedGenres)}
          primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }}
        />

        <IconButton 
          onClick={() => toggleHomeSection(section.id)}
          sx={{ color: section.enabled ? 'primary.main' : 'text.disabled' }}
        >
          {section.enabled ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </ListItem>
    </Box>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const userName = useStore(state => state.userName);
  const avatar = useStore(state => state.avatar);
  const selectedGenres = useStore(state => state.selectedGenres) || [];
  const themeMode = useStore(state => state.themeMode);
  const setThemeMode = useStore(state => state.setThemeMode);
  const clearHistory = useStore(state => state.clearHistory);
  const resetRecommendations = useStore(state => state.resetRecommendations);
  const setOnboarded = useStore(state => state.setOnboarded);

  // Customization state
  const accentColor = useStore(state => state.accentColor);
  const setAccentColor = useStore(state => state.setAccentColor);
  const floatingNavBar = useStore(state => state.floatingNavBar);
  const setFloatingNavBar = useStore(state => state.setFloatingNavBar);
  const homeSections = useStore(state => state.homeSections) || [];
  const toggleHomeSection = useStore(state => state.toggleHomeSection);
  const reorderHomeSections = useStore(state => state.reorderHomeSections);
  const resetHomeSections = useStore(state => state.resetHomeSections);
  const animationsEnabled = useStore(state => state.animationsEnabled);
  const setAnimationsEnabled = useStore(state => state.setAnimationsEnabled);
  const navSearchEnabled = useStore(state => state.navSearchEnabled);
  const setNavSearchEnabled = useStore(state => state.setNavSearchEnabled);
  const navSettingsEnabled = useStore(state => state.navSettingsEnabled);
  const setNavSettingsEnabled = useStore(state => state.setNavSettingsEnabled);

  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleClearHistory = () => {
    clearHistory();
    setConfirmDialog(null);
  };

  const handleResetRecommendations = () => {
    resetRecommendations();
    setConfirmDialog(null);
    setOnboarded(false);
    navigate('/');
  };

  const handleLogOut = () => {
    useStore.getState().clearAllData();
    localStorage.removeItem('cinemora-storage');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    useStore.getState().clearAllData();
    localStorage.removeItem('cinemora-storage');
    navigate('/');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag starts to allow for taps on the visibility button
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = homeSections.findIndex(s => s.id === active.id);
      const newIndex = homeSections.findIndex(s => s.id === over.id);
      reorderHomeSections(oldIndex, newIndex);
    }
  };

  // Shared section title style
  const sectionTitle = (text) => (
    <Typography 
      variant="titleMedium" 
      fontWeight={700} 
      color="primary.main"
      sx={{ mb: 1.5, mt: 3, px: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '12px' }}
    >
      {text}
    </Typography>
  );

  return (
    <Box sx={{ px: 2, pt: 2, pb: 16, display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Left-aligned Settings Title */}
      <Typography 
        variant="headlineMedium" 
        fontWeight={800} 
        sx={{ mb: 3, textAlign: 'left', width: '100%', display: 'block' }}
      >
        Settings
      </Typography>

      {/* ═══════ Profile Card ═══════ */}
      <Box sx={{ 
        pl: 2.5, pr: 3.5, mb: 1, py: 3,
        bgcolor: 'surface.surfaceContainerLow',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', gap: 2.5, boxSizing: 'border-box'
      }}>
        <Avatar 
          src={avatar || ''} 
          sx={{ width: 72, height: 72, flexShrink: 0 }} 
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1 }}>
          <Typography variant="titleMedium" fontWeight={800} color="text.primary"
            sx={{ lineHeight: 1.2, mb: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userName || 'Movie Lover'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="bodySmall" color="primary.main"
              onClick={() => navigate('/', { state: { fromSettings: true } })}
              sx={{ cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
              Edit Profile
            </Typography>
            <Typography variant="bodySmall" color="text.secondary" sx={{ opacity: 0.5 }}>•</Typography>
            <Typography variant="bodySmall" color="error.main"
              onClick={handleLogOut}
              sx={{ cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
              <Logout sx={{ fontSize: 14 }} /> Log Out
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════ APPEARANCE ═══════ */}
      {sectionTitle('Appearance')}
      <List sx={{ bgcolor: 'surface.surfaceContainer', borderRadius: '16px', overflow: 'hidden', mb: 1 }}>
        {/* Theme Mode */}
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><Palette color="primary" /></ListItemIcon>
            <ListItemText primary="Theme Mode" primaryTypographyProps={{ fontWeight: 600 }} />
          </Box>
          <SegmentedButton
            value={themeMode}
            onChange={setThemeMode}
            fullWidth
            options={[
              { label: 'Light', value: 'light' },
              { label: 'System', value: 'system' },
              { label: 'Dark', value: 'dark' }
            ]}
          />
        </ListItem>

        <Divider />

        {/* Accent Color */}
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><ColorLens color="primary" /></ListItemIcon>
            <ListItemText primary="Accent Color" primaryTypographyProps={{ fontWeight: 600 }} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            {ACCENT_COLORS.map(c => (
              <Box
                key={c.value}
                onClick={() => setAccentColor(c.value)}
                sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  bgcolor: c.value, cursor: 'pointer',
                  border: accentColor === c.value ? '3px solid' : '2px solid transparent',
                  borderColor: accentColor === c.value ? 'text.primary' : 'transparent',
                  transform: accentColor === c.value ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                }}
              />
            ))}
          </Box>
        </ListItem>
      </List>

      {/* ═══════ NAVIGATION ═══════ */}
      {sectionTitle('Navigation')}
      <List sx={{ bgcolor: 'surface.surfaceContainer', borderRadius: '16px', overflow: 'hidden', mb: 1 }}>
        <ListItem sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><ViewDay color="primary" /></ListItemIcon>
          <ListItemText primary="Floating Navigation Bar" primaryTypographyProps={{ fontWeight: 600 }} />
          <Switch 
            checked={!!floatingNavBar} 
            onChange={(e) => setFloatingNavBar(e.target.checked)}
            color="primary"
          />
        </ListItem>
        <Divider />
        <ListItem sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><Search color="primary" /></ListItemIcon>
          <ListItemText primary="Show Search Tab" primaryTypographyProps={{ fontWeight: 600 }} />
          <Switch 
            checked={!!navSearchEnabled} 
            onChange={(e) => setNavSearchEnabled(e.target.checked)}
            color="primary"
          />
        </ListItem>
        <Divider />
        <ListItem sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><Settings color="primary" /></ListItemIcon>
          <ListItemText primary="Show Settings Tab" primaryTypographyProps={{ fontWeight: 600 }} />
          <Switch 
            checked={!!navSettingsEnabled} 
            onChange={(e) => setNavSettingsEnabled(e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>

      {/* ═══════ ANIMATION ═══════ */}
      {sectionTitle('Animation')}
      <List sx={{ bgcolor: 'surface.surfaceContainer', borderRadius: '16px', overflow: 'hidden', mb: 1 }}>
        <ListItem sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><Animation color="primary" /></ListItemIcon>
          <ListItemText 
            primary="All Animations" 
            secondary="Page transitions, entrance effects"
            primaryTypographyProps={{ fontWeight: 600 }} 
            secondaryTypographyProps={{ fontSize: '12px' }}
          />
          <Switch 
            checked={!!animationsEnabled} 
            onChange={(e) => setAnimationsEnabled(e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>

      {/* ═══════ HOME SCREEN SECTIONS ═══════ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {sectionTitle('Home Screen Sections')}
        <Typography 
          variant="bodySmall" 
          onClick={resetHomeSections}
          sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', mt: 3, mb: 1.5, mr: 1, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}
        >
          Reset
        </Typography>
      </Box>
      <List sx={{ bgcolor: 'surface.surfaceContainer', borderRadius: '16px', overflow: 'hidden', mb: 1, p: 0 }}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={homeSections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {homeSections.map((section, index) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                index={index}
                selectedGenres={selectedGenres}
                toggleHomeSection={toggleHomeSection}
              />
            ))}
          </SortableContext>
        </DndContext>
      </List>

      {/* ═══════ DATA ═══════ */}
      {sectionTitle('Data')}
      <List sx={{ bgcolor: 'surface.surfaceContainer', borderRadius: '16px', overflow: 'hidden', mb: 1 }}>
        <ListItemButton sx={{ py: 2 }} onClick={() => setConfirmDialog('history')}>
          <ListItemIcon sx={{ minWidth: 40 }}><DeleteSweep /></ListItemIcon>
          <ListItemText primary="Clear Watch History" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
        
        <Divider />
        
        <ListItemButton sx={{ py: 2 }} onClick={() => setConfirmDialog('reset')}>
          <ListItemIcon sx={{ minWidth: 40 }}><RestartAlt color="error" /></ListItemIcon>
          <ListItemText primary="Reset Recommendations" primaryTypographyProps={{ color: 'error', fontWeight: 600 }} />
        </ListItemButton>
        
        <Divider />
        
        <ListItemButton sx={{ py: 2 }} onClick={() => setConfirmDialog('delete')}>
          <ListItemIcon sx={{ minWidth: 40 }}><DeleteForever color="error" /></ListItemIcon>
          <ListItemText primary="Delete Account" primaryTypographyProps={{ color: 'error', fontWeight: 600 }} />
        </ListItemButton>
      </List>

      <Typography variant="labelMedium" color="text.secondary" align="center" 
        sx={{ mt: 4, display: 'block', opacity: 0.6 }}>
        Cinemora v2.1.0
      </Typography>

      <ConfirmDialog
        open={confirmDialog === 'history'}
        title="Clear History?"
        content="Are you sure you want to clear your watch history? This cannot be undone."
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmDialog(null)}
      />

      <ConfirmDialog
        open={confirmDialog === 'reset'}
        title="Reset Recommendations?"
        content="This will clear your genres, watchlist, favorites, and history. You will be taken back to the onboarding screen."
        onConfirm={handleResetRecommendations}
        onCancel={() => setConfirmDialog(null)}
        confirmText="Reset"
      />

      <ConfirmDialog
        open={confirmDialog === 'delete'}
        title="Delete Account?"
        content="This will permanently delete all your data, including watch history, favorites, and profile. This action cannot be undone."
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDialog(null)}
        confirmText="Delete"
      />
    </Box>
  );
}
