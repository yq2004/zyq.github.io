---
title: CaringDoc项目总结
date: {{date}}
tags:
- 前端
- 项目
categories:
- [项目, 前端项目]
---

# CaringDoc 项目总结

## 开发日志

### day1

> 2023-12-15 周五

​    **develop**
​    1. 仓库建立  
​    2. 项目初始化：依赖安装，config文件编辑自动导入
​    3. 注册icon，全局样式编写
​    4. 登录,注册,404路由设计
​    5. axios封装,基本接口编写：login register captcha
​    6. 登录,注册,404 页面初步编写,定义content页面
​    7. 登录注册,表单校验1.0,可读性差,将登录的实现和校验耦合,待优化

​    **bug & debug**
​    无严重bug 但代码质量很低

### day2

> 2023-12-16 周六

​    **develop**
​    1. 引入pinia状态管理和数据持久化管理 管理token 在user.js文件中定义store
​    2. 优化原路由固定导入组件为动态导入,提高页面渲染效率
​    3. 定义子路由
​    4. 定义主页layout 和 主页框架

​    **bug & debug**

1. layout--popup宽度更改 不能在scoped样式域中更改 在纯style中更改并加上!important 同时还学到了深度样式的优化写法：xxx :deep(xxx{})

```css
<style>
//在无scoped的style中写important样式
.el-menu--popup{
    min-width:100px!important;
}
//deep的写法
.more :deep(.el-menu--popup){
    min-width=100px;
}
</style>
```

2. layout--MainContent中的scoped写错成scope：后续因为这个出现样式污染

### day3

> 2023-12-17 周日

**develop**

1. 优化表单校验：实现自定义表单校验：repsw

```js
rePsw:[
    {required:true, message: '请输入密码', trigger:'blur'},
    {min:3, max:15, message:'密码长度应为3-15个字符', trigger:'blur'},
    {
        //自定义校验：validator定义 rule value callback
        validator:(rule,value,callback)=>{
            if(value!=ruleForm.psw){
                callback(new Error('两次输入的密码不一致！'))
            }else{
                callback();
            }
        },
        trigger:'blur'
    }
]
```

2. 优化vscode误报错提示:<br>**建议下次在项目构建前加入此配置信息**

```json
// jsconfig.json
"lib":["dom","es5","es2015.promise","es2015","es2017"]
```

3. 接口规范化useXXXservice，并在登录验证接口调用debug 发现[Object object]这种奇怪格式 需要用JSON.stringfy解决

4. 解耦表单校验和登录注册调用接口的实现

5. 背景图片设置 但是发现图片位置不理想 
6. pinia独立维护 仓库统一导出 增加项目可维护性（需要再main.js中导入并use pinia）:

``` js
// store/index.js
//pinia独立维护
import {createPinia} from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia=createPinia();
pinia.use(persist);

export default pinia;

//仓库统一导出 以便在项目的编写过程中 直接使用index.js获取api 而不必精确到具体模块
export * from './modules/user.js'
```

```js
// store/modules/user.js
import {defineStore} from 'pinia'
import {ref} from 'vue'

export const userUseStore =defineStore('user',()=>{
    const token=ref('');
    const setToken=(newToken)=>{
        token.value=newToken;
    }
    const removeToken=()=>{
        token.value='';
    }
    return{
        token,setToken,removeToken		//对于是否携带 token 用 !!token判断
    }
},
{
    persist:true
})
```

7. debug出scoped错误写成scope
8. 完成宠物信息页面的框架搭建 但是编辑和新增信息表单弹出框没有组件化处理，不易维护，质量差
9. 发现背景图片加上background-position:center center 背景图片的位置会好很多

**bug & debug**

无严重bug

### day4

> 2023-12-18 周一

**develop**

1. 正式完成登录注册页面的接口实现

