import { useState } from 'react'
import ThreeScene from './components/ThreeScene'
import './App.css'

function App() {
  const [showThree, setShowThree] = useState(true)

  return (
    <>
      {showThree ? (
        <>
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
            <h1 style={{ color: 'white' }}>Three.js Demo</h1>
            <button onClick={() => setShowThree(false)}>
              Switch to React Demo
            </button>
          </div>
          <ThreeScene />
        </>
      ) : (
        <div style={{ padding: '20px' }}>
          <h1>React Demo</h1>
          <button onClick={() => setShowThree(true)}>
            Switch to Three.js Demo
          </button>
        </div>
      )}
    </>
  )
}

export default App
