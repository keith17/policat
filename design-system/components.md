# Policat — Component Patterns

Snippets you can paste into a `.tsx` file. All depend on `tokens.css` + `components.css`.

---

## Card

```tsx
<div className="glass-card" style={{ padding: 'var(--space-5)' }}>
  <h3 style={{ fontSize: 'var(--fs-16)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
    삼성전자 4분기 실적, 컨센서스 상회할까?
  </h3>
  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-14)' }}>
    마감 D-3 · 거래량 12.4M
  </p>
</div>
```

Variant — soft tonal card:
```tsx
<div className="surface-alt" style={{ padding: 'var(--space-5)' }}>...</div>
```

---

## Button

```tsx
<button className="btn-primary">예측하기</button>
<button className="btn-yes">YES · 62%</button>
<button className="btn-no">NO · 38%</button>
<button className="btn-yes-soft">YES 보기</button>
<button className="btn-soft">취소</button>
<button className="btn-ghost">더보기</button>
```

Sizes — adjust padding via inline style:
```tsx
<button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>Small</button>
<button className="btn-primary" style={{ padding: '16px 28px', fontSize: 15 }}>Large</button>
```

---

## Tag / Pill

```tsx
<span className="tag tag-economy">경제</span>
<span className="tag tag-politics">정치</span>
<span className="tag tag-yes">YES 62%</span>
<span className="tag tag-gold">+50 XP</span>
```

---

## Probability bar

```tsx
<div style={{ display: 'flex', height: 4, borderRadius: 3, overflow: 'hidden', background: 'var(--surface-alt)' }}>
  <div className="progress-yes" style={{ width: '62%' }} />
  <div className="progress-no"  style={{ width: '38%' }} />
</div>
```

---

## Big number callout (mono)

```tsx
<div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-32)', fontWeight: 700 }}>
  12,540<span style={{ fontSize: 'var(--fs-16)', color: 'var(--text-secondary)', marginLeft: 6 }}>XP</span>
</div>
```

---

## Input

```tsx
<input type="text" placeholder="검색…" />
<textarea rows={4} placeholder="질문을 적어주세요" />
```

(Styled by `components.css` — sunken bg, no border, focus ring on `--accent`.)

---

## Modal / Sheet

```tsx
<div style={{
  position: 'fixed', inset: 0, background: 'rgba(20,20,26,0.4)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
}}>
  <div style={{
    width: '100%', maxWidth: 480,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-xl)',
  }}>
    {/* content */}
  </div>
</div>
```

---

## Bottom navigation (mobile)

```tsx
<nav style={{
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: 'var(--bg-secondary)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'flex', justifyContent: 'space-around',
  zIndex: 40,
}}>
  {items.map(it => (
    <button key={it.id} style={{
      flex: 1, padding: '12px 0',
      background: 'transparent', border: 'none',
      color: it.active ? 'var(--text-primary)' : 'var(--text-muted)',
      fontWeight: it.active ? 600 : 500,
      fontSize: 11,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 20 }}>{it.icon}</span>
      {it.label}
    </button>
  ))}
</nav>
```

---

## Leaderboard row

```tsx
<div className="glass-card" style={{
  padding: '16px 20px',
  display: 'flex', alignItems: 'center', gap: 16,
  background: isMe ? 'var(--bg-card-hover)' : 'var(--bg-card)',
}}>
  <div style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
    {rank}
  </div>
  <Avatar tier={tier} />
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 600 }}>{name}</div>
    <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
      {tier} · 🔥 {streak}일
    </div>
  </div>
  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
    {xp.toLocaleString()} XP
  </div>
</div>
```

---

## Toast

```tsx
<div style={{
  position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
  background: type === 'success' ? 'var(--ink)' : 'var(--accent-no)',
  color: 'white',
  padding: '12px 20px',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  fontSize: 14, fontWeight: 600,
  zIndex: 100,
}}>
  {message}
</div>
```

---

## Tier ring (avatar)

```tsx
<div style={{
  width: 42, height: 42,
  borderRadius: '50%',
  background: `${tierColor}15`,   /* 8% tonal fill */
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 20,
}}>
  {tierEmoji}
</div>
```
(No outline border — the tonal fill IS the indicator.)
