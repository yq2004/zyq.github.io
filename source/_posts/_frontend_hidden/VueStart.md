---
title: Vue构建
date: {{date}}
tags:
- 前端
- vue
categories:
- [前端, vue]
---



# Learning Vue

## 准备工作
>准备工作分为 大部分：1.初始化项目；2.安装其他依赖和插件；3.自动导入优化和联想
### 初始化项目
进入文件夹，npm init vue@latest --npm install --进入VScode npm run dev
### 安装依赖和插件
npm i axios--npm i element-plus --save -- npm i @element-plus/icon-vue  
npm install -D unplugin-vue-components unplugin-icons unplugin-auto-import :
对于ICON还需要注册：
```js
//main.js
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app = createApp(App)
//注册所有ICON图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
```
注册完毕后，后续使用自动导入，因此不必再html页上作全局导入
### 自动导入和联想
自动导入**ele的组件和icon，vue的重要对象**
```js
//vite.config.js
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // Auto import functions from Vue, e.g. ref, reactive, toRef...
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],

      // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      resolvers: [
        ElementPlusResolver(),

        // Auto import icon components
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],

      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),

    Components({
      resolvers: [
        // Auto register icon components
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        // Auto register Element Plus components
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],

      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),

    Icons({
      autoInstall: true,
    }),

  ],
  resolve: {
    alias: {
      '@': pathSrc
    }
  }
})
```

## 开始编写代码
分为界面部分和逻辑部分，逻辑部分主要是axios的调用等
>界面部分：
>+ 登录前页面：组件:暂无
>1. 登录
>2. 注册   
>+ 登录后页面：组件:导航栏 footer
>1. 主页（信息编辑页） 
>2. 事务页

###界面设计
在进行页面设计前，需要重写***全局样式***：global.css并导入到main.js中
一般要修改的有：app html body三个部分 p,m=0;display:flex;height=100vh等
否则将会出现页面混乱如无法控制布局，无法铺上背景等诸多问题
###登录界面设计
####mode1：单一卡片风
>1.外部容器存放背景图和内部容器
>>2.卡片容器：通常包括卡片头header存放logo或欢迎语
>>>3.表单:主体部分
>>+ uid
>>+ psw
>>+ recap
>>+ login_btn
>>+ about&register&findPsw
>4.说明：常常需要考虑居中和靠左靠右的布局问题：
>>居中：父元素display:flex;align-item:center;justify_content:center;
>>靠左靠右：父元素display:flex;justify_content:flex_end;靠右的子元素：margin-left:auto



