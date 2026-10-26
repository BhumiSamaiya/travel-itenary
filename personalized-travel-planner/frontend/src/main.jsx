import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Compass, MapPin, CalendarDays, Wallet, Sparkles, Bookmark, Clock3, Utensils, Camera, Mountain, RefreshCw, ArrowUpRight, Plane, Users } from 'lucide-react';
import './styles.css';

const interestsList = ['Food', 'Culture', 'Nature', 'Adventure', 'Scenic'];
const sample = { destination:'Jaipur, India', start_date:'2026-11-14', end_date:'2026-11-16', budget:12000, travel_style:'Balanced', group_size:1, interests:['Food','Culture','Scenic'] };
function App() {
  const [form, setForm] = useState(sample);
  const [trip, setTrip] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('savedTrips') || '[]'));
  const [notice, setNotice] = useState('');
  const update = (key, value) => setForm(p => ({...p, [key]:value}));
  async function generate(e) {
    e?.preventDefault(); setBusy(true); setNotice('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/itinerary', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, destination:form.destination.split(',')[0]})});
      if (!res.ok) throw new Error((await res.json()).detail || 'Could not generate itinerary');
      const data = await res.json(); setTrip(data); setNotice('Your itinerary is ready.');
    } catch (err) {
      // Friendly local fallback so the UI can be previewed before the API is running.
      const days = Math.max(1, Math.min(14, Math.round((new Date(form.end_date)-new Date(form.start_date))/86400000)+1));
      const activities = [
        ['09:00','Breakfast & local coffee','Food','Start the day with a relaxed local breakfast.'],
        ['10:30','Heritage district walk','Culture','Explore a landmark area at your own pace.'],
        ['13:00','Regional lunch','Food','Try a local specialty; confirm opening hours.'],
        ['15:30','Museum or scenic viewpoint','Sightseeing','Choose a nearby highlight based on your interests.'],
        ['18:00','Golden-hour stroll','Nature','Take a break and enjoy the surroundings.']
      ];
      setTrip({destination:form.destination.split(',')[0], budget:Number(form.budget), estimated_total:Math.min(Number(form.budget),days*70*Number(form.group_size)), note:'Preview mode: start the FastAPI backend for API-generated results. All costs and suggestions are illustrative.',days:Array.from({length:days},(_,i)=>({day:i+1,date:new Date(new Date(form.start_date).getTime()+i*86400000).toISOString().slice(0,10),title:`Day ${i+1} · Discover ${form.destination.split(',')[0]}`,activities:activities.map((a,j)=>({time:a[0],title:a[1],category:a[2],description:a[3],estimated_cost:j%2?12*form.group_size:18*form.group_size}))}))});
      setNotice('Preview itinerary generated. Start the backend for full API mode.');
    } finally { setBusy(false); }
  }
  function save() {
    if (!trip) return;
    const next = [{...trip, id:Date.now(), createdAt:new Date().toLocaleDateString()}, ...saved].slice(0,8);
    setSaved(next); localStorage.setItem('savedTrips',JSON.stringify(next)); setNotice('Trip saved on this browser.');
  }
  useEffect(()=>{ if (!trip) generate(); }, []);
  const totalActivities = trip?.days?.reduce((n,d)=>n+d.activities.length,0) || 0;
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Compass size={22}/></div><span>wayfarer<span className="dot">.</span></span></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav active"><Sparkles size={17}/> Trip planner</button>
      <button className="nav" onClick={()=>document.getElementById('saved').scrollIntoView({behavior:'smooth'})}><Bookmark size={17}/> Saved trips <span className="nav-count">{saved.length}</span></button>
      <div className="sidebar-bottom"><div className="mini-avatar">W</div><div><b>Welcome, traveler</b><small>Your next story starts here</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Trip planner</div><div className="profile"><span className="status-dot"></span> Your personal travel studio <div className="avatar">W</div></div></header>
      <section className="hero"><div><div className="eyebrow"><Sparkles size={14}/> YOUR NEXT ADVENTURE, DESIGNED</div><h1>Make room for<br/><em>the unexpected.</em></h1><p>A thoughtful itinerary, shaped around your pace, passions, and budget.</p></div><div className="hero-art"><div className="sun"></div><div className="hill h1"></div><div className="hill h2"></div><div className="hero-stamp"><Compass size={23}/><span>GO<br/>BEYOND</span></div></div></section>
      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-head"><div><span className="step">01</span><h2>Build your trip</h2></div><span className="soft-pill">SMART PLANNER</span></div>
          <form onSubmit={generate}>
            <label>WHERE TO? <div className="input-wrap"><MapPin size={17}/><input value={form.destination} onChange={e=>update('destination',e.target.value)} placeholder="City or destination" required minLength="2"/></div></label>
            <div className="two-col"><label>ARRIVAL <div className="input-wrap"><CalendarDays size={16}/><input type="date" value={form.start_date} onChange={e=>update('start_date',e.target.value)} required/></div></label><label>DEPARTURE <div className="input-wrap"><CalendarDays size={16}/><input type="date" value={form.end_date} min={form.start_date} onChange={e=>update('end_date',e.target.value)} required/></div></label></div>
            <div className="two-col"><label>YOUR BUDGET (₹) <div className="input-wrap"><Wallet size={16}/><input type="number" min="1" value={form.budget} onChange={e=>update('budget',e.target.value)} required/></div></label><label>TRAVELERS <div className="input-wrap"><Users size={16}/><select value={form.group_size} onChange={e=>update('group_size',Number(e.target.value))}>{[1,2,3,4,5,6,8,10].map(n=><option key={n} value={n}>{n} {n===1?'traveler':'travelers'}</option>)}</select></div></label></div>
            <label>TRAVEL VIBE <div className="style-options">{['Relaxed','Balanced','Packed'].map(s=><button type="button" className={form.travel_style===s?'style selected':'style'} onClick={()=>update('travel_style',s)} key={s}>{s}</button>)}</div></label>
            <label>WHAT ARE YOU INTO? <div className="chips">{interestsList.map(i=><button type="button" key={i} className={form.interests.includes(i)?'chip chosen':'chip'} onClick={()=>update('interests',form.interests.includes(i)?form.interests.filter(x=>x!==i):[...form.interests,i])}>{i}</button>)}</div></label>
            <button className="generate" type="submit" disabled={busy}><Sparkles size={17}/>{busy?'Crafting your trip...':'Generate my itinerary'} <ArrowUpRight size={17}/></button>
            <p className="privacy"><span>✦</span> Made for your kind of journey. No two trips need to be alike.</p>
          </form>
        </section>
        <section className="itinerary-section">
          <div className="section-title"><div><span className="step">02</span><h2>Your itinerary</h2></div><button className="icon-btn" onClick={()=>generate()} title="Regenerate"><RefreshCw size={16}/></button></div>
          {trip && <><div className="trip-summary"><div className="trip-image"><div className="image-sun"></div><div className="image-mountain"></div><span><MapPin size={13}/> YOUR ESCAPE</span></div><div className="trip-info"><div className="trip-dest">{trip.destination}</div><div className="trip-dates"><CalendarDays size={14}/> {form.start_date} — {form.end_date}</div><div className="trip-stats"><div><small>EST. BUDGET</small><b>₹{Number(trip.estimated_total||0).toLocaleString('en-IN')}</b></div><div><small>TRIP LENGTH</small><b>{trip.days.length} days</b></div></div></div></div>
          <div className="day-list">{trip.days.slice(0,4).map(day=><article className="day-card" key={day.day}><div className="day-heading"><div className="day-number">{String(day.day).padStart(2,'0')}</div><div><h3>{day.title}</h3><small>{day.date}</small></div><span className="activity-count">{day.activities.length} stops</span></div><div className="activities">{day.activities.slice(0,4).map((a,i)=><div className="activity" key={i}><div className="timeline"><span className="timeline-dot"></span>{i<a.length-1&&<span className="timeline-line"></span>}</div><div className="activity-time">{a.time}</div><div className="activity-icon">{a.category==='Food'?<Utensils size={15}/>:a.category==='Nature'?<Mountain size={15}/>:<Camera size={15}/>}</div><div className="activity-copy"><b>{a.title}</b><small>{a.description}</small></div><div className="activity-cost">₹{Number(a.estimated_cost||0).toLocaleString('en-IN')}</div></div>)}</div></article>)}</div>
          <div className="action-row"><button className="save-btn" onClick={save}><Bookmark size={16}/> Save this trip</button><span><Clock3 size={14}/> {totalActivities} planned activities</span></div><p className="disclaimer">{trip.note}</p></>}
          <div id="saved" className="saved-section"><div className="saved-title"><h3>Saved trips</h3><span>{saved.length}</span></div>{saved.length===0?<p className="empty">Your saved adventures will show up here.</p>:saved.map(s=><button className="saved-item" key={s.id} onClick={()=>{setTrip(s);setNotice('Saved trip opened.')}}><MapPin size={15}/><span>{s.destination}</span><small>{s.createdAt}</small></button>)}</div>
          {notice&&<div className="notice">{notice}</div>}
        </section>
      </div>
      <footer>WAYFARER © 2026 <span>PLAN LESS. EXPERIENCE MORE.</span></footer>
    </main>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
