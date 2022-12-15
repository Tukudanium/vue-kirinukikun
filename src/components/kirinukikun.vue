<script setup lang="ts">
import { Ref, ref, StyleValue } from "vue";

const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    mainCanvasWidth?: number;
    mainCanvasHeight?: number;
    resultWidth?: number;
    resultHeight?: number;
    backgroundColor?: string;
    shadowColor?: string;
    cutLineColor?: string;
    fileType?: string;
  }>(),
  {
    width: 500,
    height: 500,
    mainCanvasWidth: 500,
    mainCanvasHeight: 500,
    resultWidth: 300,
    resultHeight: 200,
    backgroundColor: "rgb(150, 150, 150)",
    shadowColor: "rgba(150, 150, 150, 0.6)",
    cutLineColor: "rgba(0, 0, 0)",
    fileType: "png",
  }
);
const emits = defineEmits<{
  (e: "getImage", image: File): void;
}>();

let magnification: number = 0; // 拡大率
let targetX: number = 0; // 画像の位置
let targetY: number = 0;
let scal: number = 0; // 拡大率

// 見た目上のサイズ CSSに渡す
const canvasWidth = props.width + "px";
const canvasHeight = props.width + "px";

// ref
const mainCanvasRef: Ref<HTMLCanvasElement | undefined> =
  ref<HTMLCanvasElement>();
const shadowCanvasRef: Ref<HTMLCanvasElement | undefined> =
  ref<HTMLCanvasElement>();
const resultCanvasRef: Ref<HTMLCanvasElement | undefined> =
  ref<HTMLCanvasElement>();
const image = new Image();

image.onload = () => {
  // 画像が読み込まれた時
  targetX = image.width / 2;
  targetY = image.height / 2;
  // 切り取り領域内いっぱいにぴったりになるサイズにする
  if (image.width <= image.height * 1.5) {
    scal = (props.resultWidth * 1000) / image.width;
  } else {
    scal = (props.resultHeight * 1000) / image.height;
  }
  scaling(null, scal);
};

