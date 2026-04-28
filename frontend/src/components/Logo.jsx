import React from 'react'
import logoImage from '../assets/Screenshot 2026-04-14 142037.png'

function Logo({ width = '100px' }) {
  return (
    <img src={logoImage} alt="logo" width={width} className="rounded-full" style={{ width }} />
  )
}

export default Logo
