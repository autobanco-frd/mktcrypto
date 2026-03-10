import React, { useState, useEffect } from 'react'
import GenericMarketCard from './components/GenericMarketCard'
import './components/polymarket-styles.css'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uptime, setUptime] = useState(9154)
  const [blockHeight, setBlockHeight] = useState(834567)
  const [connections, setConnections] = useState(12)
  const [memory, setMemory] = useState(128)
  const [networkStatus, setNetworkStatus] = useState('Lightning')
  const [marketCards, setMarketCards] = useState([
    {
      id: '1',
      type: 'BEAUTY',
      status: 'OPEN',
      price_sats: 25000,
      creator_pubkey: 'test_pubkey_1',
      metadata: {
        title: 'Exclusive Skincare Kit',
        description: 'Premium anti-aging serum with vitamin C and hyaluronic acid',
        image_url: '',
        creator_name: 'SkinLab Pro',
        tags: ['skincare', 'premium', 'anti-aging'],
        total_volume: '1200000'
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'PREDICTION',
      status: 'OPEN',
      price_sats: 5000,
      creator_pubkey: 'test_pubkey_2',
      metadata: {
        title: 'BTC Price Prediction',
        question: 'Will BTC reach $50,000 before end of year?',
        yes_price: 65,
        no_price: 35,
        image_url: '',
        creator_name: 'CryptoOracle',
        total_volume: '845000'
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'SERVICE',
      status: 'OPEN',
      price_sats: 15000,
      creator_pubkey: 'test_pubkey_3',
      metadata: {
        title: 'Lightning Node Setup',
        description: 'Professional Lightning Network node configuration and maintenance',
        image_url: '',
        creator_name: 'LNExpert',
        skills: ['lightning', 'bitcoin', 'node-setup'],
        total_volume: '567000'
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'BEAUTY',
      status: 'OPEN',
      price_sats: 18000,
      creator_pubkey: 'test_pubkey_4',
      metadata: {
        title: 'Luxury Face Mask Set',
        description: 'Limited edition collagen-infused face masks for radiant skin',
        image_url: '',
        creator_name: 'BeautyGuru',
        tags: ['luxury', 'collagen', 'limited'],
        total_volume: '234000'
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString()
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const uptimeTimer = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(uptimeTimer)
  }, [])

  useEffect(() => {
    const blockTimer = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 8000)
    return () => clearInterval(blockTimer)
  }, [])

  useEffect(() => {
    const connectionTimer = setInterval(() => {
      setConnections(prev => Math.max(8, prev + Math.floor(Math.random() * 3) - 1))
    }, 12000)
    return () => clearInterval(connectionTimer)
  }, [])

  useEffect(() => {
    const memoryTimer = setInterval(() => {
      setMemory(prev => Math.max(64, Math.min(256, prev + Math.floor(Math.random() * 11) - 5)))
    }, 5000)
    return () => clearInterval(memoryTimer)
  }, [])

  useEffect(() => {
    const networkTimer = setInterval(() => {
      const networks = ['Lightning', 'LN', 'BTC', 'LND']
      setNetworkStatus(networks[Math.floor(Math.random() * networks.length)])
    }, 30000)
    return () => clearInterval(networkTimer)
  }, [])

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const handleCardStatusChange = (update) => {
    console.log('Card status changed:', update)
    // Update card in state
    setMarketCards(prev => prev.map(card => 
      card.id === update.card_id ? { ...card, ...update.data } : card
    ))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>MKTcrypto.store</h1>
          <p>High-Performance Terminal v1.0</p>
        </div>
        <div className="status">
          <span className="status-online">● ONLINE</span>
          <span>{currentTime.toISOString()}</span>
        </div>
      </header>
      
      <main className="app-main">
        <div className="market-cards-full">
          {marketCards.map(card => (
            <GenericMarketCard
              key={card.id}
              card={card}
              onStatusChange={handleCardStatusChange}
            />
          ))}
        </div>
      </main>

      <div className="status-bar">
        <div className="status-nav">
          <button className="nav-icon active" title="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5zm-5-2H8v-4h2v4z"/>
            </svg>
          </button>
          <button className="nav-icon" title="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16 1 1 0 0 0 16 15.5c0 .17-.01.34-.03.5l1.53 1.53c.09.09.22.15.36.15.28 0 .55-.11.77-.31l2.08-2.08c.2-.2.31-.49.31-.77-.02-.16-.03-.33-.03-.5A6.5 6.5 0 0 0 9.5 3 6.5 6.5 0 0 0 3 9.5 6.5 6.5 0 0 0 9.5 16zm-6 0A4.5 4.5 0 0 1 5 9.5 4.5 4.5 0 0 1 9.5 14a4.5 4.5 0 0 1 4.5-4.5z"/>
            </svg>
          </button>
          <button className="nav-icon" title="Breaking">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </button>
          <button className="nav-icon" title="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>
        
        <div className="status-info">
          <div className="status-item">
            <span>Network:</span>
            <span>{networkStatus}</span>
          </div>
          <div className="status-item">
            <span>Block:</span>
            <span>{blockHeight.toLocaleString()}</span>
          </div>
          <div className="status-item">
            <span>Uptime:</span>
            <span>{formatUptime(uptime)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
