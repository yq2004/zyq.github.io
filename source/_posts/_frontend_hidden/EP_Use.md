---
title: ElementPlus复习
date: {{date}}
hidden: true
tags:
- 前端
- vue
- ElementPlus
categories:
- [前端, ElementPlus]

---

# Element Plus

## 菜单（导航栏）
>Menu可以设计为导航栏，无论左侧还是顶部，放在对应的容器即可，下一次考虑导航栏的设计，可以采用此思路，设计好布局后，将menu组件放入对应的地方即可，这一次的设计不熟悉EP的组件，因此导航栏的设计并没有规划，导致走了不少弯路，自己也做了一些无用功。
### 菜单的使用技巧
>包括默认打开，折叠菜单，子菜单，菜单项组，打开方式（更多可以参见官网的API 此处给出一些常用的）（注意API的使用所能支持的模式）

默认打开菜单：default-active；default-openeds
折叠菜单：collapse（vertical only）collapse-transition
子菜单（组件）：el-sub-menu
菜单项组（组件）：el-menu-item-group
打开方式：menu-trigger（horizontal only）：string(hover / click)

>又发现了当折叠后，弹出子菜单选项的时间默认值有点慢，显得很卡不丝滑，因此更改响应时间是很有必要的
子菜单响应时间：show-timeout hide-timeout	100ms不错

### 按钮
>今天想要修改按钮的宽度，但ep并没有给出width属性，因此要么用style改，要么用vue控制style改，当然选择动态性的后者：
于是需要知道vue如何绑定style：

>今天想通过行为更改按钮ICON 嘻嘻用v-if 代码如下
```html
<el-button @click="switchSize" v-bind:style="{width:Sidewidth}" class="btn">
    <el-icon v-if="!Btnstate"><Fold /></el-icon>
    <el-icon v-if="Btnstate"><Expand /></el-icon>
</el-button>
```

v-bind：style=“{width：xxxx}”

