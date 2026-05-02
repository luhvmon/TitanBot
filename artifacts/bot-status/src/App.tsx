function App() {
  const commands = [
    { category: "🛡️ Moderation", items: ["/ban", "/kick", "/timeout", "/warn", "/warnings", "/purge", "/lock", "/unlock", "/mute", "/unmute"] },
    { category: "🎉 Fun", items: ["/8ball", "/coinflip", "/roll", "/ship", "/mock", "/fact", "/joke", "/meme", "/cat", "/dog"] },
    { category: "📊 Leveling", items: ["/rank", "/leaderboard", "/setxp", "/resetxp"] },
    { category: "🎵 Music", items: ["/play", "/skip", "/stop", "/pause", "/resume", "/queue", "/nowplaying", "/loop"] },
    { category: "⚙️ Utility", items: ["/autorespond", "/config", "/say", "/poll", "/remind"] },
    { category: "👋 Welcome", items: ["/setwelcome", "/setgoodbye"] },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "linear-gradient(135deg, #5865F2, #7983f5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(88,101,242,0.4)"
          }}>
            📮
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 8px", letterSpacing: -1 }}>
            TitanBot
          </h1>
          <p style={{ color: "#a0a0b0", fontSize: 18, margin: "0 0 32px" }}>
            A powerful Discord bot with moderation, music, leveling & more
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 24, padding: "8px 20px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#57F287", boxShadow: "0 0 8px #57F287" }} />
            <span style={{ color: "#57F287", fontWeight: 600, fontSize: 14 }}>Online & Ready</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 48 }}>
          {[
            { icon: "🛡️", label: "Moderation", desc: "Ban, kick, timeout, warn & more" },
            { icon: "🎵", label: "Music", desc: "Play, queue, and control music" },
            { icon: "📊", label: "Leveling", desc: "XP system with leaderboards" },
            { icon: "💬", label: "Auto-Respond", desc: "Custom triggers with cooldowns" },
            { icon: "🎉", label: "Fun", desc: "Games, facts, and entertainment" },
            { icon: "👋", label: "Welcome", desc: "Greet new members automatically" },
          ].map(f => (
            <div key={f.label} style={{
              background: "#15151e", border: "1px solid #22222e", borderRadius: 12,
              padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start"
            }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.label}</div>
                <div style={{ color: "#7070a0", fontSize: 13 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#15151e", border: "1px solid #22222e", borderRadius: 16, padding: "32px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: "#e0e0f0" }}>Commands</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {commands.map(cat => (
              <div key={cat.category}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: "#a0a0c0" }}>{cat.category}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cat.items.map(cmd => (
                    <span key={cmd} style={{
                      background: "#1e1e2e", border: "1px solid #2a2a3e",
                      borderRadius: 6, padding: "3px 8px", fontSize: 12,
                      color: "#9090c0", fontFamily: "monospace"
                    }}>{cmd}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48, color: "#505065", fontSize: 13 }}>
          Built with ❤️ using Discord.js
        </div>
      </div>
    </div>
  );
}

export default App;
