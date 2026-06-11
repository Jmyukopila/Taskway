import { writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

function crc32(buf) {
  let crc = 0xffffffff
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeB, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeB, data, crc])
}

function createPNG(size, r, g, b) {
  // Raw image data: filter byte(0) + RGB bytes per row
  const raw = Buffer.alloc((1 + size * 4) * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4)
    raw[rowStart] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4
      // Check if pixel is within a centered circle (radius = size * 0.42)
      const cx = x - size / 2
      const cy = y - size / 2
      const dist = Math.sqrt(cx * cx + cy * cy)
      const radius = size * 0.42
      const isInside = dist <= radius

      // Draw a stylized "M" inside the circle
      const isM = (() => {
        if (!isInside) return false
        // M shape: two vertical bars and a V in middle
        const relX = (x / size) - 0.5
        const relY = (y / size) - 0.5
        const mW = 0.5 // half-width of M
        const thickness = 0.08

        // Left vertical bar
        if (Math.abs(relX - (-mW + thickness)) < thickness && Math.abs(relY) < 0.35) return true
        // Right vertical bar
        if (Math.abs(relX - (mW - thickness)) < thickness && Math.abs(relY) < 0.35) return true
        // Left diagonal (top-left to bottom-center)
        if (relX < 0 && relX > -mW + thickness) {
          const diagX = -(relX + mW - thickness) / (mW - thickness) // 0 at left, 1 at center
          const diagY = -relY / 0.35 // 0 at top, 1 at bottom
          if (diagY > 0 && diagY < 1 && Math.abs(diagY - diagX) < thickness * 3) return true
        }
        // Right diagonal (top-right to bottom-center)
        if (relX > 0 && relX < mW - thickness) {
          const diagX = (relX - (mW - thickness)) / (mW - thickness) // 0 at right, 1 at center
          const diagY = -relY / 0.35
          if (diagY > 0 && diagY < 1 && Math.abs(diagY - diagX) < thickness * 3) return true
        }
        return false
      })()

      if (isM) {
        raw[px] = 255     // R
        raw[px + 1] = 255 // G
        raw[px + 2] = 255 // B
        raw[px + 3] = 255 // A
      } else if (isInside) {
        // Edge anti-aliasing
        const edge = Math.max(0, Math.min(1, (radius - dist + 0.5) / 1))
        const alpha = Math.round(255 * edge)
        raw[px] = r
        raw[px + 1] = g
        raw[px + 2] = b
        raw[px + 3] = alpha
      } else {
        raw[px] = 0
        raw[px + 1] = 0
        raw[px + 2] = 0
        raw[px + 3] = 0
      }
    }
  }

  const compressed = deflateSync(raw)

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)    // width
  ihdrData.writeUInt32BE(size, 4)    // height
  ihdrData[8] = 8                     // bit depth
  ihdrData[9] = 6                     // color type (RGBA)
  ihdrData[10] = 0                    // compression
  ihdrData[11] = 0                    // filter
  ihdrData[12] = 0                    // interlace

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// Generate icons
const sizes = [192, 512]
const teal = { r: 29, g: 158, b: 117 }

sizes.forEach(size => {
  const png = createPNG(size, teal.r, teal.g, teal.b)
  writeFileSync(`public/icons/icon-${size}.png`, png)
  console.log(`✓ icon-${size}.png generated`)
})
