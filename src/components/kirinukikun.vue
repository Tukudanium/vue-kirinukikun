<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script setup lang="ts">
import { onMounted, Ref, ref, StyleValue, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        width?: number
        height?: number
        resultWidth?: number
        resultHeight?: number
        backgroundColor?: string
        shadowColor?: string
        cutLineColor?: string
        cutLineWidth?: number
        fitLine?: boolean
        fitScal?: boolean
    }>(),
    {
        width: 500,
        height: 500,
        resultWidth: 300,
        resultHeight: 200,
        backgroundColor: 'rgb(150, 150, 150)',
        shadowColor: 'rgb(150, 150, 150)',
        cutLineColor: 'rgb(0, 0, 0)',
        cutLineWidth: 2,
        fitLine: true,
        fitScal: true,
    }
)

// ref
const canvasWrapperRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>()
const mainCanvasRef: Ref<HTMLCanvasElement | undefined> = ref<HTMLCanvasElement>()
const shadowCanvasRef: Ref<HTMLCanvasElement | undefined> = ref<HTMLCanvasElement>()
const resultCanvasRef: Ref<HTMLCanvasElement | undefined> = ref<HTMLCanvasElement>()

// 画像受け取り
const image = new Image()

// 対応fileType
const fileTypes = ['png', 'jpeg', 'jpg', 'bmp']

watch(
    () => [
        props.width,
        props.height,
        props.resultWidth,
        props.resultHeight,
        props.backgroundColor,
        props.shadowColor,
        props.cutLineColor,
        props.cutLineWidth,
    ],
    () => {
        setProps()
    }
)
onMounted(() => {
    // マウント時の処理
    setProps()
    canvasWrapperRef.value!.style.position = 'relative'
    mainCanvasRef.value!.style.position = 'absolute'
    mainCanvasRef.value!.style.left = '0'
    mainCanvasRef.value!.style.top = '0'
    shadowCanvasRef.value!.style.position = 'absolute'
    shadowCanvasRef.value!.style.left = '0'
    shadowCanvasRef.value!.style.top = '0'
    resultCanvasRef.value!.style.display = 'none'
})

let magnification = 0 // 拡大率
let targetX = 0 // 画像の位置
let targetY = 0
let scal = 0 // 拡大率

const setProps = () => {
    // propsで変わるCSSをここで定義
    canvasWrapperRef.value!.style.width = props.width + 'px'
    canvasWrapperRef.value!.style.height = props.height + 'px'
    canvasWrapperRef.value!.style.backgroundColor = props.backgroundColor
    mainCanvasRef.value!.style.width = props.width + 'px'
    mainCanvasRef.value!.style.height = props.height + 'px'
    shadowCanvasRef.value!.style.width = props.width + 'px'
    shadowCanvasRef.value!.style.height = props.height + 'px'
    resultCanvasRef.value!.style.width = props.resultWidth + 'px'
    resultCanvasRef.value!.style.height = props.resultHeight + 'px'

    mainCanvasRef.value!.width = props.width
    mainCanvasRef.value!.height = props.height
    shadowCanvasRef.value!.width = props.width
    shadowCanvasRef.value!.height = props.height

    // 影をつけるキャンバス
    const shadowCtx: CanvasRenderingContext2D = shadowCanvasRef.value!.getContext('2d')!
    let shadowColor = props.shadowColor
    if (shadowColor[0] === '#') {
        shadowColor =
            'rgb(' +
            parseInt(shadowColor.substring(1, 3), 16) +
            ',' +
            parseInt(shadowColor.substring(3, 5), 16) +
            ',' +
            parseInt(shadowColor.substring(5, 7), 16) +
            ')'
    }
    shadowColor = shadowColor.replace(')', ', 0.6)')
    shadowCtx.fillStyle = shadowColor
    shadowCtx.clearRect(0, 0, props.width, props.height)
    // 切り取り範囲外に影をつける
    shadowCtx.fillRect(0, 0, props.width, props.height)
    shadowCtx.clearRect(
        (props.width - props.resultWidth) / 2 - props.cutLineWidth / 2,
        (props.height - props.resultHeight) / 2 - props.cutLineWidth / 2,
        props.resultWidth + props.cutLineWidth / 2,
        props.resultHeight + props.cutLineWidth / 2
    )
    // 切り取り枠
    shadowCtx.strokeStyle = props.cutLineColor
    shadowCtx.lineWidth = props.cutLineWidth
    shadowCtx.strokeRect(
        (props.width - props.resultWidth) / 2 - props.cutLineWidth / 2,
        (props.height - props.resultHeight) / 2 - props.cutLineWidth / 2,
        props.resultWidth + props.cutLineWidth / 2,
        props.resultHeight + props.cutLineWidth / 2
    )
    scaling(null, scal)
}

