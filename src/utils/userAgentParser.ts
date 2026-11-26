export interface ParsedUserAgent {
  browser: string;
  browserVersion?: string;
  browserDisplay: string;
  os: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot/API";
  summary: string;
}

export const parseUserAgent = (ua?: string | null): ParsedUserAgent => {
  if (!ua || typeof ua !== "string") {
    return {
      browser: "Unknown Browser",
      browserDisplay: "Unknown Browser",
      os: "Unknown OS",
      deviceType: "Desktop",
      summary: "Unknown",
    };
  }

  // Detect Tool / API / Bot clients
  if (ua.includes("PostmanRuntime")) {
    const version = ua.match(/PostmanRuntime\/([\d.]+)/)?.[1] || "";
    return {
      browser: "Postman",
      browserVersion: version,
      browserDisplay: version ? `Postman ${version}` : "Postman",
      os: "API Client",
      deviceType: "Bot/API",
      summary: version ? `Postman ${version}` : "Postman",
    };
  }
  if (ua.toLowerCase().includes("curl")) {
    return {
      browser: "cURL",
      browserDisplay: "cURL CLI",
      os: "CLI",
      deviceType: "Bot/API",
      summary: "cURL CLI",
    };
  }

  // Detect OS
  let os = "Unknown OS";
  let deviceType: ParsedUserAgent["deviceType"] = "Desktop";

  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.2/i.test(ua)) os = "Windows 8";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone/i.test(ua)) {
    os = "iOS (iPhone)";
    deviceType = "Mobile";
  } else if (/iPad/i.test(ua)) {
    os = "iOS (iPad)";
    deviceType = "Tablet";
  } else if (/Android/i.test(ua)) {
    os = "Android";
    deviceType = /Mobile/i.test(ua) ? "Mobile" : "Tablet";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // Detect Browser
  let browser = "Other Browser";
  let browserVersion = "";

  if (/Edg\/([\d.]+)/i.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/i);
    browser = "Edge";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/OPR\/([\d.]+)|Opera\/([\d.]+)/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/i);
    browser = "Opera";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([\d.]+)/i);
    browser = "Samsung Internet";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/Chrome\/([\d.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/i);
    browser = "Chrome";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/i);
    browser = "Firefox";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/Version\/([\d.]+).*Safari/i.test(ua)) {
    const match = ua.match(/Version\/([\d.]+).*Safari/i);
    browser = "Safari";
    browserVersion = match?.[1] ? match[1].split(".")[0] : "";
  } else if (/MSIE ([\d.]+)|Trident\/.*rv:([\d.]+)/i.test(ua)) {
    browser = "Internet Explorer";
  }

  const browserDisplay = browserVersion ? `${browser} ${browserVersion}` : browser;
  const summary = os !== "Unknown OS" ? `${browserDisplay} • ${os}` : browserDisplay;

  return {
    browser,
    browserVersion,
    browserDisplay,
    os,
    deviceType,
    summary,
  };
};
