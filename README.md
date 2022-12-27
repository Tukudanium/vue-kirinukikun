# vue-kirinukikun

viteのライブラリモードを利用してvue3のコンポーネントをライブラリとしてnpmに公開してみた。

## 概要

切り取る枠を固定して、中で画像を拡大縮小したり動かしたりするタイプの、vue用画像切り抜きライブラリ。
アイコン画像や配信画像等、アスペクト比や画像サイズを固定させたい場合にご利用ください。
propsをwatchしているので、画面サイズや切り取り枠サイズなどは動的に変更可能です。
npm: <https://www.npmjs.com/package/vue-kirinukikun>

## 利用方法

##### インストール

```bash
npm i vue-kirinukikun
```

```bash
import { kirinukikun } from 'vue-kirinukikun'
```

##### 使用例

template

```bash
<kirinukikun ref="kirinukiRef" ></kirinukikun>
```

script

```bash
const kirinukiRef = ref()

// 画像の読み込み例
const loadImg = (event: any) => {
    const file = event.target.files[0]
    kirinukiRef.value.loadImg(file)
    return
}

// 画像の受け取り例（file形式）
const downloadImage = async () => {
    const file = await kirinukiRef.value.cropImg('file','png')
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
        const link = document.createElement('a')
        link.href = String(e.target?.result)
        link.download = file.name
        link.click()
    }
    return
}
```

画像の読み込み、書き出しにdefineExposeを使っているので、
利用する際はrefを使って関数にアクセスします。

## methods

#### loadImg

```bash
const loadImg: (getImage: Blob | File) => void
```

呼び出し例

```bash
kirinukiRef.value.loadImg(file)
```

切り抜きたい画像を読み込む関数です。
\<input type="file" />　とかで入れてください。

#### cropImg

```bash
async cropImg(returnType: string | 'file', fileType: string | 'png')　=> Promise<string | Blob | File | Uint8Array | null>
```

呼び出し例

```bash
await kirinukiRef.value.cropImg('file', 'png')
```

切り抜き枠の範囲内に表示されている画像を切り抜き、指定の形式で返す関数です。

##### returnType

切り抜いた画像をどのような形で返すかを指定する。

```bash
'dataurl', 'base64', 'arraybuffer', 'blob', 'file'
```

のいずれかが指定可能。上記以外の場合、デフォルトはfile。

##### fileType

切り抜いた画像をどの拡張子の形式で生成するかを指定する。

```bash
'png', 'jpeg', 'jpg', 'bmp'
```

のいずれかが指定可能。上記以外の場合、デフォルトはpng。

## props

基本的に全てデフォルト値が設定されているので、必須項目はありません。

#### width

type: number
default: 500

#### height

type: number
default: 500

切り抜く画像を表示する画面のサイズを設定します。
canvas自体の内部サイズも変化します。

#### resultWidth

type: number
default: 300

#### resultHeight

type: number
default: 200

画像を切り抜くサイズを設定します。

#### backgroundColor

type: string
default: rgb(150, 150, 150)

切り抜く画像を表示する画面の背景色を設定します。
RGBと16進数カラーコードが利用できます。

#### shadowColor

type: string
default: rgb(150, 150, 150)

画像を切り抜く枠の範囲外の、網掛けになっている部分の色を設定します。
RGB、RBGA、16進数カラーコードが利用できます。

#### cutLineColor

type: string
default: rgb(0, 0, 0)

画像を切り抜く枠線の色を設定します。
RGB、RBGA、16進数カラーコードが利用できます。

#### cutLineWidth

type: number
default: 4

画像を切り抜く枠線の太さを設定します。

#### fitLine

type: boolean
default: true

この値がtrueの場合、切り抜く画像の端が画像を切り抜く枠線に近い際に、
枠にぴったりくっつくように動くようになります。

#### fitScal

type: boolean
default: true

この値がtrueの場合、切り抜く画像を拡大縮小している際に、画像を切り抜く枠の幅と近い場合はぴったりのサイズになります。

## その他

初めてのnpmコンポーネント公開ということで試作したものですが、不具合等ありましたらissueにどうぞ。
