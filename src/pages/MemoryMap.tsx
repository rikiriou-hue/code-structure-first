import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MemoryMapForm from "@/components/MemoryMapForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CATEGORIES = [
  { value: "first_date", label: "First Date", emoji: "💑" },
  { value: "first_kiss", label: "First Kiss", emoji: "💋" },
  { value: "first_trip", label: "First Trip", emoji: "✈️" },
  { value: "favorite_spot", label: "Favorite Spot", emoji: "⭐" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉" },
];

const getCategoryEmoji = (cat: string) => CATEGORIES.find(c => c.value === cat)?.emoji || "📍";
const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:28px;text-align:center;line-height:1;">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

interface MemoryLocation {
  id: string;
  title: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  memory_date: string | null;
  user_id: string;
  couple_id: string;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MemoryMap = () => {
  const [locations, setLocations] = useState<MemoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clickedPos, setClickedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("memory_locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load locations");
    else setLocations((data as MemoryLocation[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setClickedPos({ lat, lng });
    setShowForm(true);
  };

  const resetForm = () => {
    setClickedPos(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("memory_locations").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Lokasi dihapus");
      fetchLocations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const center: [number, number] = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [-6.2, 106.8];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Memory Map</h1>
              <p className="font-handwritten text-lg text-muted-foreground mt-1">tempat-tempat spesial kita 📍</p>
            </div>
            {showForm ? (
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-muted text-foreground font-handwritten text-lg hover:opacity-90 transition">
                <X className="w-4 h-4" /> Batal
              </button>
            ) : (
              <p className="font-handwritten text-sm text-muted-foreground">tap peta untuk tandai lokasi</p>
            )}
          </div>

          {/* Map */}
          <div className="scrapbook-card p-2 mb-8 relative">
            <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
            <div className="tape-strip -top-2.5 right-8 rotate-[3deg]" />
            <div className="rounded-sm overflow-hidden" style={{ height: "400px" }}>
              {!loading && (
                <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickHandler onClick={handleMapClick} />
                  {clickedPos && (
                    <Marker position={[clickedPos.lat, clickedPos.lng]} icon={createEmojiIcon("📌")} />
                  )}
                  {locations.map((loc) => (
                    <Marker
                      key={loc.id}
                      position={[loc.latitude, loc.longitude]}
                      icon={createEmojiIcon(getCategoryEmoji(loc.category))}
                    >
                      <Popup maxWidth={280}>
                        <div className="text-center">
                          {loc.photo_url && (
                            <img
                              src={loc.photo_url}
                              alt={loc.title}
                              className="w-full h-32 object-cover rounded-sm mb-2"
                            />
                          )}
                          <p className="font-bold text-sm">{getCategoryEmoji(loc.category)} {loc.title}</p>
                          <p className="text-xs text-muted-foreground">{getCategoryLabel(loc.category)}</p>
                          {loc.description && <p className="text-xs mt-1">{loc.description}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{loc.memory_date}</p>
                          {loc.user_id === currentUserId && (
                            <button
                              onClick={() => setDeleteId(loc.id)}
                              className="mt-2 text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 mx-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && clickedPos && (
            <MemoryMapForm
              clickedPos={clickedPos}
              onSuccess={() => {
                resetForm();
                fetchLocations();
              }}
              onCancel={resetForm}
            />
          )}

          {/* Legend */}
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {CATEGORIES.map((cat) => {
                const count = locations.filter(l => l.category === cat.value).length;
                if (count === 0) return null;
                return (
                  <span key={cat.value} className="font-handwritten text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {cat.emoji} {cat.label} ({count})
                  </span>
                );
              })}
            </div>
          )}
        </main>
      </PageTransition>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus lokasi ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemoryMap;