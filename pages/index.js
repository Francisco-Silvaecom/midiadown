import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaData, setMediaData] = useState(null);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setMediaData(null);

    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      setMediaData(json);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar o link. Tente novamente!");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MídiaDown 🚀</h1>
      <p style={styles.subtitle}>Baixe vídeos e fotos de Instagram, TikTok e mais!</p>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Cole o link aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleDownload} style={styles.button}>
          {loading ? "Aguarde..." : "Baixar"}
        </button>
      </div>

      {mediaData?.download_url && (
        <div style={styles.resultBox}>
          <video
            src={mediaData.download_url}
            controls
            style={{ width: "100%", borderRadius: 10 }}
          />
          <a
            href={mediaData.download_url}
            download
            style={styles.downloadButton}
          >
            📥 Baixar Vídeo
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "60px auto",
    padding: 20,
    fontFamily: "Arial",
    textAlign: "center",
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 25,
  },
  form: {
    display: "flex",
    gap: 10,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    background: "#0070f3",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  resultBox: {
    background: "#f2f2f2",
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  downloadButton: {
    display: "block",
    background: "#12b886",
    textDecoration: "none",
    color: "#fff",
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    fontWeight: "bold",
  },
};
