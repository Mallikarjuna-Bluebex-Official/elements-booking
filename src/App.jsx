import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFail';
import TestServices from './components/test';
import TestUserDetails from './components/testCheckout';
function App() {
  return (
    <div>
      {/* ✅ Correct placement of ToastContainer <Route path='/' element={<MonthlyCalendar />} />  <Route path='/success' element={<SuccessPage />} /> />*/}
      <ToastContainer />
      <Router>
        <Routes>
          <Route path='/booking' element={<TestServices />} />
           <Route path='/user' element={<TestUserDetails/>} />
          <Route path='/booking/success' element={<PaymentSuccess />} />
          <Route path='/booking/failure' element={<PaymentFailure />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


