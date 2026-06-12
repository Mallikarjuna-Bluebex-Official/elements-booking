import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { updateBookingData } from '../redux/booking/bookingSlice';

const AddOn = () => {

  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // Redux state
  const bookingData = useSelector(
    (state) => state.booking
  );

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {

    const fetchAddOns = async () => {

      setLoading(true);

      try {

        const response = await axios.get(
          backendUrl + '/api/user/getAddOn'
        );

        const fetchedAddOns = response.data.map((addOn) => ({
          ...addOn,

          isSelected:
            bookingData.addOns?.some(
              (selected) => selected._id === addOn._id
            ) || false,
        }));

        setAddOns(fetchedAddOns);

      } catch (error) {

        console.error('Failed to fetch add-ons:', error);

      } finally {

        setLoading(false);

      }
    };

    fetchAddOns();

  }, [bookingData.addOns]);



  // Handle add-on selection
  const handleToggleAddOn = (id) => {

    const updatedAddOns = addOns.map((addOn) =>
      addOn._id === id
        ? {
            ...addOn,
            isSelected: !addOn.isSelected,
          }
        : addOn
    );

    setAddOns(updatedAddOns);

    const selectedAddOns = updatedAddOns.filter(
      (addOn) => addOn.isSelected
    );

    // Redux update
    dispatch(
      updateBookingData({
        addOns: selectedAddOns,
      })
    );
  };



  // Clear add-ons when date changes
  useEffect(() => {

    if (bookingData.dateChanged) {

      setAddOns((prevAddOns) =>
        prevAddOns.map((addOn) => ({
          ...addOn,
          isSelected: false,
        }))
      );

      dispatch(
        updateBookingData({
          addOns: [],
        })
      );
    }

  }, [bookingData.dateChanged]);



  return (
    <div className='min-h-100 mx-5'>

      {loading ? (

        <div className="text-center py-6 text-gray-600 font-semibold">
          Loading add-ons...
        </div>

      ) : (

        <ul className="mt-2">

          {addOns && addOns.length > 0 ? (

            addOns.map((addOn) => (

              <li
                key={addOn._id}
                className="flex justify-between items-center text-lg text-gray-600 py-3 border-b"
              >

                <div>

                  <span className="font-semibold">
                    {addOn.name}
                  </span>

                  <div className="text-md py-1 font-semibold text-blue-500">
                    ₹{addOn.price}
                  </div>

                  {addOn.description && (
                    <div className="text-sm text-gray-400">
                      {addOn.description}
                    </div>
                  )}

                </div>

                <input
                  type="checkbox"
                  checked={addOn.isSelected}
                  onChange={() =>
                    handleToggleAddOn(addOn._id)
                  }
                  className="ml-4 w-5 h-5 shrink-0"
                />

              </li>
            ))

          ) : (

            <li>No add-ons available</li>

          )}

        </ul>

      )}

    </div>
  );
};

export default AddOn;