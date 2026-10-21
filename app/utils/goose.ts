import type { AvatarDef, AvatarFraming, AvatarId } from '~/types'

export type GoosePose = 'walk' | 'walk2' | 'stand'

const ink = '#1b1b2f'

function propFor(id: AvatarId, color: string): string {
  switch (id) {
    case 'rocket':
      return `
    <g transform="rotate(-18 120 300)">
      <path d="M92 250 L120 200 L148 250 L148 330 L92 330 Z" fill="${color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="120" cy="268" r="12" fill="#bdeaff" stroke="${ink}" stroke-width="5"/>
      <path d="M92 300 L72 335 L92 330 Z M148 300 L168 335 L148 330 Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 330 L120 385 L140 330 Z" fill="#ffd166" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
    </g>`
    case 'spark':
      return `
    <ellipse cx="320" cy="122" rx="62" ry="26" fill="${color}" stroke="${ink}" stroke-width="6"/>
    <circle cx="320" cy="92" r="9" fill="${color}" stroke="${ink}" stroke-width="5"/>
    <g transform="rotate(25 215 335)"><rect x="205" y="290" width="14" height="90" rx="6" fill="#8d5a3b" stroke="${ink}" stroke-width="5"/>
    <path d="M205 290 L219 290 L212 262 Z" fill="${color}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/></g>`
    case 'wizard':
      return `
    <circle cx="352" cy="190" r="30" fill="none" stroke="${ink}" stroke-width="7"/>
    <circle cx="352" cy="190" r="22" fill="#e9fbff" fill-opacity=".7"/>
    <path d="M262 170 Q282 110 340 108 Q392 110 408 150" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
    <rect x="248" y="162" width="22" height="46" rx="10" fill="${color}" stroke="${ink}" stroke-width="5"/>`
    case 'maker':
      return `
    <path d="M250 330 C205 300 215 262 250 280 C285 262 295 300 250 330 Z" fill="${color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>`
    case 'explorer':
      return `
    <path d="M262 150 Q340 100 420 150" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
    <circle cx="318" cy="150" r="26" fill="#e9fbff" stroke="${ink}" stroke-width="7"/>
    <circle cx="378" cy="156" r="26" fill="#e9fbff" stroke="${ink}" stroke-width="7"/>
    <rect x="334" y="138" width="28" height="12" fill="${color}" stroke="${ink}" stroke-width="5"/>`
    case 'star':
      return `
    <path d="M330 60 L342 92 L376 94 L350 114 L359 147 L330 129 L301 147 L310 114 L284 94 L318 92 Z" fill="#ffd166" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M296 300 L330 318 L296 336 Z M364 300 L330 318 L364 336 Z" fill="${color}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>`
  }
}

