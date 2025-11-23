import { useState } from "react";

export default function Instagram() {
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return alert("Digite uma URL válida");

    setLoading(true);
    setDownloadUrl("");

    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (data.download_url) {
        setDownloadUrl(data.download_url);
      } else {
        alert("Erro ao encontrar a mídia. Verifique a URL.");
      }
    } catch (e) {
      alert("Erro ao tentar baixar mídia.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Baixar Mídia do Instagram</h1>
      <input
        type="text"
        placeholder="Cole o link do Instagram aqui"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "70%",
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          marginLeft: 10,
          padding: "10px 20px",
          fontSize: 16,
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Processando..." : "Download"}
      </button>

      {downloadUrl && (
        <div style={{ marginTop: 20 }}>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              backgroundColor: "green",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Baixar Arquivo
          </a>
        </div>
      )}
    </div>
  );
}
