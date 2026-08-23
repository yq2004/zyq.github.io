---
title: Vue基础
date: 2023-11-19 23:54:32
tags: 
- 前端
- vue
categories:
- [前端, vue]
---



# Vue基础

## 属性传值

1. 涉及很多属性的传值时：设计对象并使用v-bind。

   ```vue
   const post = {
     id: 1,
     title: 'My Journey with Vue'
   }
   <BlogPost v-bind="post" />
   //等价于
   <BlogPost :id="post.id" :title="post.title" />
   ```

2. 属性默认值：一般类型：default: xxx 数组或对象类型：default(*rawProps*) {return {message: 'hello',xxx:’xxxx’…}}

   如果声明了 `default` 值，那么在 prop 的值被解析为 `undefined` 时，无论 prop 是未被传递还是显式指明的 `undefined`，都会改为 `default` 值(即default会抹除undefined)

   ```js
   defineProps({
     // 基础类型检查
     // （给出 `null` 和 `undefined` 值则会跳过任何类型检查）
     propA: Number,
     // 多种可能的类型
     propB: [String, Number],
     // 必传，且为 String 类型
     propC: {
       type: String,
       required: true
     },
     // Number 类型的默认值
     propD: {
       type: Number,
       default: 100
     },
     // 对象类型的默认值
     propE: {
       type: Object,
       // 对象或数组的默认值
       // 必须从一个工厂函数返回。
       // 该函数接收组件所接收到的原始 prop 作为参数。
       default(rawProps) {
         return { message: 'hello' }
       }
     },
     // 自定义类型校验函数
     propF: {
       validator(value) {
         // The value must match one of these strings
         return ['success', 'warning', 'danger'].includes(value)
       }
     },
     // 函数类型的默认值
     propG: {
       type: Function,
       // 不像对象或数组的默认，这不是一个
       // 工厂函数。这会是一个用来作为默认值的函数
       default() {
         return 'Default function'
       }
     },
     propH:{
         type:MyClass//可以为自定义的类
     }
   })
   ```

3. 关于Boolean的处理：

   ```js
   // disabled 将被转换为 true
   defineProps({
     disabled: [Boolean, Number]
   })
     
   // disabled 将被转换为 true
   defineProps({
     disabled: [Boolean, String]
   })
     
   // disabled 将被转换为 true
   defineProps({
     disabled: [Number, Boolean]
   })
     
   // disabled 将被解析为空字符串 (disabled="")
   defineProps({
     disabled: [String, Boolean]
   })
   ```

4. 规范化：子组件不该直接去改prop.attribute 虽然无法通过这种方式更改父组件中的值，因为单项数据流，但是为了规范，实在要去修改传入的值可以通过计算属性，或者定义响应式变量，初值取自该属性值，以后对这个响应式变量做修改即可。特别是对于==数组和对象这样的引用类型==，子组件是可以更改并影响到父组件的，而且很难以被发现。对于传入的数组或对象属性更要注意！

## 事件

1. 在 `<template>` 中使用的 `$emit` 方法不能在组件的 `<script setup>` 部分中使用，但 `defineEmits()` 会返回一个相同作用的函数供我们使用：

2. 事件校验：要为事件添加校验，那么事件可以被赋值为一个函数，接受的参数就是抛出事件时传入 `emit` 的内容，返回一个布尔值来表明事件是否合法。

   ```vue
   <script setup>
   const emit = defineEmits({
     // 没有校验
     click: null,
   
     // 校验 submit 事件
     submit: ({ email, password }) => {
       if (email && password) {
         return true
       } else {
         console.warn('Invalid submit event payload!')
         return false
       }
     }
   })
   
   function submitForm(email, password) {
     emit('submit', { email, password })
   }
   </script>
   ```

   

## v-model

1. 绑定组件：

2. 组件内部需要做两件事：

   1. 将内部原生 `<input>` 元素的 `value` attribute 绑定到 `modelValue` prop
   2. 当原生的 `input` 事件触发时，触发一个携带了新值的 `update:modelValue` 自定义事件

   ```vue
   <!-- CustomInput.vue -->
   <script setup>
   defineProps(['modelValue'])
   defineEmits(['update:modelValue'])
   </script>
   
   <template>
     <input
       :value="modelValue"
       @input="$emit('update:modelValue', $event.target.value)"
     />
   </template>
   ```