2. 完成登录卡片的动画效果 用到setTimeOut和vue的样式绑定

   ```js
   //动画效果 利用vue的样式绑定
   const cardHeight=ref('0px');
   onMounted(()=>{
       setTimeout(function(){cardHeight.value='45%'},200)	//0.2s后展开登录卡片
   })
   
   //绑定处
   :style='{height:cardHeight}'
   ```

3. 优化了home布局，利用动态样式计算 质量更高 需要注意运算中的括号不能省略，正是用了动态样式，因此样式更加严谨正确，从而消除了滚动条冲突，因为一般来说，样式布置好了是不会出现滚动条冲突的，el-main很智能

```css
height:calc(100vh - 60px); //注意减号左右的空格 必须留出！！
```

4. 完成了各个主页的开发，实现了新增和编辑表单弹框的组件化，更重要的是**组件化思想**，以后要多多学习这样的应用，为了暴露组件的方法 要用：defineExpose({methods…}),然后在父组件中对该子组件绑定ref:refName，然后在合适的时机用refName.value.method来调用子组件的方法。

   注意要在编辑组件的回显赋值前赋一次空对象，否则会出现点击一次编辑后，由于是编辑，因此会有数据回显写入，然后再点击新增时，数据仍然在表单里，因此需要先赋一次空对象

```js
//子组件中
const open=(row)=>{
    newAnimal.value={name:'',age:'',.....}	//赋空值
    dialogVisible.value=true;
    newAnimal.value.name=row.name;...
}
defineExpose({open})
//父组件
const dialog=ref()	//需要定义子组件的ref
const addNeeds=()=>{
    dialog.value.open();
}
const editNeeds=(row)=>{
    dialog.value.open(row)
}
<MaterialNeedsEdit ref='dialog'> </MaterialNeedsEdit>
```

5. 完成了loading优化和empty优化

​		实际上是el-table的一个api和另外一个插槽：

```vue
//为表格的loading效果绑定loading 在调用获取数据的接口时设置loading为true 获取完毕后 改为false即可
<el-table :loading="loading" stripe :date='NeedsList'></el-table>
<template #empty> <el-empty description='无数据'></el-empty> </template>
```

6. 完成了各个页面的get数据接口规范化开发和引入

```js
import { getMaterialNeedsService } from '@/utils/apis' 
//引入后再封装
const getMaterialNeedsList = async()=>{
    loading.value = true;
    const res = await getMaterialNeedsService();
    NeedList.value=res.data.data;
    loading.value = false;
}
getMaterialNeedsList();
```

**bug & debug**

无严重bug  更多的是代码优化  发现heima上的课写得很好  可以跟着刷一遍！！

### day5

> 2023-12-19

今天基本完成了项目的开发。 commit:11次

**develop**

1. 注销时的确认弹窗 => 对于重要操作 需要以这种形式来确认用户操作 包括后面的删除功能也是如此;
2. 新增和编辑表单时的表单校验 => 正则表达式的初步学习，需要深入学习**正则表达式**
3. 分页请求接口和分页器设计 
4. 分页和筛选的耦合 => 开发时发现 若想要实现筛选和分页 最好将数据绑定在一起作为data传到后端 
5. 完成所有接口的设计 => 观察页面整体布局和组件和需求文档 分析并准备出所有所需的接口
6. 完成新增/编辑表单的父子通信和接口调用 =>发现在编辑或新增数据后 需要让table刷新 但是编辑和新增是子组件 因此涉及到defineEmits ref绑定
7. 完成删除接口的设计和引入 =>通过插槽向后端传入id 删除即可
8. 完成使用物资的接口设计 => 通过分析需求和讨论 确定出前端向后端传入id和使用的数量，然后再进行数据更新，而不是前段改变后直接put到后端，但是前端仍然可以通过校验值来进行一些修饰
9. 完成‘’寻找‘和’‘领养审核’‘功能的开发 => 7.8.都是分析 设计接口 通过需求确定思路
10. axios拦截器的配置 =>响应拦截和请求拦截 分别用来拦截前端的非法(不够格)请求和后端的错误响应
11. 完成token和路由守卫 => 询问GPT得到结果

