import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useState, memo, useEffect } from "react";
import { format } from "date-fns";
import {
  Shield, ShieldAlert, ShieldCheck, Globe, Activity,
  Star, Server, Radio, ChevronRight, Search, RefreshCw,
  LayoutDashboard, Map, Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { MapControls } from "./MapControls";
import { motion, AnimatePresence } from "framer-motion";
import { StatsOverview } from "./StatsOverview";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

const ipData = [
  {
    ip: "117.99.42.186",
    location: { latitude: 20.5937, longitude: 78.9629 },
    country: "India",
    risk: "high",
    lastActivity: "2024-10-24T15:30:00Z",
    blocked: true,
    suspiciousEvents: 15,
    totalRequests: 156,
    reputation: { score: 85, reports: 12 },
    details: {
      isp: "Airtel Networks",
      type: "Data Center",
      protocols: ["HTTP", "HTTPS", "SSH"],
      bandwidth: "2.5 GB/day",
    },
  },
  {
    ip: "82.45.123.45",
    location: { latitude: 51.5074, longitude: -0.1278 },
    country: "United Kingdom",
    risk: "medium",
    lastActivity: "2024-10-24T14:45:00Z",
    blocked: false,
    suspiciousEvents: 5,
    totalRequests: 89,
    reputation: { score: 45, reports: 3 },
    details: {
      isp: "British Telecom",
      type: "Residential",
      protocols: ["HTTP", "HTTPS"],
      bandwidth: "1.2 GB/day",
    },
  },
  {
    ip: "43.78.12.91",
    location: { latitude: 35.6762, longitude: 139.6503 },
    country: "Japan",
    risk: "low",
    lastActivity: "2024-10-24T16:00:00Z",
    blocked: false,
    suspiciousEvents: 0,
    totalRequests: 234,
    reputation: { score: 10, reports: 0 },
    details: {
      isp: "NTT Communications",
      type: "Business",
      protocols: ["HTTP", "HTTPS", "FTP"],
      bandwidth: "3.1 GB/day",
    },
  },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "high":
      return "rgb(239, 68, 68)";
    case "medium":
      return "rgb(234, 179, 8)";
    case "low":
      return "rgb(34, 197, 94)";
    default:
      return "rgb(156, 163, 175)";
  }
};

interface CustomMarkerProps {
  ip: typeof ipData[0];
  position: [number, number];
  onClick: () => void;
}