const loadImg = (getImage: any) => {
  // imageオブジェクトに読み込む
  const reader = new FileReader();
  reader.onload = function (e) {
    image.src = String(e.target!.result);
  };
  reader.readAsDataURL(getImage);
  let mouse_down = false; // canvas ドラッグ中フラグ
  let startX = 0; // canvas ドラッグ開始位置
  let startY = 0;
  const shadowCtx: CanvasRenderingContext2D =
    shadowCanvasRef.value!.getContext("2d")!;
  shadowCtx.fillStyle = props.shadowColor; // 灰色（半透明）
  // 切り取り範囲外に影をつける
  shadowCtx.fillRect(0, 0, props.mainCanvasWidth, props.mainCanvasHeight);
  shadowCtx.clearRect(
    (props.mainCanvasWidth - props.resultWidth) / 2 - 2,
    (props.mainCanvasHeight - props.resultHeight) / 2 - 2,
    props.resultWidth + 2,
    props.resultHeight + 2
  );
  // 切り取り枠
  shadowCtx.strokeStyle = props.cutLineColor; // 黒
  shadowCtx.lineWidth = 4;
  shadowCtx.strokeRect(
    (props.mainCanvasWidth - props.resultWidth) / 2 - 2,
    (props.mainCanvasHeight - props.resultHeight) / 2 - 2,
    props.resultWidth + 2,
    props.resultHeight + 2
  );
  // キャンバスの操作イベントを追加する
  // mainCanvasの上にshadowCanvasを重ねているので、イベントを追加するのはshadowCanvas
  // canvas ドラッグ開始
  shadowCanvasRef.value!.ontouchstart = function (event) {
    mouse_down = true;
    startX = event.changedTouches[0].pageX; // ドラッグ開始位置を格納
    startY = event.changedTouches[0].pageY;
    return false;
  };
  shadowCanvasRef.value!.onmousedown = function (event) {
    mouse_down = true;
    startX = event.pageX; // ドラッグ開始位置を格納
    startY = event.pageY;
    return false;
  };
  // canvas ドラッグ終了
  shadowCanvasRef.value!.ontouchend = function (event) {
    if (mouse_down === false) return;
    mouse_down = false;
    drawCanvas(
      (targetX += (startX - event.changedTouches[0].pageX) / magnification),
      (targetY += (startY - event.changedTouches[0].pageY) / magnification)
    ); // 描画
    return false; // イベントを伝搬しない
  };
  shadowCanvasRef.value!.onmouseout = function (event) {
    if (mouse_down === false) return;
    mouse_down = false;
    drawCanvas(
      (targetX += (startX - event.pageX) / magnification),
      (targetY += (startY - event.pageY) / magnification)
    ); // 描画
    return false; // イベントを伝搬しない
  };
  shadowCanvasRef.value!.onmouseup = function (event) {
    if (mouse_down === false) return;
    mouse_down = false;
    drawCanvas(
      (targetX += (startX - event.pageX) / magnification),
      (targetY += (startY - event.pageY) / magnification)
    ); // 描画
    return false; // イベントを伝搬しない
  };
  // canvas ドラッグ中
  shadowCanvasRef.value!.ontouchmove = function (event) {
    if (mouse_down === false) return;
    drawCanvas(
      targetX + (startX - event.changedTouches[0].pageX) / magnification,
      targetY + (startY - event.changedTouches[0].pageY) / magnification
    ); // 描画
    return false; // イベントを伝搬しない
  };
  shadowCanvasRef.value!.onmousemove = function (event) {
    if (mouse_down === false) return;
    drawCanvas(
      targetX + (startX - event.pageX) / magnification,
      targetY + (startY - event.pageY) / magnification
    ); // 描画
    return false; // イベントを伝搬しない
  };
  // canvas ホイールで拡大縮小
  shadowCanvasRef.value!.onwheel = function (event) {
    // 現在の拡大率にマウスホイールの操作値を加える
    let newScal = scal + event.deltaY * 0.05;
    if (newScal < 30) newScal = 30; // 拡大の最小値
    if (newScal > 4000) newScal = 4000; // 拡大の最大値
    scaling(null, newScal); // 画面への拡大率反映
    return false; // イベントを伝搬しない
  };
};
// 拡大・縮小処理
const scaling = (_event: null, newValue: number) => {
  scal = newValue;
  // ピッタリの幅になる倍率と今の倍率の差
  const widthAbs = Math.abs(
    (props.resultWidth * 1000) / image.width - newValue
  );
  const heightAbs = Math.abs(
    (props.resultHeight * 1000) / image.height - newValue
  );
  // 枠にピッタリに近いサイズのときにはぴったりに揃える
  if (widthAbs < 5 && widthAbs < heightAbs) {
    magnification = ((props.resultWidth * 1000) / image.width) * 0.001; // 拡大率反映
  } else if (heightAbs < 5) {
    magnification = ((props.resultHeight * 1000) / image.height) * 0.001; // 拡大率反映
  } else {
    magnification = newValue * 0.001; // 拡大率反映
    console.log(magnification, newValue);
  }
  drawCanvas(targetX, targetY); // 画像描画
};
// 画像更新
const drawCanvas = (x: number, y: number) => {
  const mainCtx: CanvasRenderingContext2D =
    mainCanvasRef.value!.getContext("2d")!;
  // 背景を塗る
  mainCtx.clearRect(0, 0, props.mainCanvasWidth, props.mainCanvasHeight);
  // 画像描画の開始、終了位置を計算
  let mainStartX = Math.round(props.mainCanvasWidth / 2 - x * magnification); // mainCanvasにおける画像描画の開始位置
  let mainStartY = Math.round(props.mainCanvasHeight / 2 - y * magnification);
  const mainEndX = Math.round(mainStartX + image.width * magnification); // mainCanvasにおける画像描画の終了位置
  const mainEndY = Math.round(mainStartY + image.height * magnification);
  const cropStartX = Math.round(
    (props.mainCanvasWidth - props.resultWidth) / 2
  ); // 画像切り取りを行う開始位置
  const cropStartY = Math.round(
    (props.mainCanvasHeight - props.resultHeight) / 2
  );
  const cropEndX = Math.round(cropStartX + props.resultWidth); // 画像切り取りを行う終了位置
  const cropEndY = Math.round(cropStartY + props.resultHeight);
  // 表示している画像の端が画像切り取り領域の端に近いときピッタリ合わせる
  if (
    Math.abs(mainEndX - cropEndX) < 5 &&
    Math.abs(mainEndX - cropEndX) < Math.abs(mainStartX - cropStartX)
  ) {
    mainStartX += cropEndX - mainEndX;
  }
  if (
    Math.abs(mainEndY - cropEndY) < 5 &&
    Math.abs(mainEndY - cropEndY) < Math.abs(mainStartY - cropStartY)
  ) {
    mainStartY += cropEndY - mainEndY;
  }
  if (
    Math.abs(mainStartX - cropStartX) < 5 &&
    Math.abs(mainStartX - cropStartX) <= Math.abs(mainEndX - cropEndX)
  ) {
    mainStartX = cropStartX;
  }
  if (
    Math.abs(mainStartY - cropStartY) < 5 &&
    Math.abs(mainStartY - cropStartY) <= Math.abs(mainEndY - cropEndY)
  ) {
    mainStartY = cropStartY;
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
  );
};
// 画像切り取り
const cropImg = async () => {
  if (!image.src) return null;
  const mainCtx: CanvasRenderingContext2D =
    mainCanvasRef.value!.getContext("2d")!;
  const ctx: CanvasRenderingContext2D =
    resultCanvasRef.value!.getContext("2d")!;
  // 前に描画した分を削除
  ctx.clearRect(0, 0, props.resultWidth, props.resultHeight);
  const cropStartX = (props.mainCanvasWidth - props.resultWidth) / 2; // 画像切り取りを行う開始位置
  const cropStartY = (props.mainCanvasHeight - props.resultHeight) / 2;
  // 切り抜き領域内の画像を取得
  const imgData = mainCtx.getImageData(
    cropStartX,
    cropStartY,
    props.resultWidth,
    props.resultHeight
  );
  // 切り抜いた範囲を描画
  ctx.putImageData(imgData, 0, 0);
  // BlobからFileに変換
  const fileType = "image/" + props.fileType;
  // canvas から DataURL で画像を出力
  const dataurl = resultCanvasRef.value!.toDataURL(fileType);
  // DataURL のデータ部分を抜き出し、Base64からバイナリに変換
  const bin = atob(dataurl.split(",")[1]);
  // 1バイトずつ値を埋める
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // バッファーからBlob、Blobからファイルを作る
  const imageBlob = new Blob([buffer.buffer], { type: fileType });
  const imageFile = new File([imageBlob], "image." + props.fileType, {
    type: fileType,
  });
  // emitした関数にファイルデータを返却
  return imageFile;
};

