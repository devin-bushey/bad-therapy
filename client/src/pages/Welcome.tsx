import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Welcome: React.FC = () => {
  const { loginWithRedirect } = useAuth0()
  return (
    <div style={{ minHeight: "100vh", background: "#181824", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem 0 1rem" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 1.5rem 0", textAlign: "center", letterSpacing: -1 }}>Welcome to Bad Therapy</h1>
        <p style={{ fontSize: 20, color: "#b3b3b3", maxWidth: 700, textAlign: "center", margin: "0 0 2.5rem 0", lineHeight: 1.5 }}>
          If your idea of therapy involves a highly questionable trust in AI and you're looking for a chat, then Bad Therapy might be for you.<br /><br />
          AI can support your mental health, but it's not a replacement for real human care. Like boxed mac and cheese, it's fine in a pinch—but not a long-term diet.
        </p>
        <div style={{  margin: "0 0 2.5rem 0", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 320, maxWidth: 400, width: "100%" }}>
          <button onClick={() => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin + "/dashboard" } })}
            style={{ fontSize: 20, fontWeight: 700, background: "#2563eb", color: "#fff", borderRadius: 10, padding: "1em 2.5em", border: "none", cursor: "pointer", boxShadow: "0 2px 8px #0002", marginBottom: 0 }}>
            Login / Signup
          </button>
        </div>
        <div style={{ marginTop: 16, background: "#47292b", border: "1.5px solid #ef4444", borderRadius: 24, padding: "2rem 2.5rem", maxWidth: 600, width: "100%", boxSizing: "border-box", boxShadow: "0 2px 12px #0002" }}>
          <div style={{ color: "#f87171", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Should you use this?</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            If you're battling real trauma, you need a human. Don't mess around with your mental health.
          </div>
          <div style={{ color: "#a3a3a3", fontSize: 15, marginBottom: 4 }}>
            Remember, AI doesn't care about you, even if it sounds like it does.
          </div>
        </div>
      </main>
    </div>
  )
}

export default Welcome
