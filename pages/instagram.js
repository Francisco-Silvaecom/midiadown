import { useState } from "react";

export default function Instagram() {
  const [url, setUrl] = useState("");
  const [downloadData, setDownloadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setDownloadData(null);
    setError("");

    try {
      const r = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      const data = await r.json();

      if (data.error) {
        setError(data.error);
      } else {
        setDownloadData(data);
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Baixar Mídia do Instagram</h1>
      <p>Insira o link de uma mídia do Instagram:</p>

      <input
        type="text"
        placeholder="Cole o link aqui..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #aaa",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={handleDownload}
        style={{
          background: "#0095f6",
          color: "white",
          padding: "12px",
          width: "100%",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
        disabled={loading}
      >
        {loading ? "Carregando..." : "Buscar mídia"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          ⚠ {error}
        </p>
      )}

      {downloadData?.download_url && (
        <div style={{ marginTop: "20px" }}>
          <h3>Mídia encontrada!</h3>
          <a
            href={downloadData.download_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "green",
              color: "white",
              padding: "12px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ⬇ Baixar Agora
          </a>
        </div>
      )}
    </div>
  );
}
