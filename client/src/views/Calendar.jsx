import { useState, useEffect } from 'react';
import { Typography, Paper, Box, TextField, Button, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import { apiFetch } from '../utils/api';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  const icsUrl = `http://localhost:5555/api/calendar.ics?token=${localStorage.getItem('jwt_token')}`

  const sortEventsByStartDate = (eventsArray) => {
    return [...eventsArray].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  // Fetch events on mount
useEffect(() => {
    apiFetch('/events')
      .then((data) => setEvents(sortEventsByStartDate(data)))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // Create Event Form Submission
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;

    const payload = {
      title,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      description
    };

    try {
      if (editingEventId) {
        // UPDATE (PATCH)
        const updatedEvent = await apiFetch(`/events/${editingEventId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setEvents((prev) => sortEventsByStartDate(prev.map(ev => ev.id === editingEventId ? updatedEvent : ev)));
        setEditingEventId(null);
      } else {
        // CREATE (POST)
        const newEvent = await apiFetch('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setEvents((prev) => sortEventsByStartDate([...prev, newEvent]));
      }

      // Reset form
      setTitle('');
      setStartTime('');
      setEndTime('');
      setDescription('');
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleStartEdit = (event) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    // Format ISO string to match HTML datetime-local input (YYYY-MM-DDThh:mm)
    setStartTime(event.start_time ? event.start_time.slice(0, 16) : '');
    setEndTime(event.end_time ? event.end_time.slice(0, 16) : '');
    setDescription(event.description || '');
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setDescription('');
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      setEvents((prev) => sortEventsByStartDate(prev.filter(e => e.id !== eventId)));
      if (editingEventId === eventId) handleCancelEdit();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarMonthIcon sx={{ mr: 1.5, color: '#2c3e50', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Calendar & .ics File
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#fff3cd', borderLeft: '5px solid #f39c12' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Native Calendar ICS Files
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            href={icsUrl} 
            target="_blank"
          >
            Download .ics File
          </Button>
        </Box>
      </Paper>

      {/* Create / Edit Event Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingEventId ? 'Edit Calendar Block' : 'Schedule Calendar Block'}
        </Typography>
        <Box component="form" onSubmit={handleSubmitEvent} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Event Title" 
            size="small" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>Start Time</Typography>
              <TextField 
                type="datetime-local" 
                size="small" 
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>End Time</Typography>
              <TextField 
                type="datetime-local" 
                size="small" 
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Box>
          </Box>
          <TextField 
            label="Description / Notes" 
            size="small" 
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" type="submit" sx={{ bgcolor: editingEventId ? '#3498db' : '#e74c3c' }}>
              {editingEventId ? 'Update Block' : 'Add Calendar Block'}
            </Button>
            {editingEventId && (
              <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Event List Display */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Active Calendar Blocks ({events.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {events.map((event) => (
            <ListItem 
              key={event.id}
              sx={{ 
                bgcolor: editingEventId === event.id ? '#e3f2fd' : '#fafafa', 
                mb: 1.5, 
                borderRadius: 1, 
                borderLeft: '5px solid #3498db' 
              }}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleStartEdit(event)} sx={{ mr: 1 }}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteEvent(event.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText 
                primary={event.title}
                secondary={`From: ${new Date(event.start_time).toLocaleString()} | To: ${new Date(event.end_time).toLocaleString()}`}
                primaryTypographyProps={{ sx: { fontWeight: 'medium' } }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}