**bug & debug**

无严重bug

开发要点：

1. 确认弹窗如何写

```javascript
ElMessageBox.confirm(
	'提示内容',
    '提示标题',
    {
        confirmButtonText:'确认按钮文字',
        cancelButtonText:'取消按钮文字',
        type:'waring',//弹窗类型 waring danger
    }
).then(()=>{
    //点击确认按钮后的处理
}).catch(()=>{
    //点击取消按钮以及出错的处理
})

EMB.confirm(
	'',
    '',
    {
        confirmButtonText:'',
        cancelButtonText:'',
        type:'',
    }
).then(()=>{
    
}).catch(()=>{
    
})

```

四部分：提示内容和提示标题 | 按钮文字和弹窗类型 | 确认操作 |取消**和出错**操作

2. 表单校验实现时主要涉及到两点：1. 表单校验的实现思路 2. 正则式的编写

​		实现思路：

```js
const formModel=ref({pro1:'',pro2:''})
//1.定义rules 要求以下格式 要求属性与formModel(要绑定的表单)一致
const rules={
    pro1:[
        {required:true,message:'请输入xxxx',trigger:'blur'}
        {pattern:/^S{1,10}$/,message:'pro1必须是1到10位非空字符'}
    ],
    pro2:[
        {required:true|false,message:'请输入xxxx',trigger:'blur|focus|active...'}
        {pattern:/^.../,message:'pro2必须是...'}
    ]...
}
//2.为el-form 绑定:rules='rules' 以及 :model='formModel'(这个即使不校验 也要绑定...)同时为每个对应的表单item绑定prop='pro' 对应的属性
<el-form :rules='rules'>
    <el-form-item prop='pro1'></el-form-item>
    <el-form-item prop='pro2'></el-form-item>
</el-form>
```

另一点比较重要的是 表单校验的同步：只有在校验有效后才提交表单，这需要通过ref实现，**首先为表单绑定ref，然后定义ref，然后同步调用ref对象的validate方法**

```js
const formRef=ref();
const confirm=async()=>{
  await formRef.value.validate();
  //xxx其他操作 如提交等
}

<el-form ref="formRef" :model="newStray">...
```

3. 分页请求接口和分页器的设计

​		分页器常常渲染不出来，而且还不会报错。因此用不好会很头疼，但是要点在于数据的合法性，有些数据一定要绑定，有些数据绑定时还应遵守规则，比如page-size和page-sizes[x,x,x]page-size一定要在page-size的集合中，而total等数据等一定要绑定有值的数据，不能是空值或undefined，因此在模拟时也尽量模拟有效值，另外，最不易出错的方法是：**绑定所有接口，并为每个接口都绑定<u>有效</u>属性**

```js
<el-pagination
	v-model:current-page='param.currentPage'
	v-model:page-size='param.pageSize'
	:page-sizes='[5,10]'											//page-size和page-sizes一定要注意
	:background=true
	layout="total, sizes, prev, pager, next, jumper"
	:total='total'													//测试时最好绑定正常一点的值
	@size-change="handleSizeChange"									//这方法最好定义出来 一般是页面数据改变时，改变																		param数据并回显(再调用get请求 渲染新数据)
    @current-change="handleCurrentChange"
	style="justify-content: center;margin-top: 9px;padding-bottom: 10px;"	//这样式最好加上 居中并控制上下空隙
/>
```

分页请求接口的设计中，最关键的是实现分页的数据结构param对象，分析：前端需要向后端传递页面大小和当前页面，后端根据这些来返回对应的数据，然后前端再渲染这些数据，会感觉到前端并没有保存着所有页的数据，分页只是表象，本质其实是请求不同的数据并展示，可以注意到，我们所看到的数据本地都是没有的，那么对于筛选也是这样，后端向前端返回数据，前端再展示，因此呢，完全可以将他们封装在一起，作为请求渲染时的数据结构！注意啊：关键是数据，本质是特定数据，前端,或者说用户本地并没有真的有这么多页的数据！！！因此不难得出以下的设计结构：

