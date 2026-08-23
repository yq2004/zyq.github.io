---
title: ElementPlus布局
date: {{date}}
hidden: true
tags:
- 前端
- vue
- ElementPlus
categories:
- [前端, ElementPlus]
---



# Layout

>先介绍布局思路，再介绍布局组件化
## 布局思路 
最重要的是关于el-container的理解：
el-container：当包含header或footer时会垂直排放子元素，否则水平，再利用多个container嵌套可以实现自己想要的布局：
比如我想要h a m式的布局head aside main

考虑container包括一个header和一个小的container
这样header和小container垂直
然后小container内包含aside和main aside和main水平

## 组件化
很多时候都是主要区域变化，导航区不变，因此很有必要在主要区域添加二级路由，将其他部分封装成组件比如LayoutHead LayoutAside，在ep中，由于container的性质已经规定好了（如上） 因此即使封装，也仍要在最外层写上container结构，然后对于具体的内容进行封装：
```js
<script setup>
//使用ep，为了工程化，目前可以封装成这样，在主界面还是要考虑编写最基本的框架，即嵌套的container，container的具体内容可以封装
import LayoutHead from '@/views/home/components/LayoutHead.vue'
import LayoutAside from './components/LayoutAside.vue';
</script>

<template>
  <el-container class="outer">
    <el-header>
      <LayoutHead></LayoutHead>
    </el-header>
    <el-container>
      <LayoutAside></LayoutAside>
      <el-main class="main">
        <RouterView />
        <!-- 二级路由 -->
        <!-- 设计思路：此处为localhost：3000/home，因此在路由home中设置children，然后在home.vue中对应的地方设置router-view -->
      </el-main>    
    </el-container>   
  </el-container>
</template>
```
如代码所示，即使把header封装成了layoutheader，但封装的是内容，外部的container没有封装进去，因此还要写上，即使封装进去了也不会实现，因为当使用组件时，在外部，他已经不具备container的性质了。也就要求在进行开发的时候，先确定好布局，写好容器排版，再将主要内容封装成组件并写在对应的位置。

