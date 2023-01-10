<script setup lang="ts">
import { kirinukikun } from 'vue-kirinukikun'
//import kirinukikun from './components/kirinukikun.vue'
import { Ref, ref } from 'vue'

const kirinukiRef = ref()
const loadImg = (event: Event) => {
    if (event.target instanceof HTMLInputElement && event.target.files) {
        const file = event.target.files[0]
        kirinukiRef.value.loadImg(file)
    }
    return
}
const cutwidth = ref('300')
const cutheight = ref('300')
const width = ref('500')
const height = ref('500')
const fitLine = ref(true)
const fitScal = ref(true)
const backgroundColor = ref('rgb(150, 150, 150)')
const shadowColor = ref('rgb(150, 150, 150)')

const downloadImage = async () => {
    const file = await kirinukiRef.value.cropImg('file', 'png')
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
</script>

<template>
    <div class="kiritorikunDemo">
        <kirinukikun
            ref="kirinukiRef"
            :width="Number(width)"
            :height="Number(height)"
            :result-width="Number(cutwidth)"
            :result-height="Number(cutheight)"
            :fit-line="fitLine"
            :fit-scal="fitScal"
            :background-color="backgroundColor"
            :shadow-color="shadowColor"
        ></kirinukikun>
        <input type="file" :onchange="loadImg" />
        <div>
            <button class="button-50" role="button" @click="downloadImage">ダウンロード</button>
        </div>
        <div>
            <label for="cheese">width</label>
            <input v-model="width" type="number" min="10" />
        </div>
        <div>
            <label for="cheese">height</label>
            <input v-model="height" type="number" min="10" />
        </div>
        <div>
            <label for="cheese">cutwidth</label>
            <input v-model="cutwidth" type="number" min="10" />
        </div>
        <div>
            <label for="cheese">cutheight</label>
            <input v-model="cutheight" type="number" min="10" />
        </div>
        <div>
            <label for="cheese">fitLine</label>
            <input v-model="fitLine" type="checkbox" />
        </div>
        <div>
            <label for="cheese">fitScal</label>
            <input v-model="fitScal" type="checkbox" />
        </div>
        <div>
            <label for="cheese">backgroundColor</label>
            <input v-model="backgroundColor" type="color" />
        </div>
        <div>
            <label for="cheese">shadowColor</label>
            <input v-model="shadowColor" type="color" />
        </div>
    </div>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
.kiritorikunDemo {
    border: black 1px solid;
}

.button-50 {
    appearance: button;
    background-color: #000;
    background-image: none;
    border: 1px solid #000;
    border-radius: 4px;
    box-shadow: #fff 4px 4px 0 0, #000 4px 4px 0 1px;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    font-family: ITCAvantGardeStd-Bk, Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    margin: 0 5px 10px 0;
    overflow: visible;
    padding: 12px 40px;
    text-align: center;
    text-transform: none;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    vertical-align: middle;
    white-space: nowrap;
}
.button-50:focus {
    text-decoration: none;
}
.button-50:hover {
    text-decoration: none;
}
.button-50:active {
    box-shadow: rgba(0, 0, 0, 0.125) 0 3px 5px inset;
    outline: 0;
}
.button-50:not([disabled]):active {
    box-shadow: #fff 2px 2px 0 0, #000 2px 2px 0 1px;
    transform: translate(2px, 2px);
}
@media (min-width: 768px) {
    .button-50 {
        padding: 12px 50px;
    }
}
</style>
