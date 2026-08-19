import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  CalendarDays,
  Check,
  Gift,
  Leaf,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react'

const PRIZES = [
  { short: 'GIẢM 30%', name: 'Giảm 30% cho dịch vụ tiếp theo', icon: '30%' },
  { short: 'CẤP ẨM', name: '01 buổi chăm sóc da cấp ẩm', icon: '✦' },
  { short: 'GỘI 60′', name: '01 buổi gội dưỡng sinh 60 phút', icon: '❋' },
  { short: 'BỘ NAIL', name: '01 bộ Nail tay', icon: '✧' },
  { short: 'GÓT SEN', name: '01 buổi Gót Sen Hồng', icon: '❀' },
]

const SEGMENT = 360 / PRIZES.length

function secureRandomIndex(max) {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    const range = 2 ** 32
    const limit = range - (range % max)
    do {
      globalThis.crypto.getRandomValues(values)
    } while (values[0] >= limit)
    return values[0] % max
  }
  return Math.floor(Math.random() * max)
}

function PrizeWheel({ spinning, rotation, onSpin, onSpinComplete }) {
  const labels = useMemo(
    () =>
      PRIZES.map((prize, index) => {
        const angle = index * SEGMENT + SEGMENT / 2
        return { ...prize, angle }
      }),
    [],
  )

  return (
    <div className="relative flex aspect-square w-[min(72vw,68vh,620px)] items-center justify-center max-md:w-[min(88vw,49dvh)]">
      <div className="pointer absolute left-1/2 top-[-2%] z-30 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-[#e8c986] drop-shadow-[0_5px_10px_rgba(0,0,0,.35)] md:border-l-[18px] md:border-r-[18px] md:border-t-[36px]" />
      </div>

      <div className="absolute inset-[2%] rounded-full bg-[#e9cf96] p-[5px] shadow-[0_24px_90px_rgba(0,0,0,.38),0_0_0_1px_rgba(255,255,255,.28)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f8f3e9] p-[7px]">
          <motion.div
            className="wheel relative h-full w-full rounded-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 5.2, ease: [0.12, 0.68, 0.13, 1] }}
            onAnimationComplete={onSpinComplete}
          >
            <div className="absolute inset-[5%] rounded-full border border-white/30" />
            {labels.map((prize) => {
              const radius = 36
              const rad = (prize.angle * Math.PI) / 180
              const left = 50 + Math.sin(rad) * radius
              const top = 50 - Math.cos(rad) * radius
              return (
                <div
                  key={prize.name}
                  className="absolute z-10 flex w-[24%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center text-[#fffaf0] drop-shadow-sm"
                  style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -50%) rotate(${prize.angle}deg)` }}
                >
                  <span className="font-serif text-[clamp(18px,2.5vw,30px)] leading-none">{prize.icon}</span>
                  <span className="text-[clamp(8px,1.05vw,13px)] font-bold tracking-[0.16em]">{prize.short}</span>
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
        disabled={spinning}
        className="group absolute z-20 flex aspect-square w-[27%] flex-col items-center justify-center rounded-full border-[5px] border-[#ead39c] bg-[#12372e] text-[#fff7e8] shadow-[0_14px_36px_rgba(0,0,0,.35),inset_0_0_0_1px_rgba(255,255,255,.15)] outline-none transition disabled:cursor-wait"
      >
        <Sparkles className="mb-1 size-[clamp(16px,2.3vw,28px)] text-[#eacb86]" strokeWidth={1.6} />
        <span className="text-[clamp(11px,1.7vw,20px)] font-semibold tracking-[0.22em]">{spinning ? 'ĐANG QUAY' : 'QUAY NGAY'}</span>
        <span className="mt-0.5 text-[clamp(7px,.9vw,10px)] uppercase tracking-[0.16em] text-[#d7c8a6]">100% có quà</span>
      </motion.button>
    </div>
  )
}

function App() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winnerIndex, setWinnerIndex] = useState(null)
  const [result, setResult] = useState(null)
  const pendingWinner = useRef(null)

  const spin = () => {
    if (spinning) return

    const winner = secureRandomIndex(PRIZES.length)
    const center = winner * SEGMENT + SEGMENT / 2
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
    setSpinning(false)
    setResult(PRIZES[pendingWinner.current])
    pendingWinner.current = null

    confetti({
      particleCount: 140,
      spread: 78,
      origin: { y: 0.62 },
      scalar: 0.92,
      resize: true,
      disableForReducedMotion: true,
    })
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#0d2c25] text-[#f8f1e5]">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-[1500px] grid-cols-[minmax(280px,.92fr)_minmax(420px,1.35fr)] items-center gap-[clamp(18px,4vw,70px)] px-[clamp(20px,5vw,72px)] py-[clamp(18px,3vh,38px)] max-md:grid-cols-1 max-md:grid-rows-[auto_1fr] max-md:gap-2 max-md:px-4 max-md:py-4">
        <section className="max-md:text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-[clamp(10px,2vh,22px)] inline-flex items-center gap-2 rounded-full border border-[#d8b66f]/35 bg-white/[0.06] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e7cf9b] backdrop-blur-md max-md:mb-2 max-md:px-3 max-md:py-1.5 max-md:text-[8px]"
          >
            <Leaf className="size-3.5" /> Vi Tiên Cát Spa · Ecopark
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <p className="mb-2 font-serif text-[clamp(15px,1.6vw,22px)] italic text-[#dcc58f] max-md:mb-0.5 max-md:text-[13px]">Beauty meets good fortune</p>
            <h1 className="font-serif text-[clamp(46px,5.4vw,82px)] leading-[0.86] tracking-[-0.035em] text-[#fff9ee] max-md:text-[clamp(37px,10vw,52px)]">
              Vòng Xoay
              <span className="block text-[#e7c67f]">May Mắn</span>
            </h1>
            <p className="mt-[clamp(12px,2vh,22px)] max-w-[540px] text-[clamp(13px,1.25vw,17px)] leading-relaxed text-[#e9e1d2]/78 max-md:mx-auto max-md:mt-2 max-md:max-w-[470px] max-md:text-[11px] max-md:leading-snug">
              Hóa đơn từ <b className="text-[#fff3d3]">200K</b> được quay 01 lần. Quay là có quà — không có ô trượt giải.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="mt-[clamp(18px,3vh,34px)] grid max-w-[560px] grid-cols-2 gap-2.5 max-md:hidden"
          >
            <div className="glass-card col-span-2 flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="icon-badge"><Gift className="size-4" /></div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#c8b88f]">Đặc biệt</div>
                  <div className="mt-0.5 text-sm font-semibold text-[#fff8e9]">100% khách quay đều có quà</div>
                </div>
              </div>
              <Check className="size-5 text-[#e2c476]" />
            </div>
            <div className="glass-card flex items-center gap-3 px-4 py-3">
              <CalendarDays className="size-4 text-[#e3c57b]" />
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#bfb18e]">Thời gian</div>
                <div className="text-xs font-medium">20/08 – 02/09</div>
              </div>
            </div>
            <div className="glass-card flex items-center gap-3 px-4 py-3">
              <MapPin className="size-4 text-[#e3c57b]" />
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#bfb18e]">Địa điểm</div>
                <div className="text-xs font-medium">Vi Tiên Cát Spa · Ecopark</div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative flex min-h-0 items-center justify-center max-md:-mt-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-[8%] rounded-full bg-[#c9a85f]/20 blur-3xl" />
            <PrizeWheel
              spinning={spinning}
              rotation={rotation}
              onSpin={spin}
              onSpinComplete={finishSpin}
            />
          </motion.div>

          <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-[#d6c7a4]/65 max-md:flex">
            <CalendarDays className="size-3" /> 20/08 – 02/09 · Ecopark
          </div>
        </section>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#071713]/72 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 270, damping: 22 }}
              className="relative w-full max-w-[520px] overflow-hidden rounded-[32px] border border-[#ead29a]/35 bg-[#f7f1e5] px-7 py-8 text-center text-[#13332b] shadow-[0_35px_110px_rgba(0,0,0,.5)]"
            >
              <button
                onClick={() => setResult(null)}
                className="absolute right-4 top-4 rounded-full bg-[#17382f]/8 p-2 text-[#17382f]/60 transition hover:bg-[#17382f]/12"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </button>
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#17382f] text-[#edce89] shadow-lg">
                <Gift className="size-7" strokeWidth={1.6} />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#9b7c3d]">Chúc mừng bạn</div>
              <h2 className="mt-3 font-serif text-[clamp(28px,5vw,42px)] leading-tight">{result.name}</h2>
              <p className="mx-auto mt-4 max-w-[380px] text-sm leading-relaxed text-[#29483f]/70">
                Vui lòng chụp lại màn hình này và liên hệ nhân viên Vi Tiên Cát để nhận ưu đãi.
              </p>
              <button
                onClick={() => { setResult(null); setWinnerIndex(null) }}
                className="mt-7 inline-flex items-center justify-center rounded-full bg-[#17382f] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#fff7e6] shadow-lg transition hover:-translate-y-0.5"
              >
                Hoàn tất
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sr-only" aria-live="polite">{winnerIndex !== null && !spinning ? PRIZES[winnerIndex].name : ''}</div>
    </main>
  )
}

export default App
