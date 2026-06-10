/**
 * Utility to parse proxy strings in different formats:
 * Format 1: username:password@ip:port (or domain:port)
 * Format 2: ip:port:username:password
 * Format 3: ip:port
 * Format 4: username:password:ip:port
 */

export interface ParsedProxy {
  ip: string
  port: string
  username?: string
  password?: string
}

export function parseProxyString(input: string): ParsedProxy | null {
  const clean = input.trim();
  if (!clean) return null;

  // Helper to validate if a string looks like an IP address or hostname/domain
  const isIpOrDomain = (s: string): boolean => {
    if (!s) return false;
    // Allow letters, numbers, dots, and hyphens (IPs or hostnames)
    return /^[a-zA-Z0-9.-]+$/.test(s);
  };

  // Helper to check if string is a valid port number
  const isPort = (s: string): boolean => {
    if (!s) return false;
    if (!/^\d+$/.test(s)) return false;
    const val = parseInt(s, 10);
    return val >= 1 && val <= 65535;
  };

  // Format 1: username:password@ip:port
  if (clean.includes("@")) {
    const parts = clean.split("@");
    if (parts.length === 2) {
      const userPass = parts[0].split(":");
      const ipPort = parts[1].split(":");
      if (ipPort.length === 2 && isIpOrDomain(ipPort[0]) && isPort(ipPort[1])) {
        return {
          ip: ipPort[0],
          port: ipPort[1],
          username: userPass[0] || "",
          password: userPass[1] || "",
        };
      }
    }
    return null;
  }

  const colons = clean.split(":");

  // Format 3: ip:port
  if (colons.length === 2) {
    if (isIpOrDomain(colons[0]) && isPort(colons[1])) {
      return {
        ip: colons[0],
        port: colons[1],
        username: "",
        password: "",
      };
    }
    return null;
  }

  // Formats 2 & 4: 4 parts (ip:port:user:pass OR user:pass:ip:port)
  if (colons.length === 4) {
    const [p0, p1, p2, p3] = colons;

    const optAPort = isPort(p1);
    const optBPort = isPort(p3);
    const optAHost = isIpOrDomain(p0);
    const optBHost = isIpOrDomain(p2);

    // Heuristic 1: If only one option has a valid port, trust that one
    if (optAPort && !optBPort) {
      // Format 2: ip:port:username:password
      return {
        ip: p0,
        port: p1,
        username: p2,
        password: p3,
      };
    }

    if (optBPort && !optAPort) {
      // Format 4: username:password:ip:port
      return {
        ip: p2,
        port: p3,
        username: p0,
        password: p1,
      };
    }

    // Heuristic 2: Both are valid port strings. Look at the host part structure.
    // An IP/domain usually has dots (e.g. 1.2.3.4 or proxy.com).
    const p0HasDots = p0.includes(".");
    const p2HasDots = p2.includes(".");

    if (p0HasDots && !p2HasDots) {
      // Format 2
      return {
        ip: p0,
        port: p1,
        username: p2,
        password: p3,
      };
    }

    if (p2HasDots && !p0HasDots) {
      // Format 4
      return {
        ip: p2,
        port: p3,
        username: p0,
        password: p1,
      };
    }

    // Fallback: If still ambiguous, default to Format 2 (more common) if p1 is a port,
    // otherwise Format 4 if p3 is a port.
    if (optAPort) {
      return {
        ip: p0,
        port: p1,
        username: p2,
        password: p3,
      };
    }
    if (optBPort) {
      return {
        ip: p2,
        port: p3,
        username: p0,
        password: p1,
      };
    }
  }

  return null;
}
