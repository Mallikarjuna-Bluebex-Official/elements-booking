import { useState, useContext, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDate, setServices, setAddOns,  updateBookingData} from "../redux/booking/bookingSlice";

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const T = {
  sidebar:      '#16151A',
  gold:         '#C9A84C',
  goldLight:    '#F0D898',
  goldFaint:    'rgba(201,168,76,0.10)',
  goldBorder:   'rgba(201,168,76,0.30)',
  cream:        '#FAF8F4',
  creamDark:    '#F2EFE8',
  ink:          '#1A1917',
  inkMid:       '#4A4845',
  inkLight:     '#8A8784',
  border:       '#E8E4DC',
  borderDark:   '#D4CFC4',
  white:        '#FFFFFF',
  emerald:      '#1A6B4A',
  emeraldBg:    '#EBF5F0',
  emeraldBorder:'#A8D8C2',
  rose:         '#C0392B',
  amber:        '#B45309',
  amberBg:      '#FEF3C7',
  blue:         '#185FA5',
  blueBg:       '#E6F1FB',
};

/* ─── SVG Icons ───────────────────────────────────────────────────────────── */
const IcCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
  </svg>
);
const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21v-1a8 8 0 0 1 16 0v1" strokeLinecap="round"/>
  </svg>
);
const IcTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IcSparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

