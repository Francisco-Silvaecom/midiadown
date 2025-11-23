// pages/index.js
import React, { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!urlInput.trim()) {
      setError('Por favor, insira uma URL válida.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/extract?url=${encodeURIComponent(urlInput)}`);
      const data = await response.json();

      if (data.ok && data.media) {
        setResult(data.media);
      } else {
        setError(data.message || 'Não foi possível encontrar a mídia. Verifique se o Pin é de vídeo/imagem e não de história.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO ATUALIZADA para usar o endpoint /api/stream (download forçado)
  const handleStream = () => {
    if (result && result.url) {
      const urlParts = result.url.split('/');
      let filename = urlParts[urlParts.length - 1] || (result.type === 'video' ? 'pin_video.mp4' : 'pin_image.jpg');
      
      const streamEndpoint = `/api/stream?media=${encodeURIComponent(result.url)}&filename=${encodeURIComponent(filename)}`;
      
      window.open(streamEndpoint, '_blank');
    }
  };


  return (
    <div style={styles.container}>
      <Head>
        <title>MidiaDown - Baixador de Vídeos e Imagens do Pinterest</title>
        <meta name="description" content="Baixe seus vídeos e imagens favoritos do Pinterest de forma rápida e gratuita. Ferramenta MidiaDown." />
      </Head>

      <main style={styles.main}>
        <h1 style={styles.title}>
          MidiaDown
        </h1>
        <p style={styles.description}>
          Baixe vídeos e imagens do Pinterest em alta qualidade.
        </p>
        
        {/* ESPAÇO PARA ADSENSE - Topo */}
        <div style={styles.adSpace}>
          <p>[ESPAÇO ADSENSE: Top Banner]</p>
        </div>
        
        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Cole o link do Pin do Pinterest aqui..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleDownload}
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Baixar Mídia'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div style={styles.resultArea}>
            <h2 style={styles.resultTitle}>Mídia Encontrada ({result.type.toUpperCase()})</h2>
            
            <p>Clique no botão para iniciar o download forçado.</p>
            
            <button 
              onClick={handleStream} 
              style={styles.downloadButton}
            >
              Download {result.type.toUpperCase()}
            </button>
            
            {/* Opcional: Mostrar uma prévia. */}
            {result.type === 'image' && (
              <img src={result.url} alt="Prévia" style={styles.previewImage} />
            )}
            
            {/* ESPAÇO PARA ADSENSE - Após Resultado */}
            <div style={styles.adSpaceSmall}>
               <p>[ESPAÇO ADSENSE: Banner 300x250]</p>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} MidiaDown. Todos os direitos reservados.</p>
        <p>Esta ferramenta não é afiliada ao Pinterest.</p>
      </footer>
    </div>
  );
}

// Estilos básicos (CSS-in-JS)
const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '20px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
  title: { fontSize: '2.5rem', color: '#E60023', marginBottom: '10px' },
  description: { fontSize: '1.2rem', color: '#6c757d', marginBottom: '20px', textAlign: 'center' },
  adSpace: { width: '100%', height: '90px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', border: '1px dashed #ccc' },
  adSpaceSmall: { width: '300px', height: '250px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', border: '1px dashed #ccc' },
  inputArea: { display: 'flex', width: '100%', marginBottom: '20px', gap: '10px' },
  input: { flexGrow: 1, padding: '12px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ced4da' },
  button: { padding: '12px 20px', fontSize: '1rem', backgroundColor: '#E60023', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.3s ease' },
  error: { color: 'red', marginTop: '10px' },
  resultArea: { marginTop: '30px', padding: '20px', border: '1px solid #E60023', borderRadius: '6px', width: '100%', textAlign: 'center' },
  resultTitle: { color: '#343a40', marginBottom: '10px' },
  downloadButton: { padding: '10px 15px', fontSize: '1.1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  previewImage: { maxWidth: '100%', height: 'auto', marginTop: '15px', border: '1px solid #ddd' },
  footer: { marginTop: '40px', padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#6c757d' }
};