```js
const param=ref({
	pageSize:10,
    currentPage:1,
    // ↑分页 ↓具体数据或者说关键数据 需要展示的内容 或者 筛选需要的内容 但是最好全部拿过来 又不会很影响性能 而且有利于以防万一
    pro1:'',
    pro2:'',...
})

const total=ref(200);	//在测试时 不要用0 否则有时渲染不出来分页器
//以下为接口 注意：get和delete请求 需要在config中加对象，而post put可以直接在路径后跟data对象
export const getInforService=(params)=>request.get('/manage/petsInfor/get',{params})
```

4. 接口的设计

​		token的处理一并说了，token需要加在请求的header中，这样每次请求就能携带token了，添加在config中就可以了，然后就是post put和delete get的参数的处理区别，后者需要写在config中 而前者直接跟在路径后：

​		还需特别注意的是命名规范：xx(action)XX(object)Service 而在调用时进一步封装为 xx(action)Service，同时，store也有对应的命名和封装规范.后面再讲。

```js
import request from "@/utils/http/request.js"
import { useUserStore } from "@/stores"
const userStore=useUserStore();
//get all ->select
export const getPetsInforService=(params)=>request.get('/manage/petsInfor/get',{params,headers: { 'Authorization': 'Bearer ' + userStore.token }})
//add -> insert
export const addPetsInforService=(data)=>request.post('/manage/petsInfor/add',data,{headers: { 'Authorization': 'Bearer ' + userStore.token }})
//delete by id ->delete
export const deletePetsInforService=(id)=>request.delete('/manage/petsInfor/delete',{params:id,headers: { 'Authorization': 'Bearer ' + userStore.token }})
//edit by id ->update
export const editPetsInforService=(data)=>request.put('/manage/petsInfor/edit',data,{headers: { 'Authorization': 'Bearer ' + userStore.token }})
```

5. 接口的调用，即业务功能的实现，实际上，业务功能不是单一的，并非编辑就仅仅调用编辑接口，用户是十分需要反馈的，进行操作后，视图最好马上就重新渲染，因此**基本上。凡是影响到数据，而数据影响到当前视图的，应当马上再调用get接口渲染新数据！**除此之外，还应该注意到，业务功能的实现，最重要的是思路，而好的思路是分析问题，将问题抽象为已有的简单接口，用简单的事情完成困难的事情！！