image.onload = () => {
    // 画像が読み込まれた時
    targetX = image.width / 2
    targetY = image.height / 2
    const resultSize = props.resultHeight / props.resultWidth
    // 切り取り領域内いっぱいにぴったりになるサイズにする
    if (image.width * resultSize <= image.height) {
        scal = (props.resultWidth * 1000) / image.width
    } else {
        scal = (props.resultHeight * 1000) / image.height
    }
    scaling(null, scal)
}

const loadImg = (getImage: Blob | File) => {
    getImage.type
    // imageオブジェクトに読み込む
    const reader = new FileReader()
    reader.onload = function (e) {
        image.src = String(e.target!.result)
    }
    reader.readAsDataURL(getImage)
    let mouse_down = false // canvas ドラッグ中フラグ
    let startX = 0 // canvas ドラッグ開始位置
    let startY = 0
    // キャンバスの操作イベントを追加する
    // mainCanvasの上にshadowCanvasを重ねているので、イベントを追加するのはshadowCanvas
    // canvas ドラッグ開始
    shadowCanvasRef.value!.ontouchstart = function (event) {
        mouse_down = true
        startX = event.changedTouches[0].pageX // ドラッグ開始位置を格納
        startY = event.changedTouches[0].pageY
        return false
    }
    shadowCanvasRef.value!.onmousedown = function (event) {
        mouse_down = true
        startX = event.pageX // ドラッグ開始位置を格納
        startY = event.pageY
        return false
    }
    // canvas ドラッグ終了
    shadowCanvasRef.value!.ontouchend = function (event) {
        if (mouse_down === false) return
        mouse_down = false
        updateCanvas(
            (targetX += (startX - event.changedTouches[0].pageX) / magnification),
            (targetY += (startY - event.changedTouches[0].pageY) / magnification)
        ) // 描画
        return false
    }
    shadowCanvasRef.value!.onmouseout = function (event) {
        if (mouse_down === false) return
        mouse_down = false
        updateCanvas((targetX += (startX - event.pageX) / magnification), (targetY += (startY - event.pageY) / magnification)) // 描画
        return false
    }
    shadowCanvasRef.value!.onmouseup = function (event) {
        if (mouse_down === false) return
        mouse_down = false
        updateCanvas((targetX += (startX - event.pageX) / magnification), (targetY += (startY - event.pageY) / magnification)) // 描画
        return false
    }
    // canvas ドラッグ中
    shadowCanvasRef.value!.ontouchmove = function (event) {
        if (mouse_down === false) return
        updateCanvas(
            targetX + (startX - event.changedTouches[0].pageX) / magnification,
            targetY + (startY - event.changedTouches[0].pageY) / magnification
        ) // 描画
        return false
    }
    shadowCanvasRef.value!.onmousemove = function (event) {
        if (mouse_down === false) return
        updateCanvas(targetX + (startX - event.pageX) / magnification, targetY + (startY - event.pageY) / magnification) // 描画
        return false
    }
    // canvas ホイールで拡大縮小
    shadowCanvasRef.value!.onwheel = function (event) {
        // 現在の拡大率にマウスホイールの操作値を加える
        let newScal = scal + event.deltaY * 0.1
        if (newScal < 30) newScal = 30 // 拡大の最小値
        if (newScal > 4000) newScal = 4000 // 拡大の最大値
        scaling(null, newScal) // 画面への拡大率反映
        return false
    }
}
// 拡大・縮小処理
const scaling = (_event: null, newValue: number) => {
    // 画像が入ってないならキャンセル
    if (!image.src) return null
    scal = newValue
    // ピッタリの幅になる倍率と今の倍率の差
    const widthAbs = Math.abs((props.resultWidth * 1000) / image.width - newValue)
    const heightAbs = Math.abs((props.resultHeight * 1000) / image.height - newValue)
    // 枠にピッタリに近いサイズのときにはぴったりに揃える
    if (props.fitScal && widthAbs < 5 && widthAbs < heightAbs) {
        magnification = ((props.resultWidth * 1000) / image.width) * 0.001
    } else if (props.fitScal && heightAbs < 5) {
        magnification = ((props.resultHeight * 1000) / image.height) * 0.001
    } else {
        magnification = newValue * 0.001
    }
    updateCanvas(targetX, targetY) // 画像描画
}
// 画像更新
const updateCanvas = (x: number, y: number) => {
    // 画像が入ってないならキャンセル
    if (!image.src) return null
    const mainCtx: CanvasRenderingContext2D = mainCanvasRef.value!.getContext('2d')!
    // 背景を塗る
    mainCtx.clearRect(0, 0, props.width, props.height)
    // 画像描画の開始、終了位置を計算
    let mainStartX = Math.round(props.width / 2 - x * magnification) // mainCanvasにおける画像描画の開始位置
    let mainStartY = Math.round(props.height / 2 - y * magnification)
    const mainEndX = Math.round(mainStartX + image.width * magnification) // mainCanvasにおける画像描画の終了位置
    const mainEndY = Math.round(mainStartY + image.height * magnification)
    const cropStartX = Math.round((props.width - props.resultWidth) / 2) // 画像切り取りを行う開始位置
    const cropStartY = Math.round((props.height - props.resultHeight) / 2)
    const cropEndX = Math.round(cropStartX + props.resultWidth) // 画像切り取りを行う終了位置
    const cropEndY = Math.round(cropStartY + props.resultHeight)
    // 表示している画像の端が画像切り取り領域の端に近いときピッタリ合わせる
    if (props.fitLine) {
        if (Math.abs(mainEndX - cropEndX) < 5 && Math.abs(mainEndX - cropEndX) < Math.abs(mainStartX - cropStartX)) {
            mainStartX += cropEndX - mainEndX
        }
        if (Math.abs(mainEndY - cropEndY) < 5 && Math.abs(mainEndY - cropEndY) < Math.abs(mainStartY - cropStartY)) {
            mainStartY += cropEndY - mainEndY
        }
        if (Math.abs(mainStartX - cropStartX) < 5 && Math.abs(mainStartX - cropStartX) <= Math.abs(mainEndX - cropEndX)) {
            mainStartX = cropStartX
        }
        if (Math.abs(mainStartY - cropStartY) < 5 && Math.abs(mainStartY - cropStartY) <= Math.abs(mainEndY - cropEndY)) {
            mainStartY = cropStartY
        }
    }
    // 画像描画
    mainCtx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        mainStartX,
        mainStartY,
        Math.round(image.width * magnification),
        Math.round(image.height * magnification)
    )
}
// 画像切り取り
const cropImg = async (returnType: string | 'file', fileType: string | 'png') => {
    // 画像が入ってないならキャンセル
    if (!image.src) return null
    const mainCtx: CanvasRenderingContext2D = mainCanvasRef.value!.getContext('2d')!
    const ctx: CanvasRenderingContext2D = resultCanvasRef.value!.getContext('2d')!
    // 前に描画した分を削除
    ctx.clearRect(0, 0, props.resultWidth, props.resultHeight)
    const cropStartX = (props.width - props.resultWidth) / 2 // 画像切り取りを行う開始位置
    const cropStartY = (props.height - props.resultHeight) / 2
    // 切り抜き領域内の画像を取得
    const imgData = mainCtx.getImageData(cropStartX, cropStartY, props.resultWidth, props.resultHeight)
    // 切り抜いた範囲を描画
    ctx.putImageData(imgData, 0, 0)

    // 拡張子を設定
    let mimeType = 'image/'
    if (fileTypes.indexOf(fileType)) {
        if (fileType === 'jpg') mimeType += 'jpeg'
        else mimeType += fileType
    } else mimeType += 'png'

    // propsで指定した形式でemitした関数にデータを返却
    const dataurl = resultCanvasRef.value!.toDataURL(mimeType) // DataURLに変換
    if (returnType === 'dataurl') return dataurl

    // const bin = Buffer.from(dataurl.split(',')[1], 'base64').toString('base64')
    const bin = window.atob(dataurl.split(',')[1]) // DataURLのBase64部分を抜き出し
    if (returnType === 'base64') return bin

    const buffer = new Uint8Array(bin.length) // バイト配列に変換
    for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i)
    }
    if (returnType === 'arraybuffer') return buffer

    const imageBlob = new Blob([buffer.buffer], { type: mimeType }) // バイト配列からBlobに
    if (returnType === 'blob') return imageBlob

    const imageFile = new File([imageBlob], 'image.' + fileType, {
        // Blobからファイルに
        type: mimeType,
    })
    if (returnType === 'file') return imageFile

    //default
    return imageFile
}

defineExpose({
    loadImg,
    cropImg,
})
</script>

<template>
    <div ref="canvasWrapperRef" class="canvasWrapper">
        <canvas ref="mainCanvasRef" class="mainCanvas"></canvas>
        <canvas ref="shadowCanvasRef" class="shadowCanvas"></canvas>
    </div>
    <canvas id="resultCanvas" ref="resultCanvasRef" class="resultCanvas" :width="props.resultWidth" :height="props.resultHeight"></canvas>
</template>

<style scoped></style>
