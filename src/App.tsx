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
      const isMobile =
        /android|iphone|ipad|ipod|mobile|warpcast|farcaster/i.test(
          navigator.userAgent
        );
      if (isMobile) {
        window.location.href = translateUrl;
      } else {
        sdk.actions.openUrl(translateUrl);
      }
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
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ru">Russian</option>
            <option value="pt">Portuguese</option>
            <option value="it">Italian</option>
            <option value="nl">Dutch</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="tr">Turkish</option>
            <option value="pl">Polish</option>
            <option value="vi">Vietnamese</option>
            <option value="th">Thai</option>
            <option value="id">Indonesian</option>
            <option value="sv">Swedish</option>
            <option value="da">Danish</option>
            <option value="fi">Finnish</option>
            <option value="no">Norwegian</option>
            <option value="cs">Czech</option>
            <option value="el">Greek</option>
            <option value="he">Hebrew</option>
          </select>
        </label>
        {castHash && castFid && !translateUrl && <p>Loading cast...</p>}
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "10px",
          color: "#666",
          textAlign: "center",
          width: "100%",
          maxWidth: "600px",
          wordBreak: "break-all",
          padding: "0 16px",
        }}
      >
        {navigator.userAgent} isMobile:{" "}
        {/android|iphone|ipad|ipod|mobile|warpcast|farcaster/i.test(
          navigator.userAgent
        )
          ? "true"
          : "false"}
      </div>
    </div>
  );
}

export default App;