export function gooseSvg(avatar: Pick<AvatarDef, 'id' | 'color'>, pose: GoosePose = 'walk'): string {
  const stride = pose === 'stand' ? 0 : pose === 'walk' ? 26 : -26
  const leftFoot = 205 + stride
  const rightFoot = 265 - stride

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g stroke="${ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M${leftFoot - 8} 410 L${leftFoot + 8} 450 M${rightFoot - 8} 410 L${rightFoot + 8} 450" fill="none" stroke="#ff9f1c" stroke-width="12"/>
    <path d="M${leftFoot - 14} 456 Q${leftFoot + 20} 440 ${leftFoot + 44} 456 Q${leftFoot + 20} 470 ${leftFoot - 14} 456 Z" fill="#ff9f1c"/>
    <path d="M${rightFoot - 14} 456 Q${rightFoot + 20} 440 ${rightFoot + 44} 456 Q${rightFoot + 20} 470 ${rightFoot - 14} 456 Z" fill="#ff9f1c"/>
    <path d="M118 330 Q70 305 62 270 Q108 280 140 300 Z" fill="#fff"/>
    <ellipse cx="235" cy="330" rx="125" ry="95" fill="#fff"/>
    <path d="M300 250 Q330 215 335 160 L385 170 Q375 250 340 295 Z" fill="#fff" stroke="none"/>
    <circle cx="352" cy="165" r="78" fill="#fff"/>
    <path d="M262 350 Q300 315 335 345 Q300 390 262 350 Z" fill="#f1f1f8"/>
    <ellipse cx="175" cy="325" rx="52" ry="38" fill="#eef0ff" transform="rotate(-12 175 325)"/>
    <path d="M410 168 Q460 168 468 190 Q455 214 410 205 Z" fill="#ff9f1c"/>
    <path d="M412 188 L460 192" fill="none" stroke-width="4"/>
  </g>
  <path d="M286 262 Q336 292 392 252 L392 238 Q335 262 292 232 Z" fill="${avatar.color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="378" cy="158" r="11" fill="${ink}"/>
  <circle cx="382" cy="154" r="4" fill="#fff"/>
  <circle cx="394" cy="195" r="11" fill="#ff9fb2" fill-opacity=".7"/>
  ${propFor(avatar.id, avatar.color)}
</svg>`
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export interface DrawRect {
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
}

export const characterHeightRatio = 0.92
export const characterBottomRatio = 0.04

export function characterDrawRect(
  framing: AvatarFraming,
  source: { width: number, height: number },
  box: { width: number, height: number },
  heightRatio = characterHeightRatio,
): DrawRect {
  const sw = framing.width * source.width
  const sh = framing.height * source.height
  const scale = Math.min((box.height * heightRatio) / sh, (box.width * 0.96) / sw)
  const dw = sw * scale
  const dh = sh * scale
  return {
    sx: framing.x * source.width,
    sy: framing.y * source.height,
    sw,
    sh,
    dx: (box.width - dw) / 2,
    dy: box.height - dh - box.height * characterBottomRatio,
    dw,
    dh,
  }
}

const characterVertexShader = `
attribute vec2 position;
attribute vec2 textureCoordinate;
varying vec2 uv;
void main() {
  uv = textureCoordinate;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const characterFragmentShader = `
precision mediump float;
varying vec2 uv;
uniform sampler2D image;
uniform vec2 texel;

float brightness(vec2 offset) {
  vec4 sampleColor = texture2D(image, uv + offset);
  return max(sampleColor.r, max(sampleColor.g, sampleColor.b));
}

void main() {
  vec4 color = texture2D(image, uv);
  float level = max(color.r, max(color.g, color.b));
  float dark = 1.0 - smoothstep(0.05, 0.16, level);
  float near = 0.0;
  near = max(near, brightness(vec2(texel.x, 0.0)));
  near = max(near, brightness(vec2(-texel.x, 0.0)));
  near = max(near, brightness(vec2(0.0, texel.y)));
  near = max(near, brightness(vec2(0.0, -texel.y)));
  near = max(near, brightness(vec2(texel.x * 2.0, 0.0)));
  near = max(near, brightness(vec2(-texel.x * 2.0, 0.0)));
  near = max(near, brightness(vec2(0.0, texel.y * 2.0)));
  near = max(near, brightness(vec2(0.0, -texel.y * 2.0)));
  float alpha = mix(1.0, smoothstep(0.2, 0.45, near), dark);
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
`

export interface CharacterPainter {
  draw: (video: HTMLVideoElement) => void
}

export function createCharacterPainter(
  canvas: HTMLCanvasElement,
  framing?: AvatarFraming,
  heightRatio = characterHeightRatio,
): CharacterPainter | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true })
  if (!gl)
    return null

  function shader(type: number, source: string) {
    const result = gl!.createShader(type)
    if (!result)
      return null
    gl!.shaderSource(result, source)
    gl!.compileShader(result)
    return result
  }

  const program = gl.createProgram()
  const vertex = shader(gl.VERTEX_SHADER, characterVertexShader)
  const fragment = shader(gl.FRAGMENT_SHADER, characterFragmentShader)
  if (!program || !vertex || !fragment)
    return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  const position = gl.getAttribLocation(program, 'position')
  const textureCoordinate = gl.getAttribLocation(program, 'textureCoordinate')
  gl.enableVertexAttribArray(position)
  gl.enableVertexAttribArray(textureCoordinate)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 16, 8)

  function uploadQuad(video: HTMLVideoElement) {
    const rect = framing
      ? characterDrawRect(framing, { width: video.videoWidth, height: video.videoHeight }, { width: canvas.width, height: canvas.height }, heightRatio)
      : { sx: 0, sy: 0, sw: video.videoWidth, sh: video.videoHeight, dx: 0, dy: 0, dw: canvas.width, dh: canvas.height }
    const left = (rect.dx / canvas.width) * 2 - 1
    const right = ((rect.dx + rect.dw) / canvas.width) * 2 - 1
    const top = 1 - (rect.dy / canvas.height) * 2
    const bottom = 1 - ((rect.dy + rect.dh) / canvas.height) * 2
    const u0 = rect.sx / video.videoWidth
    const u1 = (rect.sx + rect.sw) / video.videoWidth
    const vTop = 1 - rect.sy / video.videoHeight
    const vBottom = 1 - (rect.sy + rect.sh) / video.videoHeight
    gl!.bufferData(
      gl!.ARRAY_BUFFER,
      new Float32Array([left, bottom, u0, vBottom, right, bottom, u1, vBottom, left, top, u0, vTop, right, top, u1, vTop]),
      gl!.STATIC_DRAW,
    )
  }

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  gl.viewport(0, 0, canvas.width, canvas.height)
  const texel = gl.getUniformLocation(program, 'texel')

  let isQuadReady = false

  return {
    draw(video: HTMLVideoElement) {
      if (video.readyState < 2 || !video.videoWidth)
        return
      if (!isQuadReady) {
        uploadQuad(video)
        gl.uniform2f(texel, 4 / video.videoWidth, 4 / video.videoHeight)
        isQuadReady = true
      }
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
  }
}

