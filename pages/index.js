import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/instagram?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.error) {
        setError("Erro ao processar a URL");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar à API");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial" }}>
      <h1>📥 MidiaDown</h1>
      <p>Baixe vídeos do Instagram (Reels)</p>

      <input
        type="text"
        placeholder="Cole o link do Instagram aqui..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "300px", padding: "10px", borderRadius: "8px" }}
      />
      <br /><br />

      <button 
        onClick={handleDownload} 
        disabled={loading}
        style={{
          backgroundColor: "#0070f3",
          padding: "10px 20px",
          borderRadius: "8px",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Carregando..." : "Baixar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && result.media && (
        <div style={{ marginTop: "20px" }}>
          <video
            src={result.media}
            controls
            width="300"
            style={{ borderRadius: "10px" }}
          />
          <br /><br />
          <a
            href={result.media}
            download
            style={{
              backgroundColor: "green",
              padding: "10px 20px",
              borderRadius: "8px",
              color: "white",
              textDecoration: "none"
            }}
          >
            📥 Download Vídeo
          </a>
        </div>
      )}
    </div>
  );
}
