"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Sparkles, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MOCK_USER_ID } from "@/lib/config";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        fetch("/api/events"),
        fetch(`/api/users/${MOCK_USER_ID}/bookings`)
      ]);
      
      const eventsData = await eventsRes.json();
      const bookingsData = await bookingsRes.json();

      if (eventsData.success) setEvents(eventsData.data);
      if (bookingsData.success) setMyBookings(bookingsData.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Connection Error", { description: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async (eventId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, eventId, ticketCount: 1 }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Ticket Secured! 🎉", {
          description: (
      <div className="text-slate-500">
        Your VIP code: <span className="font-mono font-bold text-indigo-600 ml-1">{data.data.uniqueCode}</span>
      </div>
    ),
    style: {
      background: "white",
      color: "#4b5563",
      border: "1px solid #e5e7eb",
    },
  });
        fetchData();
      } else {
        toast.error("Booking Failed", {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error("Error", { description: "Something went wrong." });
    }
  };

  const handleCancelTicket = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.info("Ticket Cancelled", {
          description: (
      <div className="text-slate-500">
        Your spot has been returned to pool
      </div>
    ),
    style: {
      background: "white",
      color: "#4b5563",
      border: "1px solid #e5e7eb",
    },
  });
        fetchData(); 
      } else {
        toast.error("Cancellation Error", {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to cancel ticket." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-bounce flex flex-col items-center gap-4">
          <Sparkles className="h-10 w-10 text-violet-500" />
          <p className="text-xl font-bold text-slate-700">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-8 md:p-16 font-sans">
      <div className="max-w-6xl mx-auto space-y-20">
        
        <section>
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
              Epic <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">Events.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Grab your tickets before they vanish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: any) => {
              const isSoldOut = event.remainingTickets === 0;
              const isLowStock = event.remainingTickets > 0 && event.remainingTickets <= 10;

              return (
                <Card 
                  key={event.id} 
                  className="group relative flex flex-col justify-between overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm rounded-3xl"
                >
                  <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 absolute top-0 left-0" />
                  
                  <CardHeader className="pt-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge 
                        className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs ${
                          isSoldOut ? "bg-slate-200 text-slate-500" :
                          isLowStock ? "bg-amber-100 text-amber-700" : 
                          "bg-emerald-100 text-emerald-700"
                        }`}
                        variant="secondary"
                      >
                        {isSoldOut ? "Sold Out" : isLowStock ? "Selling Fast!" : "Available"}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold leading-tight text-slate-800">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-2xl">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-semibold uppercase mb-1">Capacity</span>
                        <div className="flex items-center text-slate-700 font-bold">
                          <Users className="w-4 h-4 mr-2 text-violet-500" />
                          {event.totalCapacity}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-semibold uppercase mb-1">Remaining</span>
                        <div className={`flex items-center font-bold ${isSoldOut ? 'text-rose-500' : 'text-slate-700'}`}>
                          <Ticket className={`w-4 h-4 mr-2 ${isSoldOut ? 'text-rose-500' : 'text-fuchsia-500'}`} />
                          {event.remainingTickets}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleBookTicket(event.id)} 
                      disabled={isSoldOut}
                      className={`w-full h-12 rounded-xl text-md font-bold transition-all duration-300 cursor-pointer ${
                        isSoldOut 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md hover:shadow-xl hover:scale-[1.02]"
                      }`}
                    >
                      {isSoldOut ? "Better Luck Next Time" : "Snag a Ticket"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="mb-8 flex items-center gap-4">
            <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-2xl">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Your Tickets</h2>
              <p className="text-slate-500">Manage your upcoming event bookings</p>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">You haven't booked any events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBookings.map((booking: any) => (
                <div key={booking.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-grow mb-4 sm:mb-0 w-full">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{booking.event.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 gap-4">
                      <span className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1.5" />
                        {new Date(booking.event.date).toLocaleDateString()}
                      </span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Code: {booking.uniqueCode}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelTicket(booking.id)}
                    className="w-full sm:w-auto rounded-xl flex items-center gap-2 hover:bg-rose-600 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
