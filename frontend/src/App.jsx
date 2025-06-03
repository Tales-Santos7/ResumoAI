import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import HomePage from './pages/HomePage'
import SummaryPage from './pages/SummaryPage'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/resumo' element={<SummaryPage />} />
        </Routes>
      </BrowserRouter>

      {/* ToastContainer pode ficar fora do BrowserRouter */}
      <ToastContainer
        position="top-right"
        autoClose={3000}          // some após 3 segundos
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
