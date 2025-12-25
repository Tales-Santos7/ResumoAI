import './Header.css'
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";

function Header() {
  return (
    <header className='Header'>
        <div className='container'>
            <h2 className='nav-titulo'>ResumoAI</h2>
           <div className='icones'>
      <a href="https://www.instagram.com/tales.s7" title='Instagram' target="_blank" rel="noopener noreferrer">
        <FaInstagram color="#ffffffff" style={{ backgroundColor: "#b60802ff", borderRadius: "10px" }} />
      </a>
      <a href="https://github.com/Tales-Santos7" title='GitHub' target="_blank" rel="noopener noreferrer">
        <FaGithub color="#031c2bff" />
      </a>
      <a href="https://www.linkedin.com/in/tales-santos7/" title='LinkedIn' target="_blank" rel="noopener noreferrer">
        <FaLinkedin color="#0077B5" style={{ borderRadius: "10px" }} />
      </a>
    </div>
        </div>
    </header>
  )
}

export default Header
