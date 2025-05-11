import React from 'react'


const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#181824',
}

export default function Loading() {
    return (
        <div style={containerStyle}>
            <div style={{ marginTop: 24, color: '#93c5fd', fontSize: 18 }}>Loading…</div>
        </div>
    )
}