/* ─── Global styles — injected once at module level, not inside any component ── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  *, *::before, *::after { box-sizing: border-box; }

  .ud-input {
    height: 46px; border: 1.5px solid #E8E4DC; border-radius: 13px;
    padding: 0 16px; font-size: 14px; color: #1A1917; background: #FAF8F4;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    width: 100%; font-family: 'DM Sans', sans-serif; font-weight: 500;
  }
  .ud-input:focus { border-color: #C9A84C; background: #fff; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
  .ud-input::placeholder { color: #8A8784; font-weight: 400; }

  .ud-select {
    height: 46px; border: 1.5px solid #E8E4DC; border-radius: 13px;
    padding: 0 40px 0 16px; font-size: 14px; color: #1A1917; background: #FAF8F4;
    outline: none; width: 100%; font-family: 'DM Sans', sans-serif; font-weight: 500;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8784' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 15px center;
    cursor: pointer; transition: border-color 0.18s, box-shadow 0.18s;
  }
  .ud-select:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }

  .react-tel-input .form-control {
    height: 46px !important; border-radius: 13px !important;
    border: 1.5px solid #E8E4DC !important; font-size: 14px !important;
    font-family: 'DM Sans', sans-serif !important; font-weight: 500 !important;
    width: 100% !important; background: #FAF8F4 !important; color: #1A1917 !important;
    transition: border-color 0.18s, box-shadow 0.18s !important;
  }
  .react-tel-input .form-control:focus {
    border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.10) !important;
    background: #fff !important;
  }
  .react-tel-input .flag-dropdown {
    border-radius: 13px 0 0 13px !important; border: 1.5px solid #E8E4DC !important;
    border-right: none !important; background: #FAF8F4 !important;
  }
  .react-tel-input .selected-flag:hover, .react-tel-input .selected-flag:focus {
    background: #F2EFE8 !important;
  }

  .ud-pay-btn {
    width: 100%; height: 52px; background: #1A1917; color: #F0D898;
    border: none; border-radius: 16px; font-size: 15px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s; letter-spacing: 0.01em;
  }
  .ud-pay-btn:hover:not(:disabled) { background: #2A2420; box-shadow: 0 6px 24px rgba(0,0,0,0.25); transform: translateY(-1px); }
  .ud-pay-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none; }

  .ud-save-btn {
    width: 100%; height: 48px; background: #C9A84C; color: #1A1917;
    border: none; border-radius: 14px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;
    transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ud-save-btn:hover { background: #B8952E; box-shadow: 0 4px 18px rgba(201,168,76,0.35); }
  .ud-save-btn.saved { background: #1A6B4A; color: #fff; }
  .ud-save-btn.saved:hover { background: #155C3D; }

  .ud-coupon-btn {
    height: 46px; padding: 0 18px; border-radius: 13px;
    border: 1.5px solid rgba(201,168,76,0.30); background: rgba(201,168,76,0.10);
    color: #1A1917; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    white-space: nowrap; transition: all 0.15s; flex-shrink: 0;
  }
  .ud-coupon-btn:hover { background: rgba(201,168,76,0.20); border-color: #C9A84C; }

  @media (max-width: 720px) {
    .ud-grid { grid-template-columns: 1fr !important; }
    .ud-mobile-only { display: block !important; }
    .ud-form-grid { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 721px) { .ud-mobile-only { display: none !important; } }
  @media (max-width: 720px) { .ud-desktop-only { display: none !important; } }
`;

/* inject once */
if (!document.getElementById('ud-global-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ud-global-styles';
  tag.textContent = GLOBAL_STYLE;
  document.head.appendChild(tag);
}

/* ─── Tiny reusable components — all defined at module level ─────────────── */
const Field = ({ label, required, error, children, span2 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: span2 ? 'span 2' : undefined }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {label}{required && <span style={{ color: T.rose, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ fontSize: 11, color: T.rose, marginTop: 1 }}>
          {error}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

const StepBadge = ({ n }) => (
  <div style={{
    width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: T.ink,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Serif Display', serif", fontSize: 14, color: T.gold, fontStyle: 'italic',
  }}>{n}</div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: T.white, borderRadius: 22, border: `1px solid ${T.border}`,
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', ...style,
  }}>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SummaryPanel — module-level + memo so it never remounts on parent re-render.
   The coupon <input> lives here, which is why this must NOT be inside UserDetails.
───────────────────────────────────────────────────────────────────────────── */
const SummaryPanel = memo(({
  bookingData,
  ItemPrice, addOnTotal, totalDiscount, couponDiscount, totalAmount,
  couponCode, onCouponInput, onApplyCoupon, onRemoveCoupon,
  couponApplied, couponError,
  isChecked, onCheckboxChange,
  showCheckboxError, showPaymentButton,
  payLoading, onPayment,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <Card>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: T.gold }}><IcSparkle /></span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: T.ink, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
            Order summary
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.amber, background: T.amberBg, border: '1px solid #E9C46A55', padding: '3px 10px', borderRadius: 20 }}>
          {bookingData.services.length + (bookingData.addOns?.length || 0)} items
        </span>
      </div>

      {/* Service rows */}
      {bookingData.services.map((svc, i) => (
        <div key={i} style={{ padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{svc.name}</p>
            {svc.quantity > 1 && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.inkLight }}>× {svc.quantity}</p>}
            {svc.discount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: T.emerald, background: T.emeraldBg, border: `1px solid ${T.emeraldBorder}`, padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block' }}>
                −₹{svc.discount} off
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {svc.discount > 0 && <div style={{ fontSize: 11, color: T.inkLight, textDecoration: 'line-through', lineHeight: 1 }}>₹{svc.price * svc.quantity}</div>}
            <div style={{ fontSize: 15, fontWeight: 700, color: T.emerald, fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em' }}>
              ₹{(svc.price * svc.quantity - (svc.discount || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      ))}

      {/* Add-on rows */}
      {bookingData.addOns?.map((addOn, i) => (
        <div key={i} style={{ padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.blue, background: T.blueBg, padding: '3px 9px', borderRadius: 20 }}>Add-on</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.inkMid }}>{addOn.name}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>₹{addOn.price}</span>
        </div>
      ))}

      {/* Price rows */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 13, color: T.inkLight }}>Item price</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: T.inkMid }}>₹{ItemPrice.toLocaleString()}</span>
      </div>
      {addOnTotal > 0 && (
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.inkLight }}>Add-ons</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: T.inkMid }}>₹{addOnTotal.toLocaleString()}</span>
        </div>
      )}
      {totalDiscount > 0 && (
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.emerald, fontWeight: 600 }}>Discount</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.emerald }}>−₹{totalDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Coupon section */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ color: T.gold }}><IcTag /></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Coupon code</span>
        </div>

        {!couponApplied ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="ud-input"
              type="text"
              value={couponCode}
              onChange={e => onCouponInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onApplyCoupon()}
              placeholder="Enter code"
              style={{ flex: 1, letterSpacing: '0.05em', fontSize: 13 }}
            />
            <button className="ud-coupon-btn" onClick={onApplyCoupon}>Apply</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.emeraldBg, border: `1px solid ${T.emeraldBorder}`, borderRadius: 13, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: T.emerald }}><IcCheck /></span>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.emerald }}>{couponCode}</p>
                <p style={{ margin: 0, fontSize: 11, color: T.emerald, opacity: 0.8 }}>10% off applied</p>
              </div>
            </div>
            <button onClick={onRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.rose, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", padding: '4px 8px' }}>
              Remove
            </button>
          </div>
        )}

        <AnimatePresence>
          {couponError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ margin: '6px 0 0', fontSize: 11, color: T.rose }}>
              {couponError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {couponDiscount > 0 && (
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.emerald, fontWeight: 600 }}>Coupon discount (10%)</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.emerald }}>−₹{couponDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Total */}
      <div style={{ padding: '16px 20px', background: T.sidebar, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Total amount</p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Incl. GST · booking fees extra</p>
        </div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: T.gold, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
          ₹{totalAmount.toLocaleString()}
        </span>
      </div>
    </Card>

    {/* Terms + Pay */}
    <Card>
      <div style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: `1px solid ${T.border}` }}>
        <div onClick={onCheckboxChange} style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
          border: `1.5px solid ${isChecked ? T.gold : T.borderDark}`,
          background: isChecked ? T.ink : T.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}>
          {isChecked && <span style={{ color: T.gold }}><IcCheck /></span>}
        </div>
        <label style={{ fontSize: 12, color: T.inkLight, lineHeight: 1.6, cursor: 'pointer' }} onClick={onCheckboxChange}>
          I have read and agree to the{' '}
          <span style={{ color: T.blue, textDecoration: 'underline' }}>terms</span> and{' '}
          <span style={{ color: T.blue, textDecoration: 'underline' }}>privacy policy</span>.
        </label>
      </div>

      <AnimatePresence>
        {showCheckboxError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ margin: 0, fontSize: 11, color: T.rose, padding: '8px 20px 0' }}>
            You must agree to the terms before proceeding.
          </motion.p>
        )}
      </AnimatePresence>

      <div style={{ padding: '14px 20px 6px' }}>
        <AnimatePresence>
          {showPaymentButton && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <button className="ud-pay-btn" onClick={onPayment} disabled={!isChecked || payLoading}>
                {payLoading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(240,216,152,0.3)', borderTopColor: T.goldLight, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Redirecting…
                  </>
                ) : (
                  <>Proceed to pay · ₹{totalAmount.toLocaleString()} <IcArrow /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 20px 16px', fontSize: 11, color: T.inkLight }}>
        <IcLock /><span>Secure payment · SSL encrypted</span>
      </div>
    </Card>
  </div>
));

