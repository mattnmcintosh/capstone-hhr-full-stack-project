import { useState, useEffect } from 'react';
import { Typography, Paper, Box, TextField, Button, Divider, Alert, Chip, IconButton, List, ListItem, ListItemText } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiFetch } from '../utils/api';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [copied, setCopied] = useState(false);

  const icsUrl = `http://localhost:5555/api/calendar.ics?token=${localStorage.getItem('jwt_token')}`

  // Fetch events on mount
useEffect(() => {
    Promise.all([apiFetch('/events'), apiFetch('/items')])
      .then(([eventsData, itemsData]) => {
        // Unpack items safely
        const items = itemsData.items || itemsData;
        
        // Now it's 100% safe to call .filter()
        const pendingItems = items.filter(i => !i.is_completed);
        
        // ... rest of your calendar mapping code
      })
      .catch((err) => console.error("Error fetching calendar data:", err));
  }, []);

  // Handle Create or Update submission
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
        setEvents((prev) => prev.map(ev => ev.id === editingEventId ? updatedEvent : ev));
        setEditingEventId(null);
      } else {
        // CREATE (POST)
        const newEvent = await apiFetch('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setEvents((prev) => [...prev, newEvent]);
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

  // Populate form fields when an event is clicked on the grid or list
  const handleStartEdit = (eventObj) => {
    // Note: If triggered from FullCalendar's eventClick, the ID is in eventObj.id (e.g., "event-5")
    // If triggered from the list below, it's just the numeric id.
    let targetId = eventObj.id;

    // If coming from FullCalendar click handler format
    if (typeof targetId === 'string' && targetId.startsWith('task-')) {
      alert("Checklist item deadlines must be edited from the Queue tab.");
      return;
    }
    if (typeof targetId === 'string' && targetId.startsWith('event-')) {
      targetId = parseInt(targetId.replace('event-', ''), 10);
    }

    const found = events.find(ev => ev.id === targetId);
    if (!found) return;

    setEditingEventId(found.id);
    setTitle(found.title);
    setStartTime(found.start_time ? found.start_time.slice(0, 16) : '');
    setEndTime(found.end_time ? found.end_time.slice(0, 16) : '');
    setDescription(found.description || '');

    // Scroll smoothly down to the form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
      setEvents((prev) => prev.filter(e => e.id !== eventId));
      if (editingEventId === eventId) handleCancelEdit();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const copyIcsLink = () => {
    navigator.clipboard.writeText(icsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Map custom user events
  const formattedEvents = events.map(ev => ({
    id: `event-${ev.id}`,
    title: ev.title,
    start: ev.start_time,
    end: ev.end_time,
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
    extendedProps: { type: 'custom', description: ev.description }
  }));

  // Map incomplete checklist item due dates
  const formattedDeadlines = items
    .filter(item => item.due_date && !item.is_completed)
    .map(item => {
      let color = '#f39c12';
      if (item.priority_score > 50) color = '#e74c3c';
      else if (item.priority_score < 20) color = '#95a5a6';

      return {
        id: `task-${item.id}`,
        title: `⚡ [Deadline] ${item.title}`,
        start: item.due_date,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { type: 'deadline', priorityScore: item.priority_score }
      };
    });

  const allCalendarEvents = [...formattedEvents, ...formattedDeadlines];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarMonthIcon sx={{ mr: 1.5, color: '#2c3e50', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Visual Schedule & .ics Feed Sync
        </Typography>
      </Box>

      {/* Subscription Feed Box */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#fff3cd', borderLeft: '5px solid #f39c12' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Native Calendar Subscription Feed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Subscribe to your live feed URL in Apple Calendar, Google Calendar, or Outlook to sync these visual blocks.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField 
            size="small" 
            value={icsUrl} 
            InputProps={{ readOnly: true }} 
            sx={{ flexGrow: 1, bgcolor: '#fff' }} 
          />
          <Button 
            variant="contained" 
            startIcon={<ContentCopyIcon />} 
            onClick={copyIcsLink}
            sx={{ bgcolor: '#2c3e50' }}
          >
            Copy Feed URL
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            href={icsUrl} 
            target="_blank"
          >
            Download .ics File
          </Button>
        </Box>
        {copied && <Alert severity="success" sx={{ mt: 2 }}>Feed URL copied to clipboard!</Alert>}
      </Paper>

      {/* FullCalendar Visual Grid with clickHandler */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Schedule & Deadlines Grid (Click any event to edit)</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip size="small" sx={{ bgcolor: '#3498db', color: '#fff' }} label="Custom Event" />
            <Chip size="small" sx={{ bgcolor: '#e74c3c', color: '#fff' }} label="High Priority Deadline" />
            <Chip size="small" sx={{ bgcolor: '#f39c12', color: '#fff' }} label="Pending Deadline" />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={allCalendarEvents}
          height="auto"
          eventClick={(info) => handleStartEdit(info.event)} // <--- CLICK TO EDIT TRIGGER
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </Paper>

      {/* Create / Edit Event Form */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="contained" type="submit" sx={{ bgcolor: editingEventId ? '#3498db' : '#e74c3c' }}>
              {editingEventId ? 'Update Block' : 'Add Calendar Block'}
            </Button>
            {editingEventId && (
              <>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteEvent(editingEventId)}
                >
                  Delete Block
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}