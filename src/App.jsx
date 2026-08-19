import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  CalendarDays,
  Check,
  Gift,
  Leaf,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

const DEFAULT_PRIZES = [
  { id: 'discount-30', short: 'GIẢM 30%', name: 'Giảm 30% cho dịch vụ tiếp theo', icon: '30%' },
  { id: 'hydration', short: 'CẤP ẨM', name: '01 buổi chăm sóc da cấp ẩm', icon: '✦' },
  { id: 'hairwash', short: 'GỘI 60′', name: '01 buổi gội dưỡng sinh 60 phút', icon: '❋' },
  { id: 'nail', short: 'BỘ NAIL', name: '01 bộ Nail tay', icon: '✧' },
  { id: 'heel', short: 'GÓT SEN', name: '01 buổi Gót Sen Hồng', icon: '❀' },
]

const WHEEL_COLORS = ['#18483d', '#bd9a52', '#285a4c', '#d0ad63', '#113d34', '#a88448', '#356858', '#d8b86e']
const STORAGE_KEY = 'vi-tien-cat-lucky-wheel-prizes-v1'

function secureRandomIndex(max) {
  if (max <= 1) return 0
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    const range = 2 ** 32
    const limit = range - (range % max)
    do globalThis.crypto.getRandomValues(values)
    while (values[0] >= limit)
    return values[0] % max
  }
  return Math.floor(Math.random() * max)
}

function makeGradient(count) {
  if (!count) return '#173f35'
  const segment = 360 / count
  const stops = Array.from({ length: count }, (_, index) => {
    const color = WHEEL_COLORS[index % WHEEL_COLORS.length]
    return `${color} ${index * segment}deg ${(index + 1) * segment}deg`
  })
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
}

