import { useState } from "react";

export default function Instagram() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!url) {
      setError("Cole uma URL do Instagram");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/instagram?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.error) {
        setError("Não foi possível baixar. Verifique se o link é público.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
      <h2>Downloader Instagram</h2>

      <input
        type="text"
        placeholder="Cole o link do Instagram aqui"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginTop: "12px",
        }}
      />

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "14px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Baixando..." : "Baixar Mídia"}
      </button>

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}

      {result?.media && (
        <div style={{ marginTop: "20px" }}>
          {result.media.includes(".mp4") ? (
            <video controls width="100%" src={result.media} />
          ) : (
            <img src={result.media} alt="Instagram media" style={{ width: "100%" }} />
          )}

          <a
            href={result.media}
            download
            style={{
              display: "block",
              marginTop: "16px",
              backgroundColor: "#28a745",
              padding: "12px",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Download
          </a>
        </di