/* ─── Main Component ──────────────────────────────────────────────────────── */
const UserDetails = () => {
  //const { updateBookingData, bookingData } = useContext(BookingContext);
  const dispatch = useDispatch();

  const bookingData = useSelector((state) => state.booking);

  const [isChecked,         setIsChecked]         = useState(false);
  const [showSaveButton,    setShowSaveButton]     = useState(true);
  const [showPaymentButton, setShowPaymentButton]  = useState(false);
  const [isSaved,           setIsSaved]            = useState(false);
  const [showCheckboxError, setShowCheckboxError]  = useState(false);
  const [phone,             setPhone]              = useState("+91");
  const [emailError,        setEmailError]         = useState("");
  const [gateway,           setGateway]            = useState(null);
  const [isCollapsed,       setIsCollapsed]        = useState(false);
  const [payLoading,        setPayLoading]         = useState(false);

  const [couponCode,    setCouponCode]    = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError,   setCouponError]   = useState("");
  const VALID_COUPON = "ELEMENTS10";

  const [formData, setFormData] = useState({
    id: "", fullName: "", email: "", confirmEmail: "",
    contactNumber: "", city: "", referralSource: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate   = useNavigate();

  /* ── Price calculations ── */
  const ItemPrice     = bookingData.services.reduce((t, s) => t + s.price * s.quantity, 0);
  const totalDiscount = bookingData.services.reduce((t, s) => t + (s.discount || 0), 0);
  const serviceTotal  = bookingData.services.reduce((t, s) => t + s.price * s.quantity - (s.discount || 0), 0);
  const addOnTotal     = bookingData.addOns?.reduce((t, a) => t + a.price, 0) || 0;
  const couponDiscount = couponApplied ? Math.round(serviceTotal * 0.1) : 0;
  const totalAmount    = serviceTotal + addOnTotal - couponDiscount;

  /* ── Stable callbacks (won't change identity on re-render) ── */
  const handleCouponInput = useCallback((val) => {
    setCouponCode(val.toUpperCase());
    setCouponError("");
  }, []);

  const handleApplyCoupon = useCallback(() => {
    if (couponCode.trim().toUpperCase() === VALID_COUPON) {
      setCouponApplied(true);
      setCouponError("");
      toast.success("Coupon applied! 10% discount added.");
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code. Please try again.");
    }
  }, [couponCode]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponApplied(false);
    setCouponCode("");
    setCouponError("");
  }, []);

  const handleCheckboxChange = useCallback(() => {
    setIsChecked(prev => {
      if (!prev) setShowCheckboxError(false);
      return !prev;
    });
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    dispatch(updateBookingData({
    priceSummary: {
      ItemPrice: ItemPrice + addOnTotal,
      totalDiscount,
      totalAmount,
    },
  }));
  }, [ItemPrice, totalDiscount, totalAmount, couponDiscount]);

  useEffect(() => {
    setFormData(p => ({ ...p, id: uuidv4().slice(0, 8).toUpperCase() }));
  }, []);

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem("shouldRedirectHome") === "true";
    const shouldSkip     = sessionStorage.getItem("skipReloadRedirect") === "true";
    if (shouldRedirect && !shouldSkip) {
      sessionStorage.removeItem("shouldRedirectHome");
      sessionStorage.removeItem("skipReloadRedirect");
      window.location.replace("/");
    }
    const handler = (e) => {
      if (sessionStorage.getItem("skipReloadRedirect") === "true") return;
      sessionStorage.setItem("shouldRedirectHome", "true");
      e.preventDefault(); e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [navigate]);

  useEffect(() => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmailError(formData.email && !re.test(formData.email) ? "Invalid email format" : "");
  }, [formData.email]);

  useEffect(() => {
    fetch("https://elementsoneastcoast.com/api/user/active-gateway")
      .then(r => r.json())
      .then(d => setGateway(d.gateway))
      .catch(console.error);
  }, []);

  /* ── Form handlers ── */
  const handleChange      = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePhoneChange = (ph) => setPhone(ph);

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.city || !formData.referralSource) {
      toast.error("Please fill all required fields."); return false;
    }
    if (emailError) { toast.error("Please enter a valid email."); return false; }
    if (!phone || phone.length < 10) { toast.error("Enter a valid contact number."); return false; }
    return true;
  };

  const submitBooking = async () => {
    const data = { ...bookingData, userInfo: { ...formData, contactNumber: phone } };
    dispatch(updateBookingData(data));
    const res = await axios.post(`${backendUrl}/api/user/booking`, data);
    sessionStorage.setItem("bookingId", res.data.bookingId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await submitBooking();
      setIsSaved(true); setShowSaveButton(false); setShowPaymentButton(true);
      toast.success("Details saved! Complete payment to confirm your booking.");
    } catch { toast.error("Failed to submit booking data."); }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await submitBooking();
      setIsSaved(true); setShowSaveButton(false); setShowPaymentButton(true); setIsCollapsed(true);
      toast.success("Details saved! Complete payment to confirm your booking.");
    } catch { toast.error("Failed to submit booking data."); }
  };

  /* ── Payment handlers ── */
  const handlePayment = useCallback(() => {
    if (!isChecked) { setShowCheckboxError(true); return; }
    if (!gateway) return;
    setPayLoading(true);
    if      (gateway === "PayU")     handlePayuPayment();
    else if (gateway === "PhonePe")  handlePhonepePayment();
    else if (gateway === "Razorpay") handleRazorpayPayment();
    else if (gateway === "PayPal")   handlePaypalPayment();
  }, [isChecked, gateway]);

  const handlePayuPayment = async () => {
    sessionStorage.setItem("skipReloadRedirect", "true");
    try {
      const { data } = await axios.post("https://elementsoneastcoast.com/api/user/pay", {
        amount: totalAmount,
        productInfo: bookingData.services.map(s => s.name).join(", "),
        firstName: formData.fullName, email: formData.email, phone: formData.contactNumber,
      });
      const form = document.createElement("form");
      form.method = "POST"; form.action = data.url;
      Object.keys(data.payUData).forEach(k => {
        const i = document.createElement("input");
        i.type = "hidden"; i.name = k; i.value = data.payUData[k];
        form.appendChild(i);
      });
      document.body.appendChild(form); form.submit();
    } catch { setPayLoading(false); }
  };

  const handlePhonepePayment = async () => {
    sessionStorage.setItem("skipReloadRedirect", "true");
    try {
      const { data } = await axios.post("https://elementsoneastcoast.com/api/user/initiate-payment", {
        totalAmount, orderId: "ORDER_" + Date.now(),
      });
      if (data.success) window.location.href = data.data.instrumentResponse.redirectInfo.url;
      else { alert("Payment initiation failed"); setPayLoading(false); }
    } catch { alert("Error processing payment"); setPayLoading(false); }
  };

  const loadRazorpayScript = () => new Promise(res => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });

  const handleRazorpayPayment = async () => {
    sessionStorage.setItem("skipReloadRedirect", "true");
    if (!(await loadRazorpayScript())) { alert("Failed to load Razorpay."); setPayLoading(false); return; }
    try {
      const { data } = await axios.post("https://elementsoneastcoast.com/api/user/create-order", { totalAmount, currency: "INR" });
      new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount, currency: data.currency,
        name: "Elements Photo Shoots", description: "Photoshoot Booking", order_id: data.id,
        handler: async (r) => {
          const v = await axios.post(backendUrl + "/api/user/verify-payment", r);
          window.location.href = v.data.redirectUrl;
        },
        theme: { color: T.ink },
      }).open();
      setPayLoading(false);
    } catch { alert("Payment failed!"); setPayLoading(false); }
  };

  const handlePaypalPayment = async () => {
    sessionStorage.setItem("skipReloadRedirect", "true");
    try {
      const { data } = await axios.post("https://elementsoneastcoast.com/api/user/create-payment", { totalAmount });
      if (data?.approvalUrl) window.location.href = data.approvalUrl;
      else setPayLoading(false);
    } catch { setPayLoading(false); }
  };

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: T.cream, fontFamily: "'DM Sans', sans-serif", color: T.ink, paddingBottom: 60 }}>
      <Helmet>
        <title>Pre Wedding | Post Wedding | Maternity | Baby Photoshoot Places in Bangalore</title>
        <meta name="description" content="Book your next photoshoot online." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      {/* Top bar */}
      <header style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', height: 72,
        display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="./logo.png" alt="logo" className="w-14 h-10" />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: T.ink, letterSpacing: '-0.02em' }}>Elements on East Coast</div>
            <div style={{ fontSize: 12, fontWeight: 300, color: T.inkLight, marginTop: 1 }}>Photo Shoots · Chennai</div>
          </div>
        </div>
      </header>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 1020, margin: '36px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }}
        className="ud-grid"
      >
        {/* LEFT: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                <Card>
                  <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n="1" />
                      <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: T.ink, letterSpacing: '-0.02em', fontStyle: 'italic' }}>Attendee details</div>
                        <div style={{ fontSize: 11, color: T.inkLight, marginTop: 2 }}>Fill in your information to confirm the booking</div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isSaved && (
                        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.emerald, background: T.emeraldBg, border: `1px solid ${T.emeraldBorder}`, padding: '5px 12px', borderRadius: 20 }}>
                          <IcCheck /> Saved
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <form onSubmit={handleSubmit}>
                      <div className="ud-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                        <div style={{ gridColumn: 'span 2' }}>
                          <Field label="Full name" required>
                            <div style={{ position: 'relative' }}>
                              <input className="ud-input" type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="E.g. Priya Sharma" required style={{ paddingLeft: 44 }} />
                              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.inkLight, pointerEvents: 'none' }}><IcUser /></span>
                            </div>
                          </Field>
                        </div>

                        <Field label="Email address" required error={emailError}>
                          <input className="ud-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                        </Field>

                        <Field label="City" required>
                          <input className="ud-input" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Bangalore" required />
                        </Field>

                        <div style={{ gridColumn: 'span 2' }}>
                          <Field label="Contact number" required>
                            <PhoneInput
                              country={"in"} value={phone} onChange={handlePhoneChange}
                              inputStyle={{ width: "100%", height: "46px", border: `1.5px solid ${T.border}`, borderRadius: "13px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: T.cream, color: T.ink }}
                              buttonStyle={{ border: `1.5px solid ${T.border}`, borderRight: `1px solid ${T.border}`, background: T.cream, borderRadius: "13px 0 0 13px" }}
                              containerStyle={{ width: "100%" }}
                            />
                          </Field>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <Field label="How did you hear about us?" required>
                            <select className="ud-select" name="referralSource" value={formData.referralSource} onChange={handleChange} required>
                              <option value="">Select an option</option>
                              <option value="socialMedia">Social media</option>
                              <option value="friend">Friend / family</option>
                              <option value="searchEngine">Search engine</option>
                              <option value="other">Other</option>
                            </select>
                          </Field>
                        </div>
                      </div>

                      {showSaveButton && (
                        <button type="submit" className={`ud-save-btn ud-desktop-only ${isSaved ? 'saved' : ''}`}>
                          {isSaved ? <><IcCheck /> Information saved</> : 'Save information'}
                        </button>
                      )}
                    </form>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {showSaveButton && (
            <button className="ud-save-btn ud-mobile-only" onClick={handleMobileSubmit} style={{ display: 'none', marginTop: 4 }}>
              {isSaved ? <><IcCheck /> Information saved</> : 'Save & continue'}
            </button>
          )}

          {isCollapsed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ud-mobile-only" style={{ display: 'none' }}>
              <SummaryPanel
                bookingData={bookingData}
                ItemPrice={ItemPrice} addOnTotal={addOnTotal}
                totalDiscount={totalDiscount} couponDiscount={couponDiscount} totalAmount={totalAmount}
                couponCode={couponCode} onCouponInput={handleCouponInput}
                couponApplied={couponApplied} couponError={couponError}
                onApplyCoupon={handleApplyCoupon} onRemoveCoupon={handleRemoveCoupon}
                isChecked={isChecked} onCheckboxChange={handleCheckboxChange}
                showCheckboxError={showCheckboxError} showPaymentButton={showPaymentButton}
                payLoading={payLoading} onPayment={handlePayment}
              />
            </motion.div>
          )}
        </div>

        {/* RIGHT: Summary (desktop) */}
        <div className="ud-desktop-only">
          <SummaryPanel
            bookingData={bookingData}
            ItemPrice={ItemPrice} addOnTotal={addOnTotal}
            totalDiscount={totalDiscount} couponDiscount={couponDiscount} totalAmount={totalAmount}
            couponCode={couponCode} onCouponInput={handleCouponInput}
            couponApplied={couponApplied} couponError={couponError}
            onApplyCoupon={handleApplyCoupon} onRemoveCoupon={handleRemoveCoupon}
            isChecked={isChecked} onCheckboxChange={handleCheckboxChange}
            showCheckboxError={showCheckboxError} showPaymentButton={showPaymentButton}
            payLoading={payLoading} onPayment={handlePayment}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetails;