defineExpose({
  loadImg,
  cropImg,
});
</script>

<template>
  <div
    class="canvasWrapper"
    :width="props.mainCanvasWidth"
    :height="props.mainCanvasHeight"
  >
    <canvas
      ref="mainCanvasRef"
      class="mainCanvas"
      :width="props.mainCanvasWidth"
      :height="props.mainCanvasHeight"
    ></canvas>
    <canvas
      ref="shadowCanvasRef"
      class="shadowCanvas"
      :width="props.mainCanvasWidth"
      :height="props.mainCanvasHeight"
    ></canvas>
  </div>
  <canvas
    ref="resultCanvasRef"
    id="resultCanvas"
    class="resultCanvas"
    :width="props.resultWidth"
    :height="props.resultHeight"
  ></canvas>
</template>

<style scoped>
.canvasWrapper {
  position: relative;
  width: v-bind("canvasWidth");
  height: v-bind("canvasHeight");
  background-color: v-bind("props.backgroundColor");
}
.mainCanvas {
  position: absolute;
  left: 0;
  top: 0;
  width: v-bind("canvasWidth");
  height: v-bind("canvasHeight");
}
.shadowCanvas {
  position: absolute;
  left: 0;
  top: 0;
  width: v-bind("canvasWidth");
  height: v-bind("canvasHeight");
}
.resultCanvas {
  display: none;
}
.baseImage {
  display: none;
}
</style>
