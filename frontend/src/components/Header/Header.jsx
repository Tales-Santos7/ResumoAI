import './Header.css'
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";

function Header() {
  return (
    <header className='Header'>
        <div className='container'>
            <h2 className='nav-titulo'>ResumoAI</h2>
           <div className='icones'>
      <a href="https://www.instagram.com/tales.s7" title='Instagram' target="_blank" rel="noopener noreferrer">
      <img className='icon' src="https://tse1.mm.bing.net/th/id/OIP.-ZirgQE5pr8e7htQWowJIgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="" width={30}/>
      </a>
      <a href="https://github.com/Tales-Santos7" title='GitHub' target="_blank" rel="noopener noreferrer">
        <FaGithub className='icon' color="#031c2bff" />
      </a>
      <a href="https://www.linkedin.com/in/tales-santos7/" title='LinkedIn' target="_blank" rel="noopener noreferrer">
        <FaLinkedin className='icon' color="#0077B5" style={{ borderRadius: "10px" }} />
      </a>
    </div>
        </div>
    </header>
  )
}

export default Header
