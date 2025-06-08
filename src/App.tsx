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

  useEffect(() => {
    // Get cast hash and FID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const castHash = params.get("castHash");
    const castFid = params.get("castFid");

    console.log({ castHash, castFid });

    if (castHash && castFid) {
      // Fetch the cast text using the author's FID and cast hash
      fetchCastText(parseInt(castFid), castHash).then((castText) => {
        if (castText) {
          // Construct Google Translate URL
          const url = new URL("https://translate.google.com");
          url.searchParams.append("sl", "auto"); // auto-detect source language
          url.searchParams.append("tl", "en"); // default to English
          url.searchParams.append("q", castText);
          url.searchParams.append("ie", "UTF-8");
          url.searchParams.append("oe", "UTF-8");

          console.log({ translateUrl: url.toString() });
          setTranslateUrl(url.toString());
        }
      });
    }
  }, []);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const handleTranslate = async () => {
    if (translateUrl) {
      await sdk.actions.openUrl(translateUrl);
    }
  };

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
        {translateUrl ? (
          <button
            onClick={handleTranslate}
            style={{
              padding: "16px 32px",
              fontSize: "20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🔤 Translate Cast
          </button>
        ) : (
          <p>Loading cast...</p>
        )}
      </div>
    </div>
  );
}

export default App;
