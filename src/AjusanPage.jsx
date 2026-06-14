import { useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt'

const MQTT_URL = import.meta.env.VITE_MQTT_URL?.trim() || 'wss://broker.emqx.io:8084/mqtt'
const MQTT_BASE_TOPIC = import.meta.env.VITE_MQTT_BASE_TOPIC?.trim().replace(/\/+$/, '') || 'group1/mp'

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(digits)
}

function topic(suffix) {
  return `${MQTT_BASE_TOPIC}/${suffix}`
}

const styles = {
  root: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#080c12',
    minHeight: '100vh',
    color: '#e2e8f0',
    margin: '0',
    padding: '0',
  },

  // ── Nav ──────────────────────────────────────────────────────────────
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    height: '60px',
    borderBottom: '1px solid #1a2235',
    background: '#050810',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoMark: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  brand: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#f1f5f9',
    letterSpacing: '-0.01em',
  },
  brandSub: {
    fontSize: '0.7rem',
    color: '#334155',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginLeft: '2px',
  },
  badge: (tone) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    padding: '5px 12px',
    borderRadius: '999px',
    fontWeight: '600',
    background: tone === 'good' ? '#0d2b1a' : tone === 'warning' ? '#271a05' : '#111827',
    color: tone === 'good' ? '#34d399' : tone === 'warning' ? '#fbbf24' : '#64748b',
    border: `1px solid ${tone === 'good' ? '#134e2a' : tone === 'warning' ? '#3d2607' : '#1e293b'}`,
  }),
  badgeDot: (tone) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: tone === 'good' ? '#34d399' : tone === 'warning' ? '#fbbf24' : '#475569',
    flexShrink: 0,
  }),

  // ── Hero ──────────────────────────────────────────────────────────────
  hero: {
    background: 'linear-gradient(180deg, #0a0f1e 0%, #080c12 100%)',
    borderBottom: '1px solid #1a2235',
    padding: '48px 40px 40px',
  },
  heroInner: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#3b82f6',
    marginBottom: '10px',
  },
  heroTitle: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    margin: '0 0 10px',
  },
  heroTitleAccent: {
    color: '#3b82f6',
  },
  heroSub: {
    fontSize: '0.875rem',
    color: '#475569',
    margin: '0',
    maxWidth: '480px',
    lineHeight: '1.6',
  },

  // ── Main ──────────────────────────────────────────────────────────────
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 40px 60px',
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#334155',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },

  // ── Cards ──────────────────────────────────────────────────────────────
  card: (accent) => ({
    background: '#0d1221',
    border: `1px solid ${accent}22`,
    borderRadius: '14px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  }),
  cardGlow: (accent) => ({
    position: 'absolute',
    top: '-40px',
    right: '-40px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `${accent}10`,
    pointerEvents: 'none',
  }),
  cardAccentBar: (accent) => ({
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '2px',
    background: `linear-gradient(90deg, ${accent} 0%, ${accent}00 100%)`,
    borderRadius: '14px 14px 0 0',
  }),
  cardIcon: (accent) => ({
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: `${accent}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  }),
  cardIconText: (accent) => ({
    fontSize: '15px',
    fontWeight: '800',
    color: accent,
    letterSpacing: '-0.5px',
  }),
  cardTitle: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#475569',
    marginBottom: '10px',
  },
  cardValue: {
    fontSize: '2.8rem',
    fontWeight: '800',
    lineHeight: '1',
    color: '#f8fafc',
    letterSpacing: '-0.04em',
    marginBottom: '4px',
  },
  cardUnit: {
    fontSize: '1.1rem',
    color: '#334155',
    fontWeight: '600',
    marginLeft: '3px',
  },
  cardDivider: {
    height: '1px',
    background: '#1a2235',
    margin: '14px 0',
  },
  cardDetail: {
    fontSize: '0.775rem',
    color: '#475569',
  },
  cardState: (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '10px',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '999px',
    background: active ? '#0d2b1a' : '#111827',
    color: active ? '#34d399' : '#475569',
    border: `1px solid ${active ? '#134e2a' : '#1e293b'}`,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }),
  stateDot: (active) => ({
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: active ? '#34d399' : '#334155',
    flexShrink: 0,
  }),

  // ── Info bar ──────────────────────────────────────────────────────────────
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0a0f1e',
    border: '1px solid #1a2235',
    borderRadius: '10px',
    padding: '14px 20px',
    marginBottom: '32px',
  },
  infoBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  infoBarDot: (tone) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: tone === 'good' ? '#34d399' : tone === 'warning' ? '#fbbf24' : '#475569',
    flexShrink: 0,
    boxShadow: tone === 'good' ? '0 0 6px #34d39966' : tone === 'warning' ? '0 0 6px #fbbf2466' : 'none',
  }),
  infoBarText: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  infoBarTime: {
    fontSize: '0.75rem',
    color: '#334155',
    fontVariantNumeric: 'tabular-nums',
  },

  // ── Alert ──────────────────────────────────────────────────────────────
  alert: {
    background: '#1c0a0a',
    border: '1px solid #3f1111',
    color: '#f87171',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '0.82rem',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    borderTop: '1px solid #0f1624',
    padding: '14px 40px',
    fontSize: '0.7rem',
    color: '#1e2d42',
    display: 'flex',
    justifyContent: 'space-between',
    letterSpacing: '0.04em',
  },
}

const ACCENTS = {
  ph: '#6366f1',
  feeder: '#f59e0b',
  ammonia: '#2dd4bf',
}

const CARD_ICONS = {
  ph: 'pH',
  feeder: 'LDR',
  ammonia: 'NH₃',
}

export default function App() {
  const clientRef = useRef(null)
  const [brokerStatus, setBrokerStatus] = useState('connecting')
  const [esp32Status, setEsp32Status] = useState('unknown')
  const [status, setStatus] = useState(null)
  const [telemetry, setTelemetry] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL, {
      clean: true,
      connectTimeout: 5000,
      clientId: `ajusan-station-${Math.random().toString(16).slice(2, 10)}`,
      reconnectPeriod: 3000,
    })

    clientRef.current = client

    const subs = [topic('status'), topic('telemetry'), topic('status/availability')]

    client.on('connect', () => {
      setBrokerStatus('connected')
      setError('')
      client.subscribe(subs)
    })

    client.on('reconnect', () => setBrokerStatus('connecting'))
    client.on('close', () => setBrokerStatus('disconnected'))
    client.on('error', (e) => {
      setBrokerStatus('error')
      setError(e?.message || 'MQTT connection failed')
    })

    client.on('message', (incomingTopic, payload) => {
      const msg = payload.toString()

      if (incomingTopic === topic('status')) {
        try {
          const data = JSON.parse(msg)
          setStatus(data)
          setEsp32Status(data.wifiConnected ? 'online' : 'offline')
          setLastUpdated(new Date())
          setError('')
        } catch {
          setError('Malformed status payload.')
        }
        return
      }

      if (incomingTopic === topic('telemetry')) {
        try {
          setTelemetry(JSON.parse(msg))
          setLastUpdated(new Date())
        } catch {
          setError('Malformed telemetry payload.')
        }
        return
      }

      if (incomingTopic === topic('status/availability')) {
        setEsp32Status(msg === 'online' ? 'online' : 'offline')
        setLastUpdated(new Date())
      }
    })

    return () => {
      client.end(true)
      clientRef.current = null
    }
  }, [])

  const src = status || telemetry || {}

  const cards = [
    {
      key: 'ph',
      title: 'pH Level',
      value: formatNumber(src?.ph?.value ?? telemetry?.ph, 2),
      unit: '',
      detail: `Threshold: ${formatNumber(src?.ph?.threshold, 2)}`,
      stateLabel: src?.ph?.pumpActive ? 'Acid pump on' : 'Pump off',
      pumpActive: !!src?.ph?.pumpActive,
      accent: ACCENTS.ph,
    },
    {
      key: 'feeder',
      title: 'LDR / Feeder',
      value: src?.feeder?.ldrValue ?? telemetry?.ldr ?? '-',
      unit: 'ADC',
      detail: src?.feeder?.isDark ? 'Dark detected' : 'Light detected',
      stateLabel: src?.feeder?.lastMessage || 'Idle',
      pumpActive: false,
      accent: ACCENTS.feeder,
    },
    {
      key: 'ammonia',
      title: 'Ammonia',
      value: formatNumber(src?.ammonia?.ppm ?? telemetry?.ammonia, 2),
      unit: 'ppm',
      detail: `Threshold: ${formatNumber(src?.ammonia?.threshold, 2)} ppm`,
      stateLabel: src?.ammonia?.pumpActive ? 'Air pump on' : 'Air pump off',
      pumpActive: !!src?.ammonia?.pumpActive,
      accent: ACCENTS.ammonia,
    },
  ]

  const tone =
    brokerStatus === 'connected'
      ? esp32Status === 'online' ? 'good' : 'warning'
      : 'neutral'

  const connectionLabel =
    brokerStatus === 'connected'
      ? esp32Status === 'online'
        ? `ESP32 online${status?.ip ? ` · ${status.ip}` : ''}`
        : 'Broker connected — waiting for ESP32'
      : brokerStatus === 'connecting'
        ? 'Connecting to broker…'
        : 'Disconnected'

  return (
    <div style={styles.root}>

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logoMark}>A</div>
          <div>
            <div style={styles.brand}>Ajusan Station</div>
            <div style={styles.brandSub}>Water Quality Monitor</div>
          </div>
        </div>
        <div style={styles.badge(tone)}>
          <div style={styles.badgeDot(tone)} />
          {connectionLabel}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.eyebrow}>Live sensor dashboard</p>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroTitleAccent}>Ajusan</span> Station
          </h1>
          <p style={styles.heroSub}>
            Real-time water quality readings streamed from the ESP32 over MQTT. Monitoring pH, light exposure, and ammonia levels continuously.
          </p>
        </div>
      </div>

      {/* ── Main ── */}
      <main style={styles.main}>

        {/* Info bar */}
        <div style={styles.infoBar}>
          <div style={styles.infoBarLeft}>
            <div style={styles.infoBarDot(tone)} />
            <span style={styles.infoBarText}>{connectionLabel}</span>
          </div>
          <span style={styles.infoBarTime}>
            {lastUpdated
              ? `Last update · ${lastUpdated.toLocaleTimeString()}`
              : 'Waiting for first reading…'}
          </span>
        </div>

        {error && (
          <div style={styles.alert}>
            <span>⚠</span>
            {error}
          </div>
        )}

        <p style={styles.sectionLabel}>Sensor readings</p>

        {/* Cards */}
        <div style={styles.grid}>
          {cards.map((card) => (
            <div key={card.key} style={styles.card(card.accent)}>
              <div style={styles.cardAccentBar(card.accent)} />
              <div style={styles.cardGlow(card.accent)} />

              <div style={styles.cardIcon(card.accent)}>
                <span style={styles.cardIconText(card.accent)}>
                  {CARD_ICONS[card.key]}
                </span>
              </div>

              <div style={styles.cardTitle}>{card.title}</div>

              <div style={styles.cardValue}>
                {card.value}
                {card.unit && (
                  <span style={styles.cardUnit}>{card.unit}</span>
                )}
              </div>

              <div style={styles.cardDivider} />

              <div style={styles.cardDetail}>{card.detail}</div>

              <div>
                <span style={styles.cardState(card.pumpActive)}>
                  <span style={styles.stateDot(card.pumpActive)} />
                  {card.stateLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span>Broker · {MQTT_URL}</span>
        <span>Topic · {MQTT_BASE_TOPIC}</span>
      </footer>
    </div>
  )
}