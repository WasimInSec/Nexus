import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Maximize, Home, Minimize } from "lucide-react";

export const MapControls = () => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetView = () => {
    const bounds = L.latLngBounds(ipData.map(ip => [ip.location.latitude, ip.location.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        className="bg-gray-800/90 border-gray-700 hover:bg-gray-700"
      >
        <Maximize className="h-4 w-4 text-gray-200" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleResetView}
        className="bg-gray-800/90 border-gray-700 hover:bg-gray-700"
      >
        <Home className="h-4 w-4 text-gray-200" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="bg-gray-800/90 border-gray-700 hover:bg-gray-700"
      >
        <Minimize className="h-4 w-4 text-gray-200" />
      </Button>
    </div>
  );
};