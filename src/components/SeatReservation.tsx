import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface Seat {
  id: number;
  row_number: number;
  seat_number: number;
  is_booked: boolean;
  booked_by: string | null;
  absolute_number: number;
}

export default function SeatReservation() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [availableSeats, setAvailableSeats] = useState<number>(0);
  const [directSeatNumber, setDirectSeatNumber] = useState<string>('');

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('row_number')
        .order('seat_number');

      if (error) throw error;
      
      const seatsWithAbsoluteNumbers = (data || []).map((seat, index) => ({
        ...seat,
        absolute_number: index + 1
      }));
      
      setSeats(seatsWithAbsoluteNumbers);
      setAvailableSeats(seatsWithAbsoluteNumbers.filter(seat => !seat.is_booked).length);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else if (selectedSeats.length < 7) {
      setSelectedSeats([...selectedSeats, seatId]);
    } else {
      setError('You can only select up to 7 seats at a time');
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      const { error } = await supabase
        .from('seats')
        .update({ is_booked: true, booked_by: (await supabase.auth.getUser()).data.user?.id })
        .in('id', selectedSeats);

      if (error) throw error;

      setSelectedSeats([]);
      fetchSeats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleReset = async () => {
    try {
      const { error } = await supabase
        .from('seats')
        .update({ is_booked: false, booked_by: null })
        .eq('booked_by', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setSelectedSeats([]);
      fetchSeats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDirectBooking = () => {
    const seatNumber = parseInt(directSeatNumber);
    if (isNaN(seatNumber) || seatNumber < 1 || seatNumber > 80) {
      setError('Please enter a valid seat number between 1 and 80');
      return;
    }

    const seat = seats.find(s => s.absolute_number === seatNumber);
    if (!seat) {
      setError('Seat not found');
      return;
    }

    if (seat.is_booked) {
      setError('This seat is already booked');
      return;
    }

    setSelectedSeats([seat.id]);
    setDirectSeatNumber('');
  };

  if (loading) return <div>Loading...</div>;

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row_number]) {
      acc[seat.row_number] = [];
    }
    acc[seat.row_number].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Train Seat Reservation</h2>
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <span className="font-semibold">Available Seats: </span>
          <span className="text-blue-700">{availableSeats}</span>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="80"
              value={directSeatNumber}
              onChange={(e) => setDirectSeatNumber(e.target.value)}
              placeholder="Enter seat number (1-80)"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleDirectBooking}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Book Seat
            </button>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Reset My Bookings
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="space-y-4">
          {Object.entries(rows).map(([rowNum, rowSeats]) => (
            <div key={rowNum} className="flex gap-2 justify-center">
              {rowSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => !seat.is_booked && handleSeatClick(seat.id)}
                  disabled={seat.is_booked}
                  className={cn(
                    "w-16 h-16 rounded-lg flex flex-col items-center justify-center font-medium relative",
                    seat.is_booked
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : selectedSeats.includes(seat.id)
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-blue-100 border-2 border-blue-200"
                  )}
                >
                  <span className="text-xs opacity-70">#{seat.absolute_number}</span>
                  <span className="text-sm">R{seat.row_number}S{seat.seat_number}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-blue-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
        
        <button
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Book Selected Seats ({selectedSeats.length})
        </button>
      </div>
    </div>
  );
}