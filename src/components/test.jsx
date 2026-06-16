import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddOn from './AddOn';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { assets } from '../assets/asset.js';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { updateBookingData } from '../redux/booking/bookingSlice.js';

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');`}</style>
);

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  sidebar:    '#16151A',
  sidebarAct: '#2A2733',
  gold:       '#C9A84C',
  goldLight:  '#F0D898',
  goldFaint:  'rgba(201,168,76,0.10)',
  cream:      '#FAF8F4',
  creamDark:  '#F2EFE8',
  ink:        '#1A1917',
  inkMid:     '#4A4845',
  inkLight:   '#8A8784',
  border:     '#E8E4DC',
  borderDark: '#D4CFC4',
  white:      '#FFFFFF',
  emerald:    '#1A6B4A',
  emeraldBg:  '#EBF5F0',
  rose:       '#C0392B',
  roseBg:     '#FDF0EE',
  amber:      '#B45309',
  amberBg:    '#FEF3C7',
};

/* ─── Inline SVG Icons ─────────────────────────────────────────────────────── */
const Ic = {
  Camera:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Heart:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Leaf:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M11 20A7 7 0 0 1 4 13c0-5.5 4.5-10 10-10s10 4.5 10 10a7 7 0 0 1-7 7H11z"/><path d="M11 20V14l-2-2"/></svg>,
  Star:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Baby:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/></svg>,
  Cake:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2M12 8v2M17 8v2M7 4h.01M12 4h.01M17 4h.01"/></svg>,
  Grid:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Cart:     () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  ArrowR:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Pin:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Menu:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Check:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Sparkle:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  ChevL:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  CheckFat: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
};

/* ─── Date picker helpers ──────────────────────────────────────────────────── */
const DAYS_LABELS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const parseYMD  = (str) => { if (!str) return null; const d = new Date(str + 'T00:00:00'); return isNaN(d) ? null : d; };
const toYMD     = (d)   => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fmtLong   = (d)   => d ? d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' }) : null;

/* ─── QuickDatePicker — DatePickerButton + Today/Tomorrow pills ───────────── */
const QuickDatePicker = ({ value, onChange, minDate, availableDates }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <DatePickerButton
        value={value}
        onChange={onChange}
        minDate={minDate}
        availableDates={availableDates}
      />
    </div>
  );
};

