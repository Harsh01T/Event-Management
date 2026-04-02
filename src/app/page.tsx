"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, Sparkles, Ticket, Trash2, LogOut, 
  LogIn, Minus, Plus, AlertCircle 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [user, setUser] = useState<any>(null);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelAmount, setCancelAmount] = useState(1);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = filterDate ? `/api/events?date=${filterDate}` : "/api/events";
      const savedUser = localStorage.getItem("user");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      const [eventsRes, bookingsRes] = await Promise.all([
        fetch(url),
        currentUser 
          ? fetch(`/api/users/${currentUser.id}/bookings`) 
          : Promise.resolve({ json: () => ({ success: true, data: [] }) })
      ]);
      
      const eventsData = await eventsRes.json();
      const bookingsData = await (bookingsRes as any).json();

      if (eventsData.success) setEvents(eventsData.data);
      if (bookingsData.success) setMyBookings(bookingsData.data);
    } catch (error) {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const groupDataByMonth = (items: any[], isBooking = false) => {
    return items.reduce((groups: Record<string, any[]>, item: any) => {
      const dateSource = isBooking ? item.event.date : item.date;
      const date = new Date(dateSource);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(item);
      return groups;
    }, {});
  };

  const groupedEvents = groupDataByMonth(events);
  const sortedEventMonths = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const upcomingBookingsList = myBookings.filter((b: any) => new Date(b.event.date) >= new Date());
  const groupedBookings = groupDataByMonth(upcomingBookingsList, true);
  const sortedBookingMonths = Object.keys(groupedBookings).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const pastBookings = myBookings.filter((b: any) => new Date(b.event.date) < new Date());

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMyBookings([]);
    toast.info("Logged out successfully");
    router.refresh(); 
  };

  const handleQuantityChange = (eventId: string, delta: number) => {
    setTicketCounts(prev => ({
      ...prev,
      [eventId]: Math.max(1, (prev[eventId] || 1) + delta)
    }));
  };

  const handleBookTicket = async (eventId: string) => {
    if (!user) {
      toast.error("Sign-in Required", { description: "Redirecting to sign-in..." });
      router.push("/sign-in");
      return;
    }
    const count = ticketCounts[eventId] || 1;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, eventId, ticketCount: count }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${count} Ticket(s) Secured! 🎉`);
        fetchData();
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const openCancelDialog = (booking: any) => {
    setSelectedBooking(booking);
    setCancelAmount(1);
    setCancelDialogOpen(true);
  };

  const executeCancel = async () => {
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}?count=${cancelAmount}`, { 
        method: "DELETE" 
      });
      const data = await res.json();
      if (data.success) {
        toast.info(cancelAmount === 1 ? "Ticket Cancelled" : `${cancelAmount} Tickets Cancelled`);
        setCancelDialogOpen(false);
        fetchData(); 
      }
    } catch (error) {
      toast.error("Failed to cancel.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-violet-500 font-bold">
        <Sparkles className="animate-spin mr-2" /> Sorting through Epic Events...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Epic <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">Events.</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Find your next big adventure.</p>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-white h-12 px-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-bold leading-none">Account</span>
                  <span className="text-sm font-bold text-slate-700">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="cursor-pointer text-rose-500 hover:bg-rose-50 rounded-xl h-8">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => router.push("/sign-in")} className="cursor-pointer bg-slate-900 text-white rounded-2xl px-6 h-12 hover:bg-slate-800 shadow-lg font-bold">
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            )}
            
            <div className="flex items-center gap-3 bg-white h-12 px-4 rounded-2xl shadow-sm border border-slate-200">
              <CalendarDays className="w-5 h-5 text-violet-500" />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="outline-none bg-transparent text-sm font-bold cursor-pointer" />
            </div>
          </div>
        </div>

        <section className="space-y-16">
          {sortedEventMonths.map((month) => (
            <div key={month} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{month}</h2>
                <div className="h-[1px] flex-grow bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groupedEvents[month].map((event: any) => {
                  const isSoldOut = event.remainingTickets === 0;
                  const isLowStock = !isSoldOut && (event.remainingTickets / event.totalCapacity) < 0.2;
                  const count = ticketCounts[event.id] || 1;
                  return (
                    <Card key={event.id} className="relative flex flex-col justify-between overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all bg-white/80 backdrop-blur-sm rounded-3xl group">
                      <div className={`h-2 w-full bg-gradient-to-r ${isLowStock ? 'from-orange-500 to-red-500' : 'from-violet-500 to-fuchsia-500'}`} />
                      <CardHeader>
                        <Badge variant={isSoldOut ? "destructive" : isLowStock ? "outline" : "secondary"} className={`w-fit mb-2 ${isLowStock ? "border-orange-500 text-orange-600 animate-pulse" : ""}`}>
                          {isSoldOut ? "Sold Out" : isLowStock ? "🔥 Hurry Up! Only few left" : "Tickets Available"}
                        </Badge>
                        <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                        <div className="flex items-center text-sm text-slate-500 mt-2">
                          <CalendarDays className="w-4 h-4 mr-1.5 text-violet-500" />
                          {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Available</p>
                            <p className="font-bold text-slate-700">{event.remainingTickets} / {event.totalCapacity}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-200">
                            <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => handleQuantityChange(event.id, -1)} disabled={isSoldOut}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-6 text-center text-violet-600">{count}</span>
                            <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => handleQuantityChange(event.id, 1)} disabled={isSoldOut || count >= event.remainingTickets}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button onClick={() => handleBookTicket(event.id)} disabled={isSoldOut} className={`cursor-pointer w-full h-12 rounded-xl font-bold text-white shadow-md ${isLowStock ? 'bg-orange-600 hover:bg-orange-700' : 'bg-violet-600 hover:bg-violet-700'}`}>
                          {isSoldOut ? "Full Capacity" : `Book ${count} Spot(s)`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {user && (
          <section className="bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/50 shadow-xl">
            <div className="mb-10 flex items-center gap-4">
              <div className="p-4 bg-fuchsia-100 text-fuchsia-600 rounded-2xl"><Ticket className="w-8 h-8" /></div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Tickets</h2>
                <p className="text-slate-500">Manage your active bookings</p>
              </div>
            </div>

            <div className="space-y-12">
              {sortedBookingMonths.map(month => (
                <div key={month} className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-tighter text-emerald-600/70 border-l-2 border-emerald-500 pl-3">{month}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groupedBookings[month].map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight mb-1">{booking.event.title}</h4>
                          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(booking.event.date).toLocaleDateString()}</p>
                          <div className="flex gap-2 items-center">
                             <Badge variant="outline" className="font-mono text-[10px] text-violet-600">{booking.uniqueCode}</Badge>
                             <span className="text-[10px] text-slate-400 font-bold">{booking.ticketCount} Tickets</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => openCancelDialog(booking)} className="cursor-pointer rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-10 px-4">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {pastBookings.length > 0 && (
                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Past Memories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pastBookings.map((booking: any) => (
                      <div key={booking.id} className="p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 grayscale-[0.5] opacity-70">
                        <h4 className="font-bold text-sm text-slate-600">{booking.event.title}</h4>
                        <p className="text-[10px] text-slate-400">{new Date(booking.event.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertCircle className="text-rose-500"/> Cancel Booking?</DialogTitle>
            <DialogDescription>
              How many tickets for <strong>{selectedBooking?.event.title}</strong> do you want to release?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-6 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => setCancelAmount(Math.max(1, cancelAmount-1))}><Minus className="w-4 h-4"/></Button>
             <div className="text-center">
                <span className="text-4xl font-black text-slate-900">{cancelAmount}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tickets</p>
             </div>
             <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => setCancelAmount(Math.min(selectedBooking?.ticketCount || 1, cancelAmount+1))}><Plus className="w-4 h-4"/></Button>
          </div>
          <DialogFooter className="sm:justify-center mt-4 gap-2">
            <Button variant="ghost" onClick={() => setCancelDialogOpen(false)} className="cursor-pointer rounded-xl">Keep Them</Button>
            <Button onClick={executeCancel} className="cursor-pointer bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8">Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