function PrizeWheel({ prizes, spinning, rotation, onSpin, onSpinComplete }) {
  const segment = 360 / prizes.length
  const labels = useMemo(
    () => prizes.map((prize, index) => ({ ...prize, angle: index * segment + segment / 2 })),
    [prizes, segment],
  )

  return (
    <div className="relative flex aspect-square w-[min(72vw,68vh,620px)] items-center justify-center max-md:w-[min(90vw,49dvh)]">
      <div className="pointer absolute left-1/2 top-[-2%] z-30 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-[#f1d490] drop-shadow-[0_5px_10px_rgba(0,0,0,.4)] md:border-l-[18px] md:border-r-[18px] md:border-t-[36px]" />
      </div>

      <div className="absolute inset-[2%] rounded-full bg-[#ead39b] p-[5px] shadow-[0_24px_90px_rgba(0,0,0,.44),0_0_0_1px_rgba(255,255,255,.34),0_0_55px_rgba(218,180,91,.2)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f8f3e9] p-[7px]">
          <motion.div
            className="wheel relative h-full w-full rounded-full"
            style={{ background: makeGradient(prizes.length) }}
            animate={{ rotate: rotation }}
            transition={{ duration: 5.2, ease: [0.12, 0.68, 0.13, 1] }}
            onAnimationComplete={onSpinComplete}
          >
            <div className="absolute inset-[5%] rounded-full border border-white/25" />
            <div className="absolute inset-[30.7%] rounded-full border border-white/15" />
            {labels.map((prize) => {
              const radius = prizes.length > 6 ? 38 : 36
              const rad = (prize.angle * Math.PI) / 180
              const left = 50 + Math.sin(rad) * radius
              const top = 50 - Math.cos(rad) * radius
              return (
                <div
                  key={prize.id}
                  className="absolute z-10 flex w-[23%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-[#fffaf0] drop-shadow-[0_1px_3px_rgba(0,0,0,.45)]"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <span className="font-serif text-[clamp(16px,2.1vw,27px)] leading-none">{prize.icon}</span>
                  <span className="mt-1 max-w-full text-[clamp(7px,.9vw,12px)] font-bold uppercase leading-tight tracking-[0.11em]">
                    {prize.short}
                  </span>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: spinning ? 1 : 1.04 }}
        whileTap={{ scale: spinning ? 1 : 0.96 }}
        onClick={onSpin}
        disabled={spinning || prizes.length === 0}
        className="group absolute z-20 flex aspect-square w-[27%] flex-col items-center justify-center rounded-full border-[5px] border-[#ead39c] bg-[#10352d]/95 text-[#fff7e8] shadow-[0_14px_36px_rgba(0,0,0,.4),inset_0_0_0_1px_rgba(255,255,255,.15)] outline-none backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="mb-1 size-[clamp(16px,2.3vw,28px)] text-[#eacb86]" strokeWidth={1.6} />
        <span className="text-[clamp(10px,1.55vw,19px)] font-semibold tracking-[0.2em]">{spinning ? 'ĐANG QUAY' : 'QUAY NGAY'}</span>
        <span className="mt-0.5 text-[clamp(7px,.9vw,10px)] uppercase tracking-[0.16em] text-[#d7c8a6]">100% có quà</span>
      </motion.button>
    </div>
  )
}

function PrizeManager({ prizes, setPrizes, onClose }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ short: '', name: '', icon: '✦' })

  const startEdit = (prize) => {
    setEditingId(prize.id)
    setDraft({ short: prize.short, name: prize.name, icon: prize.icon })
  }

  const saveEdit = () => {
    if (!draft.short.trim() || !draft.name.trim()) return
    setPrizes((current) => current.map((item) => item.id === editingId ? { ...item, ...draft, short: draft.short.trim(), name: draft.name.trim() } : item))
    setEditingId(null)
  }

  const addPrize = () => {
    const item = {
      id: `gift-${Date.now()}`,
      short: 'QUÀ MỚI',
      name: 'Quà tặng mới',
      icon: '✦',
    }
    setPrizes((current) => [...current, item])
    startEdit(item)
  }

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-[#061812]/78 p-3 backdrop-blur-lg md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: .97 }}
        className="flex max-h-[88dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border border-[#ead29a]/25 bg-[#f7f1e7] text-[#12372e] shadow-[0_35px_120px_rgba(0,0,0,.55)]"
      >
        <div className="flex items-center justify-between border-b border-[#17382f]/10 px-5 py-4 md:px-7">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.25em] text-[#a27d38]">Quản lý vòng quay</div>
            <h2 className="mt-1 font-serif text-2xl md:text-3xl">Quà tặng</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#17382f]/8 p-2.5 hover:bg-[#17382f]/12" aria-label="Đóng"><X className="size-5" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-7">
          <div className="space-y-2.5">
            {prizes.map((prize, index) => (
              <div key={prize.id} className="rounded-2xl border border-[#17382f]/10 bg-white/70 p-3 shadow-sm">
                {editingId === prize.id ? (
                  <div className="grid gap-2 md:grid-cols-[80px_1fr_1.7fr_auto]">
                    <input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="manager-input text-center" maxLength={4} placeholder="Icon" />
                    <input value={draft.short} onChange={(e) => setDraft({ ...draft, short: e.target.value })} className="manager-input" placeholder="Tên ngắn trên vòng" />
                    <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="manager-input" placeholder="Tên quà đầy đủ" />
                    <button onClick={saveEdit} className="rounded-xl bg-[#17382f] px-4 py-2 text-xs font-bold text-[#fff8e9]">Lưu</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#17382f] font-serif text-lg text-[#efd18c]">{prize.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#987a45]">Ô {index + 1}</span><span className="font-semibold">{prize.short}</span></div>
                      <div className="truncate text-sm text-[#29483f]/70">{prize.name}</div>
                    </div>
                    <button onClick={() => startEdit(prize)} className="rounded-xl p-2 text-[#17382f]/65 hover:bg-[#17382f]/8" aria-label="Sửa"><Pencil className="size-4" /></button>
                    <button onClick={() => setPrizes((current) => current.filter((item) => item.id !== prize.id))} disabled={prizes.length <= 1} className="rounded-xl p-2 text-red-700/65 hover:bg-red-50 disabled:opacity-25" aria-label="Xóa"><Trash2 className="size-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#17382f]/10 px-4 py-4 md:px-7">
          <button onClick={() => setPrizes(DEFAULT_PRIZES)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[#17382f]/65 hover:bg-[#17382f]/7"><RotateCcw className="size-4" /> Khôi phục mặc định</button>
          <button onClick={addPrize} className="inline-flex items-center gap-2 rounded-full bg-[#17382f] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#fff8e9]"><Plus className="size-4" /> Thêm quà</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function App() {
  const [prizes, setPrizes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : null
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PRIZES
    } catch { return DEFAULT_PRIZES }
  })
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winnerIndex, setWinnerIndex] = useState(null)
  const [result, setResult] = useState(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const pendingWinner = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes))
  }, [prizes])

  const spin = () => {
    if (spinning || prizes.length === 0) return
    const segment = 360 / prizes.length
    const winner = secureRandomIndex(prizes.length)
    const center = winner * segment + segment / 2
    const desired = (360 - center) % 360
    const current = ((rotation % 360) + 360) % 360
    const delta = (desired - current + 360) % 360

    pendingWinner.current = winner
    setWinnerIndex(winner)
    setResult(null)
    setSpinning(true)
    setRotation(rotation + 5 * 360 + delta)
  }

  const finishSpin = () => {
    if (!spinning || pendingWinner.current === null) return
    const prize = prizes[pendingWinner.current]
    setSpinning(false)
    setResult(prize || null)
    pendingWinner.current = null
    confetti({ particleCount: 150, spread: 80, origin: { y: .62 }, scalar: .92, resize: true, disableForReducedMotion: true })
  }

  return (
    <main className="app-shell relative h-[100dvh] overflow-hidden text-[#f8f1e5]">
      <div className="app-bg" />
      <div className="app-shade" />
      <div className="grain" />

      <button
        onClick={() => !spinning && setManagerOpen(true)}
        disabled={spinning}
        className="absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#eed79e]/25 bg-[#071d17]/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#f1d99d] shadow-lg backdrop-blur-xl transition hover:bg-[#17382f]/70 disabled:opacity-40 md:right-6 md:top-6"
      >
        <Settings className="size-4" /> <span className="max-sm:hidden">Quản lý quà</span>
      </button>

      <div className="relative z-10 mx-auto grid h-full w-full max-w-[1560px] grid-cols-[minmax(280px,.92fr)_minmax(420px,1.35fr)] items-center gap-[clamp(18px,4vw,70px)] px-[clamp(20px,5vw,72px)] py-[clamp(18px,3vh,38px)] max-md:grid-cols-1 max-md:grid-rows-[auto_1fr] max-md:gap-1 max-md:px-4 max-md:pb-5 max-md:pt-4">
        <section className="max-md:text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-[clamp(10px,2vh,22px)] inline-flex items-center gap-2 rounded-full border border-[#d8b66f]/35 bg-[#071d17]/35 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#efd69a] shadow-lg backdrop-blur-xl max-md:mb-1.5 max-md:px-3 max-md:py-1.5 max-md:text-[8px]">
            <Leaf className="size-3.5" /> Vi Tiên Cát Spa · Ecopark
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
            <p className="mb-2 font-serif text-[clamp(15px,1.6vw,22px)] italic text-[#e7cb8b] max-md:mb-0.5 max-md:text-[13px]">Beauty meets good fortune</p>
            <h1 className="font-serif text-[clamp(46px,5.4vw,82px)] leading-[.86] tracking-[-.035em] text-[#fff9ee] drop-shadow-[0_3px_18px_rgba(0,0,0,.25)] max-md:text-[clamp(36px,10vw,50px)]">
              Vòng Xoay<span className="block text-[#eac979]">May Mắn</span>
            </h1>
            <p className="mt-[clamp(12px,2vh,22px)] max-w-[540px] text-[clamp(13px,1.25vw,17px)] leading-relaxed text-[#f1eadc]/85 max-md:mx-auto max-md:mt-2 max-md:max-w-[470px] max-md:text-[11px] max-md:leading-snug">
              Hóa đơn từ <b className="text-[#fff3d3]">200K</b> được quay 01 lần. Quay là có quà — không có ô trượt giải.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .16 }} className="mt-[clamp(18px,3vh,34px)] grid max-w-[560px] grid-cols-2 gap-2.5 max-md:hidden">
            <div className="glass-card col-span-2 flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3"><div className="icon-badge"><Gift className="size-4" /></div><div><div className="text-[10px] uppercase tracking-[.2em] text-[#d4c29a]">Đặc biệt</div><div className="mt-0.5 text-sm font-semibold text-[#fff8e9]">100% khách quay đều có quà</div></div></div><Check className="size-5 text-[#e2c476]" />
            </div>
            <div className="glass-card flex items-center gap-3 px-4 py-3"><CalendarDays className="size-4 text-[#e3c57b]" /><div><div className="text-[9px] uppercase tracking-[.18em] text-[#cfc09c]">Thời gian</div><div className="text-xs font-medium">20/08 – 02/09</div></div></div>
            <div className="glass-card flex items-center gap-3 px-4 py-3"><MapPin className="size-4 text-[#e3c57b]" /><div><div className="text-[9px] uppercase tracking-[.18em] text-[#cfc09c]">Địa điểm</div><div className="text-xs font-medium">Vi Tiên Cát Spa · Ecopark</div></div></div>
          </motion.div>
        </section>

        <section className="relative flex min-h-0 items-center justify-center max-md:-mt-1">
          <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative">
            <div className="absolute inset-[8%] rounded-full bg-[#c9a85f]/22 blur-3xl" />
            <PrizeWheel prizes={prizes} spinning={spinning} rotation={rotation} onSpin={spin} onSpinComplete={finishSpin} />
          </motion.div>
          <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[9px] uppercase tracking-[.18em] text-[#ead7ad]/75 max-md:flex"><CalendarDays className="size-3" /> 20/08 – 02/09 · Ecopark</div>
        </section>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-[#061712]/72 p-5 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 22, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .96 }} transition={{ type: 'spring', stiffness: 270, damping: 22 }} className="relative w-full max-w-[520px] overflow-hidden rounded-[32px] border border-[#ead29a]/35 bg-[#f7f1e5] px-7 py-8 text-center text-[#13332b] shadow-[0_35px_110px_rgba(0,0,0,.5)]">
              <button onClick={() => setResult(null)} className="absolute right-4 top-4 rounded-full bg-[#17382f]/8 p-2 text-[#17382f]/60 transition hover:bg-[#17382f]/12" aria-label="Đóng"><X className="size-4" /></button>
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#17382f] text-[#edce89] shadow-lg"><Gift className="size-7" strokeWidth={1.6} /></div>
              <div className="text-[11px] font-bold uppercase tracking-[.3em] text-[#9b7c3d]">Chúc mừng bạn</div>
              <h2 className="mt-3 font-serif text-[clamp(28px,5vw,42px)] leading-tight">{result.name}</h2>
              <p className="mx-auto mt-4 max-w-[380px] text-sm leading-relaxed text-[#29483f]/70">Vui lòng chụp lại màn hình này và liên hệ nhân viên Vi Tiên Cát để nhận ưu đãi.</p>
              <button onClick={() => { setResult(null); setWinnerIndex(null) }} className="mt-7 inline-flex items-center justify-center rounded-full bg-[#17382f] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] text-[#fff7e6] shadow-lg transition hover:-translate-y-0.5">Hoàn tất</button>
            </motion.div>
          </motion.div>
        )}
        {managerOpen && <PrizeManager prizes={prizes} setPrizes={setPrizes} onClose={() => setManagerOpen(false)} />}
      </AnimatePresence>

      <div className="sr-only" aria-live="polite">{winnerIndex !== null && !spinning && prizes[winnerIndex] ? prizes[winnerIndex].name : ''}</div>
    </main>
  )
}

export default App