/* ─── DatePickerButton ─────────────────────────────────────────────────────── */
const DatePickerButton = ({ value, onChange, minDate, availableDates }) => {
  const today     = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const minD      = useMemo(() => minDate ? parseYMD(minDate) : today, [minDate, today]);
  const selectedD = useMemo(() => parseYMD(value), [value]);
  const todayYMD    = toYMD(new Date());
  const tomorrowYMD = toYMD(new Date(Date.now() + 86400000));
  const isTodayMD     = value === todayYMD;
  const isTomorrowMD  = value === tomorrowYMD;

  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState((selectedD || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedD || today).getMonth());
  const [hovDay, setHovDay]       = useState(null);
  const wrapRef                   = useRef(null);

  const QuickBtn = ({ label, active, onClick }) => {
    const [hov, setHov] = useState(false);
    return (
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        whileTap={{ scale: 0.95 }}
        className="hidden min-[540px]:block"
        style={{
          padding: '8px 18px', borderRadius: 50,
          border: `1.5px solid ${active ? T.gold : hov ? T.borderDark : T.border}`,
          background: active ? T.ink : hov ? T.creamDark : T.cream,
          color: active ? T.goldLight : hov ? T.inkMid : T.inkLight,
          fontSize: 13, fontWeight: active ? 600 : 500,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.15s', whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </motion.button>
    );
  };

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && selectedD) { setViewYear(selectedD.getFullYear()); setViewMonth(selectedD.getMonth()); }
  }, [open]);

  const prevMonth = useCallback((e) => {
    e.stopPropagation();
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  }, []);
  const nextMonth = useCallback((e) => {
    e.stopPropagation();
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();

  const isPast   = useCallback((d) => { const t = new Date(viewYear, viewMonth, d); t.setHours(0,0,0,0); return t < minD; }, [viewYear, viewMonth, minD]);
  const isToday  = useCallback((d) => { const t = new Date(viewYear, viewMonth, d); t.setHours(0,0,0,0); return t.getTime() === today.getTime(); }, [viewYear, viewMonth, today]);
  const isSel    = useCallback((d) => selectedD && selectedD.getFullYear()===viewYear && selectedD.getMonth()===viewMonth && selectedD.getDate()===d, [selectedD, viewYear, viewMonth]);
  const isAvail  = useCallback((d) => availableDates ? availableDates.has(toYMD(new Date(viewYear, viewMonth, d))) : true, [availableDates, viewYear, viewMonth]);

  const selectDay = useCallback((d) => {
    if (isPast(d)) return;
    onChange(toYMD(new Date(viewYear, viewMonth, d)));
    setOpen(false);
  }, [viewYear, viewMonth, isPast, onChange]);

  const NavBtn = ({ onClick, children }) => {
    const [hov, setHov] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: hov ? T.ink : T.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: hov ? T.gold : T.inkMid,
          transition: 'all 0.14s', flexShrink: 0,
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>

      {/* ── Trigger — BIGGER ── */}
      <motion.button
        onClick={() => setOpen(p => !p)}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: open ? T.white : T.cream,
          border: `1px solid ${open ? T.gold : T.borderDark}`,
          borderRadius: 16, padding: '10px 24px 10px 10px',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          transition: 'border-color 0.15s, background 0.15s',
          minWidth:300, Width: 380, outline: 'none',
        }}
      >
        {/* icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: T.ink ,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <span style={{ color: T.gold }}><Ic.Calendar /></span>
        </div>

        {/* text */}
        <div style={{ flex: 1, textAlign: 'left', paddingRight: '40px', paddingLeft:'30px' }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: T.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
            Shoot date
          </div>
          {value ? (
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {fmtLong(selectedD)}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: T.inkLight }}>
              Select a date
            </div>
          )}
        </div>
      <QuickBtn label="Today"    active={isTodayMD}    onClick={() => onChange(todayYMD)} />
      <QuickBtn label="Tomorrow" active={isTomorrowMD} onClick={() => onChange(tomorrowYMD)} />
      </motion.button>

      {/* ── Calendar Popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '0%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              width: 308,
              background: T.white,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* ── Dark header ── */}
            <div style={{ background: T.ink, padding: '18px 20px 14px', position: 'relative' }}>
              <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 4 }}>
                Shoot date
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#FAF8F4', fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {MONTH_NAMES[viewMonth]}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 2, letterSpacing: '1px' }}>
                {viewYear}
              </div>

              <AnimatePresence>
                {selectedD && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'absolute', top: 16, right: 18, textAlign: 'right' }}
                  >
                    <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 3 }}>
                      Selected
                    </div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: T.gold, letterSpacing: '-0.01em', lineHeight: 1 }}>
                      {selectedD.toLocaleDateString('en-IN', { weekday: 'short' })} {selectedD.getDate()}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                      {MONTH_SHORT[selectedD.getMonth()]} {selectedD.getFullYear()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Month navigation ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px 8px',
              borderBottom: `1px solid ${T.border}`,
            }}>
              <NavBtn onClick={prevMonth}><Ic.ChevL /></NavBtn>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: T.ink, letterSpacing: '-0.01em' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <NavBtn onClick={nextMonth}><Ic.ChevR /></NavBtn>
            </div>

            {/* ── Day-of-week labels ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 12px 3px' }}>
              {DAYS_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: T.inkLight, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* ── Days grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 12px 14px', gap: 2 }}>
              {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const past  = isPast(d);
                const sel   = isSel(d);
                const tod   = isToday(d);
                const avail = isAvail(d) && !past;
                const hov   = hovDay === d && !past && !sel;

                return (
                  <div
                    key={d}
                    onClick={() => !past && selectDay(d)}
                    onMouseEnter={() => !past && setHovDay(d)}
                    onMouseLeave={() => setHovDay(null)}
                    style={{
                      height: 34, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: 1,
                      fontSize: 12,
                      fontWeight: sel ? 700 : tod ? 700 : 500,
                      cursor: past ? 'default' : 'pointer',
                      userSelect: 'none',
                      border: sel
                        ? `1.5px solid ${T.ink}`
                        : tod
                        ? `1px solid rgba(201,168,76,0.4)`
                        : hov
                        ? `1px solid ${T.borderDark}`
                        : '1px solid transparent',
                      background: sel
                        ? T.ink
                        : hov
                        ? T.creamDark
                        : tod
                        ? `rgba(201,168,76,0.08)`
                        : 'transparent',
                      color: sel
                        ? T.gold
                        : past
                        ? T.borderDark
                        : tod
                        ? T.amber
                        : T.inkMid,
                      transition: 'all 0.1s',
                      position: 'relative',
                    }}
                  >
                    {d}
                    {avail && !sel && (
                      <div style={{
                        width: 3, height: 3, borderRadius: '50%',
                        background: T.emerald,
                        position: 'absolute', bottom: 4,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Footer legend + confirm ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px 14px',
              borderTop: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { color: T.emerald, label: 'Available' },
                  { color: T.gold,    label: 'Today' },
                ].map(leg => (
                  <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: T.inkLight }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: leg.color, flexShrink: 0 }} />
                    {leg.label}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedD && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '6px 16px', borderRadius: 10,
                      background: T.ink, border: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11, fontWeight: 600, color: T.gold,
                      cursor: 'pointer', letterSpacing: '0.5px',
                    }}
                  >
                    Confirm date
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Category config ──────────────────────────────────────────────────────── */
const CAT_CFG = {
  'All':          { icon: <Ic.Grid />,  accent: '#9B8EC4' },
  'Pre-Wedding':  { icon: <Ic.Heart />, accent: '#E07B9A' },
  'Maternity':    { icon: <Ic.Leaf />,  accent: '#4CAF82' },
  'Baby':         { icon: <Ic.Baby />,  accent: '#F4A340' },
  'Birthday':     { icon: <Ic.Cake />,  accent: '#D4607A' },
};
const getCat = (cat) => CAT_CFG[cat] || { icon: <Ic.Camera />, accent: T.gold };

/* ─── Service Card ─────────────────────────────────────────────────────────── */
const ServiceCard = ({ service, selectedQty, isChecked, onToggle, today }) => {
  const [imgErr, setImgErr] = useState(false);
  const hasDiscount = !!service.discount;
  const finalPrice  = hasDiscount ? service.price - service.discount : service.price;
  const isHot       = service.bookingsByDate?.[today] > 0;
  const slotsLeft = service.remainingSlots ?? 0;
  const isSoldOut = slotsLeft <=0;       // from backend
  const isTimeBlocked = service.isTimeBlocked; // from backend
  const isLow = slotsLeft > 0 && slotsLeft < 3;
  const isSelected  = selectedQty > 0 || isChecked;
  
  let label = "";
  let styleType = "";

if (isSoldOut) {
  label = "No slots";
  styleType = "soldout";
} else if (isTimeBlocked) {
  label = "Not available this time";
  styleType = "blocked";
} else if (slotsLeft < 3) {
  label = `⚡ ${slotsLeft} left`;
  styleType = "low";
} else {
  label = `${slotsLeft} left`;
  styleType = "normal";
}

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: isSoldOut ? undefined : '0 10px 36px rgba(0,0,0,0.12)' }}
      style={{
        background: T.white,
        borderRadius: 20,
        border: isSelected ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: isSoldOut ? 0.55 : 1,
        boxShadow: isSelected ? `0 4px 24px ${T.goldFaint}` : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, border 0.2s',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ position: 'relative', height: 168, background: T.creamDark, overflow: 'hidden', flexShrink: 0 }}>
        {!imgErr && assets[service.name]?.image ? (
          <motion.img
            src={assets[service.name].image}
            alt={service.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.borderDark }}>
            <Ic.Camera />
          </div>
        )}
        {(isHot || hasDiscount) && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 52%)' }} />
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {isHot && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, background: '#E8520A', color: '#fff', padding: '3px 9px', borderRadius: 20 }}>
              🔥 Fast selling
            </span>
          )}
          {hasDiscount && (
            <span style={{ fontSize: 10, fontWeight: 700, background: T.emerald, color: '#fff', padding: '3px 9px', borderRadius: 20 }}>
              ₹{service.discount} off
            </span>
          )}
        </div>
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              <Ic.Check />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.35 }}>
            {service.name}
          </h2>
          <p style={{ marginTop:6, fontSize: 14, fontWeight: 400, color: T.ink, lineHeight: 1.30 }}>
            {service.time}
          </p>
          <p style={{ marginTop:6, fontSize: 12, fontWeight: 200, color: T.ink, lineHeight: 1.25 }}>
            {service.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 5 }}>
            {hasDiscount && (
              <span style={{ fontSize: 11, color: T.inkLight, textDecoration: 'line-through' }}>₹{service.price.toLocaleString()}</span>
            )}
            <span style={{ fontSize: 17, fontWeight: 700, color: T.emerald, fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em' }}>
              ₹{finalPrice.toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 'auto' }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid',
            ...(styleType === "soldout"
  ? { background: T.creamDark, color: T.inkLight, borderColor: T.border }
  : styleType === "blocked"
  ? { background: T.amberBg, color: T.amber, borderColor: '#FCD34D' }
  : styleType === "low"
  ? { background: T.roseBg, color: T.rose, borderColor: '#F5B8B2' }
  : { background: T.emeraldBg, color: T.emerald, borderColor: '#A8D8C2' })
          }}>
            {label}
          </span>
            <motion.button
              whileHover={!isSoldOut ? { scale: 1.04 } : {}}
              whileTap={!isSoldOut ? { scale: 0.96 } : {}}
              onClick={() => !isSoldOut && onToggle()}
              disabled={isSoldOut}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, border: '1px solid', cursor: isSoldOut ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                ...(isChecked
                  ? { background: T.gold, color: '#fff', borderColor: T.gold }
                  : isSoldOut
                  ? { background: T.creamDark, color: T.inkLight, borderColor: T.border }
                  : { background: T.goldFaint, color: T.amber, borderColor: `${T.gold}55` })
              }}
            >
              {isChecked ? '✓ Added' : 'Add'}
            </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main Component ───────────────────────────────────────────────────────── */