const backdropTolerance = 42

function dilateCharacter(outside: Uint8Array, width: number, height: number, radius: number) {
  const count = width * height
  const horizontal = new Uint8Array(count)
  for (let y = 0; y < height; y++) {
    const row = y * width
    let run = 0
    for (let x = 0; x < width; x++) {
      if (!outside[row + x])
        run = radius + 1
      if (run > 0) {
        horizontal[row + x] = 1
        run--
      }
    }
    run = 0
    for (let x = width - 1; x >= 0; x--) {
      if (!outside[row + x])
        run = radius + 1
      if (run > 0) {
        horizontal[row + x] = 1
        run--
      }
    }
  }

  const keep = new Uint8Array(count)
  for (let x = 0; x < width; x++) {
    let run = 0
    for (let y = 0; y < height; y++) {
      const index = y * width + x
      if (horizontal[index])
        run = radius + 1
      if (run > 0) {
        keep[index] = 1
        run--
      }
    }
    run = 0
    for (let y = height - 1; y >= 0; y--) {
      const index = y * width + x
      if (horizontal[index])
        run = radius + 1
      if (run > 0) {
        keep[index] = 1
        run--
      }
    }
  }
  return keep
}

export function clearConnectedBackdrop(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas
  const pixels = context.getImageData(0, 0, width, height)
  const data = pixels.data
  const count = width * height
  let sample = -1
  for (let index = 0; index < count; index++) {
    if (data[index * 4 + 3]! > 200) {
      sample = index
      break
    }
  }
  if (sample < 0)
    return

  const base = sample * 4
  const red = data[base]!
  const green = data[base + 1]!
  const blue = data[base + 2]!
  const outside = new Uint8Array(count)
  const stack = new Int32Array(count)
  let top = 0

  function isBackdrop(index: number) {
    const offset = index * 4
    if (data[offset + 3]! < 16)
      return true
    return Math.abs(data[offset]! - red) + Math.abs(data[offset + 1]! - green) + Math.abs(data[offset + 2]! - blue) <= backdropTolerance
  }

  function push(index: number) {
    if (outside[index] || !isBackdrop(index))
      return
    outside[index] = 1
    stack[top++] = index
  }

  for (let x = 0; x < width; x++) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    push(y * width)
    push(y * width + width - 1)
  }
  for (let index = 0; index < count; index++) {
    if (data[index * 4 + 3]! < 16)
      push(index)
  }

  while (top > 0) {
    const index = stack[--top]!
    const x = index % width
    if (x > 0)
      push(index - 1)
    if (x < width - 1)
      push(index + 1)
    if (index >= width)
      push(index - width)
    if (index < count - width)
      push(index + width)
  }

  const keep = dilateCharacter(outside, width, height, Math.max(3, Math.round(width / 220)))
  for (let index = 0; index < count; index++) {
    if (!keep[index])
      data[index * 4 + 3] = 0
  }
  context.putImageData(pixels, 0, 0)
}

const paintedTime = new WeakMap<HTMLVideoElement, number>()

export function paintCharacterFrame(canvas: HTMLCanvasElement, video: HTMLVideoElement, framing?: AvatarFraming) {
  if (video.readyState < 2 || !video.videoWidth)
    return
  const size = 320
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }
  if (paintedTime.get(video) === video.currentTime)
    return
  paintedTime.set(video, video.currentTime)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context)
    return
  context.clearRect(0, 0, size, size)
  if (framing) {
    const rect = characterDrawRect(framing, { width: video.videoWidth, height: video.videoHeight }, { width: size, height: size })
    context.drawImage(video, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh)
  }
  else {
    context.drawImage(video, 0, 0, size, size)
  }
  clearConnectedBackdrop(context)
}

export function avatarImageUrl(avatar: AvatarDef, pose: GoosePose = 'walk'): string {
  const images = avatar.images
  if (!images)
    return svgToDataUri(gooseSvg(avatar, pose))
  if (pose === 'stand')
    return images.stand ?? images.walk
  if (pose === 'walk2')
    return images.walk2 ?? images.walk
  return images.walk
}
