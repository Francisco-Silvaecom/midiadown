import Link from 'next/link';
// Caminho de importação do CSS (agora corrigido para '../styles')
import styles from '../styles/Home.module.css'; 

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                {/* Nome do Site (Link para a Home) */}
                <Link href="/" passHref legacyBehavior>
                    <a className={styles.navLogo}>MidiaDown</a>
                </Link>

                {/* Links de Navegação */}
                <div className={styles.navLinks}>
                    <Link href="/" passHref legacyBehavior>
                        <a className={styles.navItem}>Início</a>
                    </Link>
                    <Link href="/about" passHref legacyBehavior>
                        <a className={styles.navItem}>Sobre Nós</a>
                    </Link>
                    <Link href="/privacy" passHref legacyBehavior>
                        <a className={styles.navItem}>Privacidade</a>
                    </Link>
                    <Link href="/terms" passHref legacyBehavior>
                        <a className={styles.navItem}>Termos</a>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

// Exportação única
export default Navbar;