const Services = () => {
  const dispatch = useDispatch();
  const bookingData = useSelector((state) => state.booking);
  const { services, selectedDate } = bookingData;

  const [servicesData, setServicesData]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm]             = useState('');
  const [showAddOn, setShowAddOn]               = useState(false);
  const [rawServices, setRawServices] = useState([]);
  const navigate   = useNavigate();
  const today  = moment().format('YYYY-MM-DD');

  const availableDates = useMemo(() => {
  if (!Array.isArray(servicesData)) return new Set();

  const set = new Set();

  servicesData.forEach(service => {
    if (service.slotsByDate) {
      Object.entries(service.slotsByDate).forEach(([date, slots]) => {
        if (slots > 0) set.add(date);
      });
    }
  });

  return set;
}, [servicesData]);



useEffect(() => {
  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'https://elementsoneastcoast.com/api/user/get-event',
        {
          params: {
            date: bookingData.selectedDate, // ✅ IMPORTANT
          },
        }
      );

      const data = Array.isArray(res.data) ? res.data : [];

      setRawServices(data);

    } catch (err) {
      console.error(err);
      setRawServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (bookingData.selectedDate) {
    fetchServices();
  }
}, [bookingData.selectedDate]);

useEffect(() => {
  if (!bookingData.selectedDate) {
    setServicesData(rawServices);
    return;
  }

  const updated = rawServices.map(service => {
    const slotsForDate = service.slotsByDate?.[bookingData.selectedDate];

    return {
      ...service,
      slotsLeft: slotsForDate ?? service.slotsLeft
    };
  });

  setServicesData(updated);
}, [bookingData.selectedDate, rawServices]);

  

  useEffect(() => {
    const g = (e) => { e.preventDefault(); e.returnValue = ''; sessionStorage.setItem('shouldRedirectHome', 'true'); };
    window.addEventListener('beforeunload', g);
    return () => window.removeEventListener('beforeunload', g);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('shouldRedirectHome') === 'true') {
      sessionStorage.removeItem('shouldRedirectHome');
      navigate('/', { replace: true });
    }
  }, [navigate]);

   const toggleService = (service) => {
  const exists = services.some(
    (s) => s._id === service._id
  );

  if (exists) {
    dispatch(
      updateBookingData({
        services: services.filter(
          (s) => s._id !== service._id
        ),
      })
    );
  } else {
    dispatch(
      updateBookingData({
        services: [
          ...services,
          {
            ...service,
            quantity: 1,
          },
        ],
      })
    );
  }
};

  const fmtDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const cartCount = services.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal = services.reduce((s, i) => {
    const p = i.discount ? i.price - i.discount : i.price;
    return s + p * (i.quantity || 1);
  }, 0);

  
  const filtered = servicesData.filter(service =>
  service.name?.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: T.cream, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      <FontLink />
      <Helmet>
        <title>Elements Photo Shoots — Book Your Session</title>
        <meta name="description" content="Book your next photoshoot online. Find top photoshoot packages for pre-wedding, birthday, and maternity shoots in your city." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      {/* ══════════ NAVBAR ══════════════════════════════════════════════════ */}
      <header className='px-0 sm:px-6' style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, height: 100,
        background: T.white, borderBottom: `1px solid ${T.border}`,
        flexShrink: 0, zIndex: 30,
      }}>
        {/* Brand + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <img src="./logo.png" alt="no logo" className='w-14 h-10'/>
          <div style={{ lineHeight: 1 }} className='hidden lg:block'>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: T.ink, letterSpacing: '-0.02em' }}>Elements on East Coast</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 300, color: T.inkLight, marginTop: 1 }}>Photo Shoots · Chennai</div>
          </div>
        </div>

        {/* Date Picker + Quick Buttons */}
        <QuickDatePicker
          value={selectedDate || ''}
          onChange={(ymd) => dispatch(updateBookingData({selectedDate: ymd,}))}
          minDate={today}
          availableDates={availableDates}
        />

        {/* Venue + cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className='hidden lg:flex' style={{ alignItems: 'center', gap: 6, fontSize: 13, color: T.inkLight }}>
            <Ic.Pin />
            <span>Elements Chennai</span>
            <span style={{
              background: T.creamDark, color: T.inkMid, fontSize: 12,
              padding: '4px 11px', borderRadius: 9, marginLeft: 8,
            }}>
              05:00 AM – 06:00 PM
            </span>
          </div>
        </div>
      </header>

      {/* ══════════ BODY ════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Main top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 24px', background: T.white, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div className='hidden sm:block'>
              <h1 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 20, color: T.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {selectedCategory === 'All' ? 'All packages' : selectedCategory}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: T.inkLight }}>
                {filtered.length} package{filtered.length !== 1 ? 's' : ''} available
                {selectedDate ? ` · ${fmtDate(selectedDate)}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.cream, border: `1px solid ${T.borderDark}`, borderRadius: 12, padding: '8px 14px', width: 220 }}>
              <span style={{ color: T.inkLight, flexShrink: 0 }}><Ic.Search /></span>
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: T.ink, width: '100%', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Cards area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {!selectedDate ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center' }}>
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                  style={{ width: 66, height: 66, borderRadius: 22, background: `${T.gold}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold }}
                >
                  <Ic.Calendar />
                </motion.div>
                <div>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: T.ink, margin: '0 0 6px', fontStyle: 'italic' }}>Pick your shoot date</p>
                  <p style={{ fontSize: 12, color: T.inkLight, margin: 0 }}>Select a date from the navbar to explore available packages</p>
                </div>
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: T.inkLight, fontSize: 13 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.gold }}
                />
                Loading packages…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center' }}>
                <div style={{ width: 54, height: 54, borderRadius: 18, background: T.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.inkLight }}>
                  <Ic.Search />
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: T.inkMid, margin: '0 0 5px', fontStyle: 'italic' }}>No packages found</p>
                  <p style={{ fontSize: 12, color: T.inkLight, margin: 0 }}>Try a different category or search term</p>
                </div>
              </div>
            ) : (
              <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
                <AnimatePresence>
                  {filtered.map((svc, i) => (
                    <motion.div
                      key={svc._id} layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <ServiceCard
                        service={svc}
                        selectedQty={services.find(s => s._id === svc._id)?.quantity || 0}
                        isChecked={services.some(s => s._id === svc._id)}
                        onToggle={() => toggleService(svc)}
                        today={today}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* ══════════ CART BAR ════════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0, background: T.white,
        bottom: 0,left: 0,right: 0,
        borderTop: `1px solid ${T.border}`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            animate={{ scale: cartCount > 0 ? [1, 1.14, 1] : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: 42, height: 42, borderRadius: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: cartCount > 0 ? T.ink : T.creamDark,
              color: cartCount > 0 ? T.goldLight : T.inkLight,
              position: 'relative', flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            <Ic.Cart />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  style={{ position: 'absolute', top: -5, right: -5, background: '#D4607A', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: `2px solid ${T.white}` }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div className='hidden sm:block'>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.ink }}>
              {cartCount === 0 ? 'No items selected' : `${cartCount} item${cartCount > 1 ? 's' : ''} selected`}
            </p>
            {cartCount > 0 && (
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.emerald, fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em' }}>
                ₹{cartTotal.toLocaleString()}
              </p>
            )}
          </div>

          {cartCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', maxWidth: 380 }}>
              {services.slice(0, 3).map(s => (
                <span key={s._id} style={{ fontSize: 10, fontWeight: 500, color: T.amber, background: T.amberBg, border: '1px solid #E9C46A55', padding: '3px 9px', borderRadius: 20, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}{s.quantity > 1 ? ` ×${s.quantity}` : ''}
                </span>
              ))}
              {services.length > 3 && <span style={{ fontSize: 10, color: T.inkLight }}>+{services.length - 3} more</span>}
            </div>
          )}
        </div>

        <motion.button
          onClick={() => cartCount > 0 && setShowAddOn(true)}
          disabled={cartCount === 0}
          whileHover={cartCount > 0 ? { scale: 1.03, boxShadow: '0 6px 24px rgba(0,0,0,0.22)' } : {}}
          whileTap={cartCount > 0 ? { scale: 0.97 } : {}}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 28px', borderRadius: 14,
            fontSize: 14, fontWeight: 600, cursor: cartCount > 0 ? 'pointer' : 'not-allowed',
            border: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            background: cartCount > 0 ? T.ink : T.creamDark,
            color: cartCount > 0 ? T.goldLight : T.inkLight,
            boxShadow: cartCount > 0 ? '0 4px 20px rgba(0,0,0,0.18)' : 'none',
            letterSpacing: '0.01em',
          }}
        >
          Proceed <Ic.ArrowR />
        </motion.button>
      </div>

      {/* ══════════ ADD-ON MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddOn && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,21,26,0.6)', backdropFilter: 'blur(5px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 22 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', width: '92%', maxWidth: 760, background: T.white, borderRadius: 24, boxShadow: '0 40px 90px rgba(0,0,0,0.35)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 22, color: T.ink, letterSpacing: '-0.02em', fontStyle: 'italic' }}>Add-ons</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: T.inkLight }}>Enhance your shoot experience</p>
                </div>
                <button
                  onClick={() => setShowAddOn(false)}
                  style={{ width: 32, height: 32, borderRadius: 9, background: T.creamDark, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.inkMid, cursor: 'pointer' }}
                >
                  <Ic.X />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px' }} className='scrollbar-hide'>
                <AddOn />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 26px', borderTop: `1px solid ${T.border}` }}>
                <button
                  onClick={() => setShowAddOn(false)}
                  style={{ padding: '9px 20px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.white, fontSize: 13, fontWeight: 500, color: T.inkMid, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Back
                </button>
                <motion.button
                  onClick={() => { setShowAddOn(false); navigate('/booking/attendees'); }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '9px 26px', borderRadius: 12, border: 'none', background: T.ink, fontSize: 13, fontWeight: 600, color: T.goldLight, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  Continue booking <Ic.ArrowR />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
