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
        setError("URL inválida ou não suportada.");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      textAlign: "center",
      flexDirection: "column",
      backgroundColor: "#111",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    }}>
      
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        MidiaDown 🚀
      </h1>

      <p style={{ marginBottom: "20px", opacity: 0.85 }}>
        Baixe Reels do Instagram em poucos segundos
      </p>

      <input
        type="text"
        placeholder="Cole o link do Reels aqui..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "95%",
          maxWidth: "450px",
          padding: "12px 15px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
          marginBottom: "15px",
        }}
      />

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#555" : "#00b894",
          padding: "12px 18px",
          borderRadius: "8px",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          width: "95%",
          maxWidth: "450px",
        }}
      >
        {loading ? "Carregando..." : "Baixar Vídeo 📥"}
      </button>

      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

      {result && result.media && (
        <div style={{ marginTop: "25px" }}>
          <video
            src={result.media}
            controls
            width="90%"
            style={{ maxWidth: "450px", borderRadius: "10px" }}
          />
          <br /><br />

          <a
            href={result.media}
            download
            style={{
              backgroundColor: "#0984e3",
              padding: "12px 18px",
              borderRadius: "8px",
              color: "white",
              textDecoration: "none",
            }}
          >
            📥 Download Vídeo
          </a>
        </div>
      )}

      <footer style={{ marginTop: "40px", opacity: 0.6 }}>
        © {new Date().getFullYear()} MidiaDown — Todos os direitos reservados
      </footer>
    </div>
  );
}
