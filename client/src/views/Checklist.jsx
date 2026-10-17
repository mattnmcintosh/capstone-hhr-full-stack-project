import { useState, useEffect } from 'react';
import {Typography, Paper, Box, TextField, Button, Checkbox, IconButton, List, ListItem, ListItemText, Divider, Chip, Alert} from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { apiFetch } from '../utils/api';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');

const sortItems = (itemsArray) => {
    return [...itemsArray].sort((a, b) => {
      const scoreA = a.priority_score || 0;
      const scoreB = b.priority_score || 0;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      
      return 0;
    });
  };
  

  // READ: Fetch items on component mount
  useEffect(() => {
    apiFetch('/items?page=1&per_page=50')
      .then((data) => {
        // Ensure we explicitly extract the array from the paginated response
        const itemsArray = Array.isArray(data) ? data : (data.items || []);
        setItems(sortItems(itemsArray));
      })
      .catch((err) => console.error("Error fetching checklist items:", err));
  }, []);

  // CREATE: Submit new item form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (editingId) {
        // UPDATE (PATCH)
        const updated = await apiFetch(`/items/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setItems((prev) => sortItems(prev.map(i => i.id === editingId ? updated : i)));
        setEditingId(null);
      } else {
        // CREATE (POST)
        const newItem = await apiFetch('/items', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setItems((prev) => sortItems([...prev, newItem]));
      }

      setTitle('');
      setDueDate('');
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  };

  // UPDATE: Toggle completion status (PATCH)
  const handleToggleComplete = async (item) => {
    try {
      const updated = await apiFetch(`/items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !item.is_completed }),
      });
      setItems((prev) => sortItems(prev.map(i => i.id === item.id ? updated : i)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // START EDITING: Populate inline form fields
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDueDate(item.due_date ? item.due_date.slice(0, 16) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CANCEL EDITING
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDueDate('');
  };

  // DELETE: Remove item
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/items/${id}`, { method: 'DELETE' });
      setItems((prev) => sortItems(prev.filter(i => i.id !== id)));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // FILTER LOGIC
  const filteredItems = Array.isArray(items) ? items.filter(item => {
    if (filter === 'completed') return item.is_completed;
    if (filter === 'pending') return !item.is_completed; // Fixed from 'active' to 'pending'
    if (filter === 'urgent') return (item.priority_score || 0) > 50;
    return true; // 'all'
  }) : [];


  // LOAD SAMPLES: Quick seed action for live demos
  const handleLoadSamples = async () => {
    try {
      const newItems = await apiFetch('/items/seed', { method: 'POST' });
      // Ensure newItems is an array before spreading
      const incomingArray = Array.isArray(newItems) ? newItems : (newItems.items || []);
      setItems((prev) => sortItems([...prev, ...incomingArray]));
    } catch (err) {
      console.error("Failed to load sample items:", err);
    }
  };

  // CLEAR SAMPLES: Remove only the demo seed items
  const handleClearSamples = async () => {
    try {
      await apiFetch('/items/seed', { method: 'DELETE' });
      // Re-fetch items or filter them out of state locally
      const sampleTitles = [
        "Fix the mysterious 404 router redirect bug",
        "Refactor legacy spaghetti code before demo day",
        "Buy coffee beans so human function doesn't cease",
        "Schedule dentist appointment I've avoided for 6 months",
        "Prepare slide deck for Saturday's capstone review",
        "Clean out the keyboard crumbs",
        "Organize VS Code extension clutter",
        "Read chapter on clean architecture",
        "Back up database dump to secure drive",
        "Stare blankly at the wall for 10 minutes to reset brain"
      ];
      setItems((prev) => sortItems(prev.filter(i => !sampleTitles.includes(i.title))));
    } catch (err) {
      console.error("Failed to clear sample items:", err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PlaylistAddCheckIcon sx={{ mr: 1.5, color: '#2c3e50', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          The Queue
        </Typography>
      </Box>

      {/* Create / Edit Form Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Item' : 'Add New'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="What are you working on?" 
            size="small" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
              Deadline (Optional - increases urgency score)
            </Typography>
            <TextField 
              type="datetime-local" 
              size="small" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" type="submit" sx={{ bgcolor: editingId ? '#3498db' : '#e74c3c' }}>
              {editingId ? 'Update Item' : 'Enqueue'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
            <Button variant="outlined" color="secondary" onClick={handleLoadSamples}>
              Load Samples 🚀
            </Button>
            {/* 🗑️ Clear Samples Button */}
            <Button variant="outlined" color="error" onClick={handleClearSamples}>
              Clear Samples 🧹
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Queue Display & Filter Chips Card */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Active Queue ({filteredItems.length})
          </Typography>

          {/* Quick-Filter Toolbar Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`All (${items.length})`} 
              onClick={() => setFilter('all')} 
              color={filter === 'all' ? 'primary' : 'default'} 
              variant={filter === 'all' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip 
              label={`Pending (${items.filter(i => !i.is_completed).length})`} 
              onClick={() => setFilter('pending')} 
              color={filter === 'pending' ? 'primary' : 'default'} 
              variant={filter === 'pending' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip 
              label={`Completed (${items.filter(i => i.is_completed).length})`} 
              onClick={() => setFilter('completed')} 
              color={filter === 'completed' ? 'success' : 'default'} 
              variant={filter === 'completed' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip 
              label="High Priority ⚡" 
              onClick={() => setFilter('urgent')} 
              color={filter === 'urgent' ? 'error' : 'default'} 
              variant={filter === 'urgent' ? 'filled' : 'outlined'}
              size="small"
            />
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {filteredItems.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No items found under this filter.
          </Alert>
        ) : (
          <List disablePadding>
            {filteredItems.map((item) => {
              let borderColor = '#3498db';
              if (!item.is_completed) {
                if (item.priority_score > 50) borderColor = '#e74c3c'; 
                else if (item.priority_score > 20) borderColor = '#f39c12'; 
              } else {
                borderColor = '#2ecc71'; 
              }

              return (
                <ListItem 
                    key={item.id}
                    sx={{ 
                      bgcolor: '#ffffff', 
                      color: '#000000',   
                      border: '2px solid #3498db', 
                      mb: 1.5, 
                      borderRadius: 2, 
                      boxShadow: 1,
                      opacity: item.is_completed ? 0.7 : 1,
                    }}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleStartEdit(item)} sx={{ mr: 1 }}>
                          <EditIcon color="primary" fontSize="small" />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <Checkbox 
                      checked={item.is_completed}
                      onChange={() => handleToggleComplete(item)}
                      color="success"
                    />
                    <ListItemText 
                      primary={item.title}
                      secondary={
                        item.due_date ? `Due: ${new Date(item.due_date).toLocaleString()}` : 'No deadline'
                      }
                      primaryTypographyProps={{ 
                        sx: { fontWeight: 'bold', color: '#2c3e50' } 
                      }}
                    />
                  </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}