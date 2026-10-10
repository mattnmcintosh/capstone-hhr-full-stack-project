import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, List, ListItem, ListItemText, ListItemIcon, Checkbox, TextField, Button, IconButton, Chip, Divider } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { apiFetch } from '../utils/api';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const sortItemsByPriority = (itemsArray) => {
    return [...itemsArray].sort((a, b) => b.priority_score - a.priority_score);
  };

  // READ: Fetch items on component mount
  useEffect(() => {
    apiFetch('/items')
      .then((data) => setItems(sortItemsByPriority(data)))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // CREATE: Submit new item form
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const newItem = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({ 
          title: newTitle, 
          due_date: newDueDate ? new Date(newDueDate).toISOString() : null 
        }),
      });

      setItems((prev) => sortItemsByPriority([...prev, newItem]));
      setNewTitle('');
      setNewDueDate('');
    } catch (err) {
      console.error("Failed to create item:", err);
    }
  };

  // UPDATE: Toggle completion status (PATCH)
  const handleToggleComplete = async (itemId, currentStatus) => {
    try {
      const updated = await apiFetch(`/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !currentStatus }),
      });

      setItems((prev) => 
        sortItemsByPriority(prev.map(item => item.id === itemId ? updated : item))
      );
    } catch (err) {
      console.error("Failed to update item status:", err);
    }
  };

  // START EDITING: Populate inline form fields
  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditDueDate(item.due_date ? item.due_date.slice(0, 16) : '');
  };

  // CANCEL EDITING
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditTitle('');
    setEditDueDate('');
  };

  // SAVE EDIT: Submit updated title and/or due date (PATCH)
  const handleSaveEdit = async (itemId) => {
    if (!editTitle.trim()) return;

    try {
      const updated = await apiFetch(`/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle,
          due_date: editDueDate ? new Date(editDueDate).toISOString() : null
        }),
      });

      setItems((prev) => 
        sortItemsByPriority(prev.map(item => item.id === itemId ? updated : item))
      );
      handleCancelEdit();
    } catch (err) {
      console.error("Failed to update item details:", err);
    }
  };

  // DELETE: Remove item
  const handleDelete = async (itemId) => {
    try {
      await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter(item => item.id !== itemId));
      if (editingItemId === itemId) handleCancelEdit();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PlaylistAddCheckIcon sx={{ mr: 1.5, color: '#e74c3c', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Queue
        </Typography>
      </Box>

      {/* Creation Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Add New Task</Typography>
        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField 
            label="Task Title" 
            variant="outlined" 
            size="small" 
            sx={{ flexGrow: 2 }}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                Due Date (Optional)
          </Typography>
          <TextField 
            type="datetime-local" 
            size="small" 
            sx={{ flexGrow: 1 }}
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <Button variant="contained" type="submit" sx={{ bgcolor: '#2c3e50' }}>Add to Queue</Button>
        </Box>
      </Paper>

      {/* Item Display List */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Active Priority Queue ({items.length} items)
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {items.map((item) => {
            const isEditing = editingItemId === item.id;
            const isUrgent = item.due_date !== null;

            return (
              <ListItem 
                key={item.id} 
                sx={{ 
                  bgcolor: isEditing ? '#e3f2fd' : '#fafafa', 
                  mb: 1.5, 
                  borderRadius: 1,
                  borderLeft: isUrgent ? '5px solid #e74c3c' : '5px solid #3498db',
                  flexDirection: isEditing ? 'column' : 'row',
                  alignItems: isEditing ? 'stretch' : 'center',
                  p: isEditing ? 2 : 2
                }}
                secondaryAction={
                  !isEditing && (
                    <Box>
                      <IconButton edge="end" onClick={() => handleStartEdit(item)} sx={{ mr: 1 }}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  )
                }
              >
                {isEditing ? (
                  /* Inline Edit Form Layout */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', pr: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Edit Task</Typography>
                    <TextField 
                      label="Task Title"
                      size="small"
                      fullWidth
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                        Due Date
                      </Typography>
                      <TextField 
                        type="datetime-local" 
                        size="small" 
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveEdit(item.id)}
                        sx={{ bgcolor: '#2c3e50' }}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="inherit" 
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  /* Normal Display Layout */
                  <>
                    <ListItemIcon>
                      <Checkbox 
                        edge="start" 
                        checked={item.is_completed} 
                        onChange={() => handleToggleComplete(item.id, item.is_completed)}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      secondary={
                        item.due_date 
                          ? `Due: ${new Date(item.due_date).toLocaleString()} | Priority Score: ${item.priority_score.toFixed(1)}` 
                          : `Untimed (Staleness Queue) | Priority Score: ${item.priority_score.toFixed(1)}`
                      }
                      primaryTypographyProps={{ 
                        sx: { 
                          fontWeight: 'medium',
                          textDecoration: item.is_completed ? 'line-through' : 'none',
                          color: item.is_completed ? 'text.disabled' : 'text.primary'
                        } 
                      }}
                    />
                    {isUrgent && (
                      <Chip 
                        icon={<WarningAmberIcon />} 
                        label="Countdown Active" 
                        size="small" 
                        color="error" 
                        variant="outlined" 
                        sx={{ mr: 10 }}
                      />
                    )}
                  </>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}