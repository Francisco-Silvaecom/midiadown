export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1>MidiaDown 🚀</h1>
      <p>Em breve: Download de vídeos do Pinterest</p>
      <input placeholder="Cole o link do Pinterest aqui" style={{ padding: '10px', width: '300px' }} />
      <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Baixar Vídeo
      </button>
    </div>
  );
}