6. <a name='diff1'>组件化和父子通信</a>：其实这里涉及到另一个我想说的，就是优化，在本项目中，我是将新增/编辑信息组件化成了一个弹框类型的组件，但是也可以组件化**抽屉**组件，这个组件在某些场景下能带来更好的用户体验，首先，最重要的就是组件化的思想，不仅能增加复用性，甚至有些操作的实现在组件化下会非常简单，比如这里的：如果是新增则为空表格，如果是编辑则回显，这里就是组件化，然后在子组件中判断是否存在id，是则回显数据，否则让数据为空，不过这里涉及到一个细节：**无论如何 先赋空**，否则会导致点击编辑后，以后再点新增时，表单里面会有残余数据。其实就是通信：组件的父子通信可以分为definedEmits和definedProps和definedExposed三种，这里用到的是emits，即子组件在提交后，通知父组件重新渲染一次页面（符合5中的原则），这种事件的通知就是依靠emits实现的。这三个的具体结构：

   ```js
   1.defineEmits:
   用处：向父组件抛出子组件的事件，以便该事件发生后，父组件能够察觉并采取相应的行动,如本项目中，Edit组件数据更改确认后，父组件需要马上get一次数据刷新页面，就是通过emits完成的
   用法： 1. 在子组件中定义：
   		const emits = defineEmits(['eventA','eventB'])
         2. 在子组件中触发：
         	...emits('eventA')...	//也可以携带参数↓
           ...emits('eventB',xx.value)
   	  3. 父组件中定义和绑定
         	//定义
         	const handleEventA=()=>{
               ...
           }
           const handelEventB=(val)=>{
               ...
           }
           //绑定   
           <ChildComponent @eventA='handelEventA' @eventB='handelEventB'></ChildComponents>
   ```

   ```js
   2.defineProps:
   用处：向父组件暴露子组件的属性，父组件可以为子组件的属性赋值
   用法： 1. 在子组件中定义
   		defineProps({
               propA:{
                   type:[Number,String],
               	required:true 
               }
               propB:{
               	type:Boolean,
               	default=false;
           	}
           })
   	  2. 在父组件中传值
         <ChildComponents :propA="dataA" :propB="dataB"></ChildComponents>
   ```

   ```js
   3.defineExpose:
   用处：子组件向父组件暴露方法，父组件可以调用子组件暴露出来的这个方法 如此项目的open方法
   用法: 1. 子组件中暴露
   		defineExpose({method})//method是已经定义好了的方法
   	  2. 父组件定义，绑定和调用
         	const Child=ref();	//定义
   		...Child.value.method...//在某个合适的时机调用子组件的method方法
         	<ChildComponents ref='Child'></ChildComponents> //绑定
   ```

8. 拦截器

   拦截器包括响应拦截器和请求拦截器，各自的功能是：

   1. 响应拦截器：在请求发送前进行必要操作处理，例如添加统一cookie、请求体加验证、设置请求头等，相当于是对每个接口里相同操作的一个封装；
   2. 请求拦截器：在请求得到响应之后，对响应体的一些处理，通常是数据统一处理等，也常来判断登录失效等。

   ```js
   // 添加请求拦截器
   axios.interceptors.request.use(function (config) {
       // 在发送请求之前做些什么，例如设置token
       config.headers.Authorization = 'Bearer your-token';
       return config;
   }, function (error) {
       // 对请求错误做些什么
       return Promise.reject(error);
   });
   
   // 添加响应拦截器
   axios.interceptors.response.use(function (response) {
       // 对响应数据做点什么 打印错误信息msg或者错误码code等等
       return response;
   }, function (error) {
       // 对响应错误做点什么
       if (error.response.status === 401) {
           // 处理未授权的情况 一般为跳转到login界面
       }
       return Promise.reject(error);
   });
   ```

9. <a name='diff2'>路由守卫</a>

​		token，vue router，pinia，axios拦截器共同完成权限的处理，只有登录了的用户（token有效）才能访问主页和请求数据，否则将被拦截且重定向到登录页面。对于token，要用pinia进行持久化状态管理，对于路由守卫，要结合token去判断，并且赦免登录页和注册页的守卫（或者说 只对于被标记了**需要保护**的路径进行审查）。

​	1. 设置pinia store

```js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken;
      localStorage.setItem('token', newToken);
    },
    clearToken() {
      this.token = '';
      localStorage.removeItem('token');
    }
  }
});
```

2. 配置router

```js
//保护需要认证的路由，并在token无效时重定向到登录页面。
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  // ...你的其他路由
  {
    path: '/protectedPath',
    component: () => import('path/to/protected/component.vue'),
    meta: { requiresAuth: true }	//这就是上文提到的被标记为《需要保护》的路径
  },
  // ...其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//核心代码
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
```

3. axios拦截器配置

```js
import { useAuthStore } from './store/auth';
import router from './router'; 
import axios from 'axios'

const intance = axios.create();
// 请求拦截器
instance.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(response => {
  return response;
}, error => {
  const authStore = useAuthStore();
  if (error.response.status === 401) { // token过期或未授权
    authStore.clearToken();
    router.push('/login');
  }
  return Promise.reject(error);
});
```

