# Train Seat Reservation System

A modern web application for booking train seats built with React, Supabase, and Tailwind CSS.

## Features

- **User Authentication**: Secure login and registration system
- **Interactive Seat Selection**: Visual representation of train seats
- **Real-time Updates**: Instant feedback on seat availability
- **Smart Booking Logic**: 
  - Book up to 7 seats at once
  - Priority booking in the same row
  - Automatic nearby seat selection when same row booking is not possible
- **Seat Layout**:
  - 80 total seats
  - 10 rows with 7 seats each
  - Last row with 3 seats
  - Clear indication of booked, available, and selected seats
- **Responsive Design**: Works seamlessly across different devices

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks

## Project Structure

```
src/
├── components/         # React components
│   ├── Login.tsx      # Login component
│   ├── Register.tsx   # Registration component
│   └── SeatReservation.tsx  # Main seat booking interface
├── lib/               # Utility functions and configurations
│   ├── supabase.ts    # Supabase client configuration
│   └── utils.ts       # Helper functions
└── App.tsx            # Main application component
```

## Database Schema

### Seats Table
- `id`: Serial Primary Key
- `row_number`: Integer (NOT NULL)
- `seat_number`: Integer (NOT NULL)
- `is_booked`: Boolean (DEFAULT false)
- `booked_by`: UUID (References auth.users)
- `created_at`: Timestamp with timezone

### Security
- Row Level Security (RLS) enabled
- Public read access for seat status
- Authenticated users can only book available seats
- Users can only modify their own bookings

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application can be deployed to any static hosting service (Netlify, Vercel, etc.) with the following build command:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

