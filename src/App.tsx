import { useEffect, useState } from "react";
import "./App.css";
import { sdk } from "@farcaster/frame-sdk";

async function fetchCastText(fid: number, hash: string) {
  try {
    const response = await fetch(
      `https://hub.merv.fun/v1/castById?fid=${fid}&hash=${hash}`
    );
    const data = await response.json();
    return data.data.castAddBody.text;
  } catch (error) {
    console.error("Error fetching cast:", error);
    return "";
  }
}

function App() {
  const [translateUrl, setTranslateUrl] = useState<string | null>(null);
  const [castText, setCastText] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState(() => {
    return localStorage.getItem("targetLang") || "en";
  });

  // Get cast hash and FID from URL parameters
  const params = new URLSearchParams(window.location.search);
  const castHash = params.get("castHash");
  const castFid = params.get("castFid");

  useEffect(() => {
    console.log({ castHash, castFid });

    if (castHash && castFid) {
      // Fetch the cast text using the author's FID and cast hash
      fetchCastText(parseInt(castFid), castHash).then((text) => {
        if (text) {
          setCastText(text);
        }
      });
    }
  }, [castHash, castFid]);

  useEffect(() => {
    if (castText) {
      const url = new URL("https://translate.google.com");
      url.searchParams.append("sl", "auto");
      url.searchParams.append("tl", targetLang);
      url.searchParams.append("q", castText);
      url.searchParams.append("ie", "UTF-8");
      url.searchParams.append("oe", "UTF-8");
      setTranslateUrl(url.toString());
    }
  }, [castText, targetLang]);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    console.log("translateUrl", translateUrl);
    if (translateUrl) {
      console.log("opening url", translateUrl);
      sdk.actions.openUrl(translateUrl);
    }
  }, [translateUrl]);

  const handleAddMiniApp = async () => {
    await sdk.actions.addMiniApp();
  };

  return (
    <div className="app">
      <h1>Cast Translator</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleAddMiniApp}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ➕ Add to Farcaster
        </button>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Target language
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              localStorage.setItem("targetLang", e.target.value);
            }}
            style={{ padding: "8px" }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh-CN">Chinese (Simplified)</option>
          </select>
        </label>
        {castHash && castFid && !translateUrl && <p>Loading cast...</p>}
      </div>
    </div>
  );
}

export default App;