**注意 别忘了在main.js中为app应用所有的依赖实例。**

## 项目总结

### 项目展示

> 一站式解决流浪动物的管理，领养，寻回，因此包括动物信息的管理，走失信息的管理，领养申请的管理，物资捐赠和需求的管理的几大管理功能。目前仅涉及管理员端，包括登录，注册页面，主页：各信息的增删查改。

**404页面**

![404](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_404.png)

**登录页面**

![登录](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_login.png)

**注册页面**

![注册](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_register.png)

**主页-动物信息管理**

![动物信息](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_home_petsInfo.png)

**主页-动物信息添加/编辑**

![动物信息添加/编辑](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_addPetsInfo.png)

**主页-领养信息管理**

![领养信息](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_home_adoption.png)

**主页-失主信息管理**

![失主信息](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_home_stray.png)

**主页-物资捐献管理**

![物资捐献](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_home_materialDonation.png)

**主页-物资需求管理**

![物资需求](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_home_materialNeeds.png)

**主页-个人操作入口**

即包括注销，个人信息编辑（未开发）等<br>将鼠标悬浮在右上角头像上将弹出冒泡框，显示个人中心，注销，更多等功能。点击注销后弹出如下警告窗口。![注销](https://springbear-markdown-photo.oss-cn-wuhan-lr.aliyuncs.com/pro_CaringDoc_logout.png)

### 开发思路

0. 与团队成员沟通，确定好原型图，统一并记录变量命名和api路径

1. 初始化vue 项目 引入依赖和必要的配置信息：自动导入和ES版本引入等等
2. gitee仓库创建 并对项目进行版本控制
3. 路由设计和各页面框架设计
4. 各页面静态开发，不着重考虑样式
5. 权限管理 token pinia axios vueRouter
6. api设计和引入，即完成动态开发
7. 样式开发
8. 测试

### 难点和解法

难点：

1. <a href='#diff1'>组件通信 3个define </a>
2. <a href='#diff2'>权限管理</a>

## 反思

本次项目是开发的第一个较完整的前端项目，之前的都没实现动态，而且团队组织也一般，尽管这次也有很多不完美的地方，但总体来说，学到了很多很多。

### 不足

#### 个人规划不足

> 规划角度 目前只能回忆到两点不足了。 自我反思的能力很大程度上取决于对内心的探索能力，内心戏多，高敏感也挺好，可以看到更多向内的东西。我应该接纳自己 爱上自己~

1. 没有第一时间记录项目开发。放在第一点反思，因为真的很重要。如果不能及时记录下当时遇到的困惑和解决方法，很容易下次遇到相同的问题只能无奈地又去搜索。因为几乎没有再有高效的复习方法了，以后再看这个项目时，对于一些细节和坑可能无法像当时一样记得清楚了。
2. 开发思路还可以更清晰。这一点应该是值得赞许的，作为首个项目，本人的开发过程和思路已经有一定的规划和整理，比如先导入好所有依赖和对依赖进行配置和自动导入，再准备好整体路由设计框架。但是还可以更加清晰，从而加快开发速度，比如：再第一个阶段不该太苛求于样式，样式美化是好事，但是不能耽误自己的进度，以及原型图等的设计，尽管这一部分可能不由开发者处理，但是当团队无人负责此工作时，自己学着做好会更好；另一点就是数据命名和接口路径，无论是协作还是个人独立开发，现在接触的动态网页项目，那么对于数据的命名和接口的路径，最好在开发前商定好，并记录下来！口说无凭，容易忘记，开个会不能仅仅只靠脑子，一定要记在文档中；这个项目后期因为命名浪费了好多好多时间。

#### 团队规划不足

> 其实感觉团队其他成员做得已经很好了 但是还可以更好！而且这些不足或许很大程度上是有项目开发的时间决定的？当时是期末，总感觉大家都没有静下心来？因为期末的事情比较多，所以大家没有沉下心来做这件事？

1. 分工问题。没有负责进行接口文档撰写和原型图设计等产品经理所扮演的角色的成员。我们是一个四人组，一人前端，一人后端，另外两位负责报告撰写，数据库设计，uml建模，需求分析，数据字典编写等等，我没有切身尝试过全部的这些事情，所以我不知道到底是分工的确可以再优化（没有优化），还是团队人数所限才导致没人负责api文档和原型设计等(优化不了)；
2. 整体开发规划。由于项目队长缺少项目开发经验，因此对于项目的开发过程并没有干预或领导太多，也就没有太多的过程监督和高质量的结果评价，没有进行敏捷开发，没有分配具体任务，没有绘制燃尽图等；

#### 开发能力不足

> 在开发方面，因为经验欠缺，开发的能力也显得十分不足，解决之道是多参与项目的开发，熟能生巧。

1. 接口设计：接口是动态网页的关键，然而在这一方面我却最为薄弱。应该自己做一个全栈项目，这样才能真正弄懂接口设计。具体而言，在本项目中，没有用到fetch请求，在开发过程中没有彻底弄懂前端的请求拦截和响应拦截，只是粗略带过，但是在回顾该内容时进行了梳理。
2. token：仍属于动态网页的关键部分，有的token要求Authencation为key，在开发的过程中也忽略过了，但是好在回顾的时候，进行了梳理。（看来项目的回顾和总结真的是非常重要，受迫于项目开发进度要求，可能无法在项目开发的过程中弄懂每个知识点，因此必要的带过有助于高效学习，但是重要的是，一定不能忘记自己粗略带过去的那些知识点，否则就得不偿失了）
3. 开发流程：经过此次项目后：我发觉自己在开发前端项目时，虽然有一定的开发规划，正如前文个人规划不足的第二点所说，但是无论是整体开发流程还是开发细节流程上，都是可以进一步完善的。比如：这一次，我设计好路由后，就直接开始逐个开发主页，然而考虑到很多组件的复用性，其实在总体把握和分析好项目界面后再去开发会更好，如果有了原型图，那么就更应该进一步观察和分析项目原型图，分析哪些部分是可以进行复用的，这样才能提高代码的可维护性，提高项目的开发效率。Vue的组件机制是很好的！要学会利用这一机制，本次项目的一个比较简单的点就在于，主页全是表格插槽，没有涉及太多父子组件传值等机制。因此，这个项目还不够，远远不够。以上是细节的角度；而从总体流程上来看，应该更有规划一些，先静态，再动态，先结构，再样式，先分析，再设计。只有最不会写代码的人，才会急于去写代码！！！

### 进步

#### 非代码能力进步

在写完了这篇文章后才算真正完成这个项目，写文档这一行为本身就是非代码能力上的最大的进步！进行本次完整的开发后，深刻反思和认识到**分析**的重要性，千万不能一股脑地动代码！！！总体按照开发思路来，而对于具体的页面开发部分，要分析原型图和需求，考虑哪些部分可以进行组件化开发，考虑哪些部分是需要和团队沟通来改进、调整的。

#### 开发能力进步

New：能够开发出一个动态网站，进行权限管理，添加一些简单动画来优化用户体验，通过深度样式改变EP的原生样式，进一步封装各种依赖工具：pinia，axios

Up：在路由设计中用动态组件来提高效率。。。想不到别的了(✿◡‿◡)

### 未来规划

1. 开发出客户端，小组成员可能不会再理这个项目了，但是，本人将在完善好后端方面的知识后，进行项目的扩展开发，实现客户端的开发，并实现管理端的其他功能，包括文件上传，模糊查询，个人信息的更新等；
2. 进一步学习JavaWeb，用SSM进行后端的编写，进一步学习Redis数据库，进行数据缓存存储的优化，进一步学习Vue的其他技巧。

