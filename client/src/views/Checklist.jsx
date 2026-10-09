import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, List, ListItem, ListItemText, ListItemIcon, Checkbox, TextField, Button, IconButton, Chip, Divider } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const userId = 1; // Default user ID for MVP testing

  // READ: Fetch items on component mount
  useEffect(() => {
    fetch(`http://localhost:5555/api/users/${userId}/items`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // CREATE: Submit new item form
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`http://localhost:5555/api/users/${userId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, 
          due_date: newDueDate ? new Date(newDueDate).toISOString() : null 
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems((prev) => sortItemsByPriority([...prev, newItem]));
        setNewTitle('');
        setNewDueDate('');
      }
    } catch (err) {
      console.error("Failed to create item:", err);
    }
  };

  // UPDATE: Toggle completion status (PATCH)
  const handleToggleComplete = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5555/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !currentStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItems((prev) => sortItemsByPriority(prev.map(item => item.id === itemId ? updated : item)));
      }
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  // DELETE: Remove item
  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5555/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems((prev) => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const sortItemsByPriority = (itemsArray) => {
        return [...itemsArray].sort((a, b) => b.priority_score - a.priority_score);
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
            const isUrgent = item.due_date !== null;
            return (
              <ListItem 
                key={item.id} 
                sx={{ 
                  bgcolor: '#fafafa', 
                  mb: 1.5, 
                  borderRadius: 1,
                  borderLeft: isUrgent ? '5px solid #e74c3c' : '5px solid #3498db'
                }}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                }
              >
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
                    sx={{ mr: 6 }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}