3. 多个v-model：为组件中的不同属性分别绑定，首先要起别名：

   ```vue
   <!-- MyComponent.vue -->
   <script setup>
   defineProps(['title'])// 改！
   defineEmits(['update:title'])// 改！
   </script>
   
   <template>
     <input
       type="text"
       :value="title" //绑定别名！
       @input="$emit('update:title', $event.target.value)"//update这里也改！
     />
   </template>
   
   //when use:
   <MyComponent v-model:title="bookTitle" /> //绑定title即可
   ```

   基于此，设置多个别名并绑定即可：

   ```vue
   <script setup>
   defineProps({
     firstName: String,
     lastName: String
   })
   
   defineEmits(['update:firstName', 'update:lastName'])
   </script>
   
   <template>
     <input
       type="text"
       :value="firstName"
       @input="$emit('update:firstName', $event.target.value)"
     />
     <input
       type="text"
       :value="lastName"
       @input="$emit('update:lastName', $event.target.value)"
     />
   </template>
   
   //when use
   <UserName
     v-model:first-name="first"
     v-model:last-name="last"
   />
   ```

   4.自定义修饰：


## slot

1. 插槽位于父组件作用域，只能访问父组件中的数据而不能访问子组件中的数据

2. 子组件的插槽中/<slot>/<slot>可以写入数据作为默认值

3. 多插槽，为每个插槽起名即可：添加name属性，如不添加则默认名称：default

   ```vue
   父组件
   <BaseLayout>
     <template v-slot:header>  --><template #header>具名插槽简写
       <!-- header 插槽的内容放这里 -->
     </template>
   </BaseLayout>
   ----------------------------------
   子组件
   <div class="container">
     <header>
       <slot name="header"></slot>
     </header>
     <main>
       <slot></slot>
     </main>
     <footer>
       <slot name="footer"></slot>
     </footer>
   </div>
   ```

4. 默认情况下，如1.所说，但是有时想要实现属性的传递，在slot标签中绑定属性即可，在父组件使用这个子组件时 在子组件标签处绑定V-SLOT=‘properties’ 然后再利用{{properties.xxx}} 但目前我还没有想到适合的使用场景，感觉关系很混乱，而且实在要实现其实完全可以用其他更规范的方式。

## 依赖注入

1. 当父组件想子组件传递数据，常常会用到prop，考虑一颗很高的组件树，如果想要父组件为深层的子组件传递某个值，用prop太难了，为了避免逐级透传，使用提供注入的方式：

   ```vue
   <script setup>
   import { ref, provide } from 'vue'
   const count = ref(0)
   provide('key', count) //注入属性key 值为count 响应式
   </script>
   ```

2. 应用层能为所有组件==提供==：

   ```js
   import { createApp } from 'vue'
   const app = createApp({})
   app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
   ```

3. 为子组件==注入==：

   ```vue
   <script setup>
   import { inject,ref } from 'vue'
   const count = ref(0)
   count = inject('count',99999)-----99999是默认值，当父组件没有提供属性值时，采用这个
   </script>
   ```

4. 原则：**尽可能将任何对响应式状态的变更都保持在供给方组件中**，提高内聚性，易于维护。

5. Symbol:大型的应用，包含非常多的依赖提供，或者编写提供给其他开发者使用的组件库，最好使用 Symbol 来作为注入名以避免潜在的冲突。

   先在一个单独的js文件中导出这些注入名：

   ```js
   //in symbols.js
   export const myInjectionKey = Symbol()
   //in provident
   import { provide } from 'vue'
   import { myInjectionKey } from './symbols.js'
   provide(myInjectionKey, { /*
     要提供的数据
   */ });
   //in injection
   // 注入方组件
   import { inject } from 'vue'
   import { myInjectionKey } from './symbols.js'
   const injected = inject(myInjectionKey)
   ```

   