import axios from "axios";
import dns from "dns";
import { promisify } from "util";
import { VpnLog } from "../models/VpnLog.js";

const dnsResolve = promisify(dns.resolve);
const IPINFO_TOKEN = "5f4c260e6054f1";
const PROXYCHECK_TOKEN = "mn2i2c-407602-it2251-h9x6o2";
const IP2LOCATION_TOKEN = "DF092EBD834C99181FE8993AA68A7F5A";

const vpnDetection = async (req, res, next) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
    ip = ip.replace("::ffff:", "");

    // Get real IP through multiple methods
    const realIpData = await getRealIpAddress(req);

    // Multi-source VPN detection
    const [
      ipInfoData,
      proxyCheckData,
      ip2LocationData,
      dnsBlData,
      portScanData,
    ] = await Promise.allSettled([
      checkIpInfo(ip),
      checkProxyCheck(ip),
      checkIp2Location(ip),
      checkDnsBlocklists(ip),
      checkCommonVpnPorts(ip),
    ]);

    // Comprehensive VPN detection logic
    const vpnAnalysis = analyzeVpnIndicators({
      ipInfo: ipInfoData.value,
      proxyCheck: proxyCheckData.value,
      ip2Location: ip2LocationData.value,
      dnsbl: dnsBlData.value,
      portScan: portScanData.value,
      realIp: realIpData,
    });

    // Store enhanced detection result
    await VpnLog.create({
      ip,
      realIp: realIpData.realIp,
      isVpn: vpnAnalysis.isVpn,
      vpnProvider: vpnAnalysis.provider,
      confidenceScore: vpnAnalysis.confidence,
      detectionMethods: vpnAnalysis.methods,
      realLocation: realIpData.location,
      details: {
        ...vpnAnalysis.details,
        ipInfo: ipInfoData.value,
        proxyCheck: proxyCheckData.value,
        ip2Location: ip2LocationData.value,
        dnsbl: dnsBlData.value,
        portScan: portScanData.value,
      },
      userAgent: req.headers["user-agent"],
      headers: req.headers,
    });

    // Add enhanced VPN status to request
    req.vpnStatus = {
      isVpn: vpnAnalysis.isVpn,
      provider: vpnAnalysis.provider,
      confidence: vpnAnalysis.confidence,
      realLocation: realIpData.location,
      details: vpnAnalysis,
    };

    // Set response headers
    if (vpnAnalysis.isVpn) {
      res.set({
        "X-VPN-Detected": "true",
        "X-VPN-Provider": vpnAnalysis.provider,
        "X-VPN-Confidence": vpnAnalysis.confidence.toString(),
      });
    }

    next();
  } catch (error) {
    console.error("VPN detection error:", error.message);
    next();
  }
};

async function getRealIpAddress(req) {
  try {
    // Multiple IP detection methods
    const results = await Promise.all([
      axios.get("https://api.ipify.org?format=json"),
      axios.get("https://ifconfig.me/ip"),
      axios.get("https://api.myip.com"),
    ]);

    const ips = results.map((r) => r.data.ip || r.data);
    const mostCommonIp = findMostCommonIp(ips);

    return {
      realIp: mostCommonIp,
      location: await getLocationData(mostCommonIp),
    };
  } catch (error) {
    console.error("Real IP detection error:", error);
    return null;
  }
}

function extractIPFromCandidate(candidateStr) {
  const matches = candidateStr.match(
    /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
  );
  return matches && matches[1];
}

async function checkIpInfo(ip) {
  const response = await axios.get(
    `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
  );
  return response.data;
}

async function checkProxyCheck(ip) {
  const response = await axios.get(
    `https://proxycheck.io/v2/${ip}?key=${PROXYCHECK_TOKEN}&vpn=1&asn=1`
  );
  return response.data;
}

async function checkIp2Location(ip) {
  const response = await axios.get(
    `https://api.ip2location.io?key=DF092EBD834C99181FE8993AA68A7F5A&ip=${ip}&format=json`
  );
  return response.data;
}

async function checkDnsBlocklists(ip) {
  const dnsblLists = [
    "sbl.spamhaus.org",
    "xbl.spamhaus.org",
    "zen.spamhaus.org",
  ];

  const results = await Promise.all(
    dnsblLists.map(async (dnsbl) => {
      try {
        const reversedIp = ip.split(".").reverse().join(".");
        await dnsResolve(`${reversedIp}.${dnsbl}`);
        return true;
      } catch {
        return false;
      }
    })
  );

  return results.some((result) => result);
}

async function checkCommonVpnPorts(ip) {
  const commonPorts = [1194, 443, 1723, 500];
  // Implementation would depend on your server's capabilities
  // This is a placeholder for the concept
  return {
    openPorts: commonPorts,
    suspicious: false,
  };
}

function analyzeVpnIndicators(data) {
  let confidence = 0;
  const methods = [];
  let provider = "Unknown";

  // Comprehensive VPN detection logic
  if (data.ipInfo) {
    const vpnKeywords = [
      "vpn",
      "proxy",
      "hosting",
      "datacenter",
      "cloud",
      "anonymous",
    ];
    if (
      vpnKeywords.some(
        (keyword) =>
          (data.ipInfo.org || "").toLowerCase().includes(keyword) ||
          (data.ipInfo.company || "").toLowerCase().includes(keyword)
      )
    ) {
      confidence += 30;
      methods.push("IP organization");
      provider = extractProviderName(data.ipInfo.org || data.ipInfo.company);
    }
  }

  if (data.proxyCheck?.proxy) {
    confidence += 40;
    methods.push("ProxyCheck");
    provider = data.proxyCheck.provider || provider;
  }

  if (data.ip2Location?.proxy_type) {
    confidence += 35;
    methods.push("IP2Location");
    provider = data.ip2Location.proxy_type;
  }

  if (data.dnsbl) {
    confidence += 20;
    methods.push("DNSBL");
  }

  if (data.realIp && data.realIp !== data.ipInfo?.ip) {
    confidence += 30;
    methods.push("IP mismatch");
  }

  return {
    isVpn: confidence >= 50,
    confidence: Math.min(confidence, 100),
    provider,
    methods,
    details: data,
  };
}

function extractProviderName(orgString) {
  if (!orgString) return "Unknown";

  // Common VPN provider keywords
  const providers = {
    nordvpn: "NordVPN",
    expressvpn: "ExpressVPN",
    protonvpn: "ProtonVPN",
    privateinternetaccess: "PIA",
    mullvad: "Mullvad",
    cyberghost: "CyberGhost",
    surfshark: "Surfshark",
  };

  const lowerOrg = orgString.toLowerCase();
  for (const [key, value] of Object.entries(providers)) {
    if (lowerOrg.includes(key)) return value;
  }

  return orgString.split(" ")[0];
}

function findMostCommonIp(ips) {
  const frequency = {};
  let maxFreq = 0;
  let mostCommonIp = ips[0];

  for (const ip of ips) {
    frequency[ip] = (frequency[ip] || 0) + 1;
    if (frequency[ip] > maxFreq) {
      maxFreq = frequency[ip];
      mostCommonIp = ip;
    }
  }

  return mostCommonIp;
}

async function getLocationData(ip) {
  try {
    const response = await axios.get(
      `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
    );
    return {
      city: response.data.city,
      region: response.data.region,
      country: response.data.country,
      location: response.data.loc,
      timezone: response.data.timezone,
    };
  } catch (error) {
    console.error("Location detection error:", error);
    return null;
  }
}

export default vpnDetection;