const CustomMarker = ({ ip, position, onClick }: CustomMarkerProps) => {
  const riskColor = getRiskColor(ip.risk);
  
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${riskColor};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker position={position} icon={customIcon} eventHandlers={{ click: onClick }}>
      <Popup className="custom-popup">
        <div className="p-2 min-w-[200px]">
          <div className="font-semibold mb-2">{ip.ip}</div>
          <div className="text-sm space-y-1">
            <div>Country: {ip.country}</div>
            <div>Risk Level: <span style={{ color: riskColor }}>{ip.risk.toUpperCase()}</span></div>
            <div>Status: {ip.blocked ? "Blocked" : "Active"}</div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

interface IPDetailsCardProps {
  ip: typeof ipData[0];
  onClose: () => void;
}

const IPDetailsCard = memo(({ ip, onClose }: IPDetailsCardProps) => (
  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 w-96">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {ip.risk === "high" ? (
          <ShieldAlert className="w-5 h-5 text-red-500" />
        ) : ip.risk === "medium" ? (
          <Shield className="w-5 h-5 text-yellow-500" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-green-500" />
        )}
        <span className="font-semibold">{ip.ip}</span>
      </div>
      <div className="flex gap-2">
        <Badge
          variant={ip.blocked ? "destructive" : "outline"}
          className="capitalize"
        >
          {ip.blocked ? "Blocked" : "Active"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Globe className="w-4 h-4" />
            Location Details
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <span className="text-gray-500 dark:text-gray-400">Country:</span>
            <span>{ip.country}</span>
            <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>
            <span>
              {ip.location.latitude.toFixed(2)}, {ip.location.longitude.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Activity className="w-4 h-4" />
            Activity Metrics
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <span className="text-gray-500 dark:text-gray-400">Total Requests:</span>
            <span>{ip.totalRequests}</span>
            <span className="text-gray-500 dark:text-gray-400">Suspicious Events:</span>
            <span className="text-red-500">{ip.suspiciousEvents}</span>
            <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
            <span>{format(new Date(ip.lastActivity), 'PPp')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Server className="w-4 h-4" />
            Technical Details
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <span className="text-gray-500 dark:text-gray-400">ISP:</span>
            <span>{ip.details.isp}</span>
            <span className="text-gray-500 dark:text-gray-400">Type:</span>
            <span>{ip.details.type}</span>
            <span className="text-gray-500 dark:text-gray-400">Bandwidth:</span>
            <span>{ip.details.bandwidth}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Radio className="w-4 h-4" />
            Protocols
          </div>
          <div className="flex gap-2 pl-6 flex-wrap">
            {ip.details.protocols.map((protocol) => (
              <Badge key={protocol} variant="secondary">
                {protocol}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4" />
            Reputation
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pl-6">
            <span className="text-gray-500 dark:text-gray-400">Score:</span>
            <span>{ip.reputation.score}/100</span>
            <span className="text-gray-500 dark:text-gray-400">Reports:</span>
            <span>{ip.reputation.reports}</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
));

interface MapComponentProps {
  onThemeError: (error: string) => void;
}

const MapComponent = ({ onThemeError }: MapComponentProps) => {
  const { theme } = useTheme();
  const [selectedIP, setSelectedIP] = useState<typeof ipData[0] | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapStyle, setMapStyle] = useState(theme === 'dark' ? 'dark' : 'default');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mapStyles = {
    default: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  const filteredData = ipData.filter(ip => {
    const matchesSearch = ip.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ip.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || ip.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  useEffect(() => {
    try {
      setMapStyle(theme === 'dark' ? 'dark' : 'default');
    } catch (error) {
      onThemeError('Failed to switch map theme. Please try refreshing the page.');
    }
  }, [theme, onThemeError]);

  useEffect(() => {
    if (!map) return;
    const bounds = L.latLngBounds(filteredData.map(ip => [ip.location.latitude, ip.location.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, filteredData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-[2000] animate-slide-up';
      notification.textContent = 'Data refreshed successfully';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        className="absolute left-0 top-0 h-full bg-card/95 backdrop-blur-sm z-[1000] border-r border-border flex flex-col"
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <motion.span 
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
            className="font-semibold text-white dark:text-gray-200"
          >
            IP Monitor
          </motion.span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        <div className="p-2 space-y-2">
          {[
            { icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
            { icon: <Map className="h-4 w-4" />, label: "Map View" },
            { icon: <Settings className="h-4 w-4" />, label: "Settings" },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-gray-200"
            >
              {item.icon}
              <motion.span
                animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                className="ml-2"
              >
                {item.label}
              </motion.span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 60 : 240 }}
        className="h-full relative"
      >
        {/* Search and Filter Controls */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-4 items-center">
          <div className="bg-card/10 backdrop-blur-md p-3 rounded-lg shadow-lg border border-border flex gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search IP or Country"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-white/10 border-white/20 text-white w-64 placeholder:text-gray-400"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white/10 border-white/20 text-white rounded-md px-3 py-1"
            >
              <option value="all">All Risks</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className={`bg-white/10 border-white/20 hover:bg-white/20 text-white ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={3}
            scrollWheelZoom={true}
            className="h-full w-full"
            ref={setMap}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={mapStyles[mapStyle]}
            />
            <ZoomControl position="bottomright" />
            <MapControls />
            
            {filteredData.map((ip) => (
              <CustomMarker
                key={ip.ip}
                ip={ip}
                position={[ip.location.latitude, ip.location.longitude]}
                onClick={() => setSelectedIP(ip)}
              />
            ))}
          </MapContainer>
        </div>

        {/* Stats Overview */}
        <StatsOverview data={filteredData} />

        {/* IP Details Card */}
        <AnimatePresence>
          {selectedIP && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute top-4 right-4 z-[1000]"
            >
              <IPDetailsCard ip={selectedIP} onClose={() => setSelectedIP(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MapComponent;