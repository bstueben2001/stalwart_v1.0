import { createContext, useContext, useEffect, useState } from 'react';
import { fetchHealthGoals, createHealthGoal, updateHealthGoal, deleteHealthGoal } from './api/health';
import { fetchBattleItems, createBattleItem, updateBattleItem, deleteBattleItem, slayBattleItem, getBattleKills } from './api/battle';
import { signup as apiSignup, login as apiLogin } from './api/auth';

export const CATEGORIES = [
  { id: 'health',        label: 'Health',        color: '#4caf82' },
  { id: 'battle',        label: 'Battle',        color: '#e05c5c' },
  { id: 'diplomacy',     label: 'Diplomacy',     color: '#5b8de8' },
  { id: 'economic',      label: 'Economic',      color: '#d4a017' },
  { id: 'romantic',      label: 'Romantic',      color: '#d46fa0' },
  { id: 'entertainment', label: 'Entertainment', color: '#9b6bd4' },
  { id: 'general',       label: 'General',       color: '#8888a0' },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [killCounts, setKillCounts] = useState({});
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('stalwart_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  function openAuth(tab = 'login') { setAuthTab(tab); setShowAuth(true); }
  function closeAuth() { setShowAuth(false); }

  async function signup(username, email, password) {
    const data = await apiSignup(username, email, password);
    localStorage.setItem('stalwart_token', data.token);
    localStorage.setItem('stalwart_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(identifier, password) {
    const data = await apiLogin(identifier, password);
    localStorage.setItem('stalwart_token', data.token);
    localStorage.setItem('stalwart_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('stalwart_token');
    localStorage.removeItem('stalwart_user');
    setUser(null);
  }

  useEffect(() => {
    if (!user) {
      setCalendarEvents([]);
      setKillCounts({});
      return;
    }
    Promise.all([fetchHealthGoals(), fetchBattleItems(), getBattleKills()])
      .then(([health, battle, kills]) => {
        setCalendarEvents([...health, ...battle]);
        setKillCounts(kills);
      })
      .catch(console.error);
  }, [user]);

  async function addCalendarEvent(event) {
    if (event.category === 'health') {
      const tempId = crypto.randomUUID();
      setCalendarEvents(prev => [...prev, { ...event, id: tempId }]);
      try {
        const created = await createHealthGoal(event);
        setCalendarEvents(prev => prev.map(e => e.id === tempId ? created : e));
      } catch (err) {
        console.error(err);
        setCalendarEvents(prev => prev.filter(e => e.id !== tempId));
      }
    } else if (event.category === 'battle') {
      const tempId = crypto.randomUUID();
      setCalendarEvents(prev => [...prev, { ...event, id: tempId }]);
      try {
        const created = await createBattleItem(event);
        setCalendarEvents(prev => prev.map(e => e.id === tempId ? created : e));
      } catch (err) {
        console.error(err);
        setCalendarEvents(prev => prev.filter(e => e.id !== tempId));
      }
    } else {
      setCalendarEvents(prev => [...prev, { ...event, id: crypto.randomUUID() }]);
    }
  }

  function editCalendarEvent(id, updates) {
    const event = calendarEvents.find(e => e.id === id);
    if (event?.category === 'health') updateHealthGoal(id, updates).catch(console.error);
    else if (event?.category === 'battle') updateBattleItem(id, updates).catch(console.error);
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }

  function deleteCalendarEvent(id) {
    const event = calendarEvents.find(e => e.id === id);
    if (event?.category === 'health') deleteHealthGoal(id).catch(console.error);
    else if (event?.category === 'battle') deleteBattleItem(id).catch(console.error);
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }

  async function slayCalendarEvent(id) {
    const event = calendarEvents.find(e => e.id === id);
    if (event?.category === 'battle') {
      try {
        const { difficulty } = await slayBattleItem(id);
        setKillCounts(prev => ({ ...prev, [difficulty]: (prev[difficulty] || 0) + 1 }));
      } catch (err) {
        console.error(err);
      }
    }
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <AppContext.Provider value={{
      calendarEvents, addCalendarEvent, editCalendarEvent, deleteCalendarEvent, slayCalendarEvent,
      killCounts,
      user, signup, login, logout,
      showAuth, authTab, openAuth, closeAuth,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
