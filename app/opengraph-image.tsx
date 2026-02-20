import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Invoice Generator Nigeria'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to right bottom, #115e59, #0f766e)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '40px',
                    }}
                >
                    <div style={{ fontSize: 80, color: '#ccfbf1', display: 'flex', marginRight: '20px' }}>⚡</div>
                    <div style={{ fontSize: 60, fontWeight: 'bold', color: 'white', display: 'flex' }}>InvoiceGenerator.ng</div>
                </div>
                <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white', textAlign: 'center', display: 'flex' }}>
                    Free Online Invoice Creator
                </div>
                <div style={{ fontSize: 40, color: '#ccfbf1', marginTop: '20px', display: 'flex' }}>
                    For Nigerian Businesses & Freelancers
                </div>
            </div>
        ),
        { ...size }
    )
}
