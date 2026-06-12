import { useNavigate, useSearchParams } from 'react-router-dom';
//import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useEffect,useState,useRef } from 'react';
import { Helmet } from 'react-helmet';
import Lottie from "lottie-react";
import confettiAnimation from "../assets/confetti.json"; // download from lottiefiles.com
import { GoCheckCircleFill } from "react-icons/go";
import { useDispatch } from "react-redux";
import { clearBooking } from "../redux/booking/bookingSlice";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Payment was successful!';
  const status = 'success';

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [selectedDate,setSelectedDate] = useState();
  const [services,setServices] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paymentUpdatedRef = useRef(false); //Use useRef to prevent duplicate calls
  const bookingId = sessionStorage.getItem('bookingId'); // Get bookingId from sessionStorage
  const [showConfetti, setShowConfetti] = useState(true);
  sessionStorage.removeItem("skipReloadRedirect");//remove reload skip
  const dispatch = useDispatch();

  //const isNavigatingRef = useRef(false);
  const navigate = useNavigate();
 const [isNavigating, setIsNavigating] = useState(false);

  // Fetch user and company data, then post to generate invoice
  useEffect(() => {
    const fetchDataAndGenerateInvoice = async () => {
     if (!bookingId) return;

     const invoiceLockKey = `invoiceGenerated-${bookingId}`;
     const alreadyGenerated = sessionStorage.getItem(invoiceLockKey);

     if (alreadyGenerated === "true") {
       console.log("Invoice already generated for this booking. Skipping...");
       return;
     }

     sessionStorage.setItem(invoiceLockKey, "true"); // Lock this booking

      try {
        setLoading(true);

        // 1. Fetch user info
        const userRes = await axios.get(`${backendUrl}/api/admin/get-userinfo/${bookingId}`);
        const fullUserData = userRes.data;

        //console.log("fullUserData",fullUserData)

        const selectedDate = fullUserData.data.selectedDate;
        const services = fullUserData.data.services;

       setSelectedDate(selectedDate);
       setServices(services);

      // Use selectedDate and services here
       console.log("selectedDate: ", selectedDate);
       console.log("services: ", services);

        const extractedUserInfo = {
          id: fullUserData?.data.userInfo?.id,
          fullName: fullUserData?.data.userInfo?.fullName,
          email: fullUserData?.data.userInfo?.email,
          contactNumber: fullUserData?.data.userInfo?.contactNumber,
          city: fullUserData?.data.userInfo?.city,
          priceSummary: fullUserData?.data.priceSummary,
          services: fullUserData?.data.services,
          addOns: fullUserData?.data.addOns,
          date: fullUserData?.data.createdAt,
          dueDate: fullUserData?.data.selectedDate,
        };

   

        // 2. Fetch company info
        const companyRes = await axios.get(backendUrl+'/api/admin/get-invoiceinfo');
        const fullCompanyData = companyRes.data;

        console.log("fullCompanyData",fullCompanyData)

        const extractedCompanyInfo = {
          companyAddress: fullCompanyData?.invoice.companyAddress,
          companyContact: fullCompanyData?.invoice.companyContact,
          companyName: fullCompanyData?.invoice.companyName,
          companyWebsite: fullCompanyData?.invoice.companyWebsite,
          invoiceId: fullCompanyData?.invoice.invoiceId,
          logo: fullCompanyData?.invoice.logo,
        };

        // 3. Combine and post to generate invoice
        const payload = {
          userInfo: extractedUserInfo,
          companyInfo: extractedCompanyInfo,
        };

        //console.log("Payload: ",payload)

       const invoiceRes = await axios.post(backendUrl+'/api/admin/generate-invoice', payload);
       console.log("invoice response: ",invoiceRes.data);
       setInvoiceData(invoiceRes.data);

     // 4. Update payment status and send email
     await updatePaymentStatus(selectedDate, services, status);

       //console.log("invoice Response",invoiceRes.data.pdfUrl)
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to generate invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndGenerateInvoice();
  }, [bookingId, status]);

  
   const updatePaymentStatus = async (selectedDateParam, servicesParam, statusParam) => {
    //console.log("Getting into updatePaymentStatus function")

       if (!bookingId || paymentUpdatedRef.current) {
       return;
      }
      //setPaymentUpdated(true); 
     paymentUpdatedRef.current = true; // Lock after first execution, Immediately prevent further calls
     //console.log("Calling updatePaymentStatus...");

      try {
          await axios.put(`${backendUrl}/api/user/bookings/${bookingId}/payment-status`, {
          paymentStatus: statusParam,
          selectedDate: selectedDateParam,
          services: servicesParam
        });
        console.log('Payment status updated successfully');

        // Send confirmation email after payment update
        await axios.post(backendUrl+'/api/admin/booking/send-confirmation-email', {
          bookingId,
        });
        console.log('Confirmation email sent successfully');

        dispatch(clearBooking());

        // Clear bookingId from sessionStorage after payment and email confirmation
        sessionStorage.removeItem('bookingId');
      } catch (error) {
        console.error('Failed to update payment status or send email:', error);
        sessionStorage.removeItem('bookingId');
      }
    };

    useEffect(() => {
       const timer = setTimeout(() => setShowConfetti(false), 5000);
       return () => clearTimeout(timer);
    }, []);



   // Handler for "Go to Homepage" button
  {/*const handleGoHome = async () => {
    await updatePaymentStatus(selectedDate, services, status);
    
    //remove session storage items
    const invoiceLockKey = `invoiceGenerated-${bookingId}`;
    sessionStorage.removeItem(invoiceLockKey);
    sessionStorage.removeItem('bookingId');

    // Soft navigation without triggering unload warning
    navigate('/');
  };*/}
 const handleGoHome = async () => {
  setIsNavigating(true);
  try {
    await updatePaymentStatus(selectedDate, services, status);
    const invoiceLockKey = `invoiceGenerated-${bookingId}`;
    sessionStorage.removeItem(invoiceLockKey);
    sessionStorage.removeItem('bookingId');
    navigate('/');
  } catch (err) {
    console.error('Navigation error:', err);
  } finally {
    setIsNavigating(false);
  }
};

  return (
    <div>
     <Helmet>
              {/* Meta Tags */}
               <title>Pre Wedding | Post Wedding | Maternity | Baby Photoshoot Places in Bangalore</title>
               <meta
                name="description"
                content="Book your next photoshoot online. Find top photoshoot packages for pre-wedding, birthday, and maternity shoots in your city. Packages from ₹500."
              />
               <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
               <meta name="keywords" content="photoshoot, pre-wedding, maternity, book photoshoot online, family photoshoot, photoshoot in bangalore,post wedding photoshoot in bangalore, pre wedding photo shoot places in bangalore, maternity photoshoot in bangalore, photoshoot places in kanakapura road, outdoor photoshoot places in bangalore" />
               <meta name="author" content="Book Event" />
      
              {/* Open Graph for social sharing */}
              <meta property="og:title" content="Book Photoshoot Online" />
              <meta property="og:description" content="Find the best photoshoot packages for every occasion." />
              <meta property="og:type" content="website" />
       </Helmet>
      
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {showConfetti && (
  <div className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none">
    <Lottie
      animationData={confettiAnimation}
      loop={false}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
)}

  <div className="bg-green-50 shadow-2xl rounded-3xl m-4 p-6 md:p-20 lg:p-28 flex flex-col items-center text-center transition-all duration-300 ease-in-out">
  <GoCheckCircleFill className="text-green-500 w-20 h-20 md:w-24 md:h-24 mb-2"/>
  <h2 className="text-xl md:text-3xl font-bold text-green-600"> {message} </h2>
  <p className="items-center text-center font-medium text-gray-700 mt-4">
   Your Order has been confirmed for your date.
  </p>
  <button
  onClick={handleGoHome}
  disabled={isNavigating}
  className="mt-8 group relative inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-full text-base font-semibold overflow-hidden transition-all duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
>
  {isNavigating ? (
    <>
      <svg
        className="w-5 h-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Please wait...
    </>
  ) : (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Go to Homepage
    </>
  )}
</button>
  <p className="mt-5 text-sm md:text-base font-semibold text-gray-600">
    <span className="text-red-500 text-lg">*</span> We'll reach out to you as soon as possible.
  </p>
</div>

     </div>
    </div>
  );
};

export default PaymentSuccess;
