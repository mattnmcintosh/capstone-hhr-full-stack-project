import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, TextField, Button, Checkbox,  IconButton, List, ListItem, ListItemText, Divider, Chip, Alert} from '@mui/material';
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
    return [...itemsArray].sort((a, b) => b.priority_score - a.priority_score);
  };

  // READ: Fetch items on component mount
  useEffect(() => {
    apiFetch('/items')
      .then((data) => setItems(sortItems(data)))
      .catch((err) => console.error("Error fetching items:", err));
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
      setItems((prev) => prev.filter(i => i.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // FILTER LOGIC
  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.is_completed;
    if (filter === 'completed') return item.is_completed;
    if (filter === 'urgent') return !item.is_completed && item.priority_score > 50;
    return true; // 'all'
  });

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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" type="submit" sx={{ bgcolor: editingId ? '#3498db' : '#e74c3c' }}>
              {editingId ? 'Update Item' : 'Enqueue'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
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
              color={filter === 'completed' ? 'completed' : 'default'} 
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
              // Color indicator based on priority score intensity
              let borderColor = '#3498db';
              if (!item.is_completed) {
                if (item.priority_score > 50) borderColor = '#e74c3c'; // Red (High)
                else if (item.priority_score > 20) borderColor = '#f39c12'; // Orange (Med)
              } else {
                borderColor = '#2ecc71'; // Green (Completed)
              }

              return (
                <ListItem 
                  key={item.id}
                  sx={{ 
                    bgcolor: editingId === item.id ? '#e3f2fd' : '#fafafa', 
                    mb: 1.5, 
                    borderRadius: 1, 
                    borderLeft: `5px solid ${borderColor}`,
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
                      <Box component="span" sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                        {item.due_date && (
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(item.due_date).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{ 
                      sx: { 
                        fontWeight: 'medium', 
                        textDecoration: item.is_completed ? 'line-through' : 'none' 
                      } 
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