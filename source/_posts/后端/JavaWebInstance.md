---
title: JavaWeb基础实例1
date: {{date}}
tags:
- 后端
- SpringBoot
- Mybatis
- 项目
categories:
- [后端, 项目]
---

# 员工部门管理系统——后端

## 环境搭建

1. 创建一个spring项目，添加4个依赖：spring web，mybatis framework，mysql driver，lombok。
2. 数据库配置文件：application.properties:数据库连接经典四件套 和 两个经典mybatis优化配置 log和camelCase
3. MVC代码框架：
   1. pojo：Emp，Dept，Result
   2. controller：@restController @autowired class:EmpController DeptController
   3. service：@service interface:EmpService DepService class:EmpServiceImp DeptServiceImp
   4. mapper：@mapper interface
   4. mapper.XML：执行动态SQL必不可少的文件
4. 其他：
   1. @Slf4j 用于类中日志操作
   2. RequestMapping(“/api”):设置统一父路径
   3. @GetMapping @DeleteMapping @PostMapping @PutMapping 约束数据交流方法
   4. @data @allArgxxx @noArgxxx 
   5. 动态SQL的相关知识点：各种标签的使用和处理
5. 注：代码初步框架如上，但在开发过程中，为了实现需求，还会增加其他的类和依赖和配置文件。

## 需求分析

实现员工-部门的小型后台管理系统：

> 1. 实现员工和部门的增删查改；
> 2. 登录校验和异常处理。

具体分析：

1. 为了完成员工和部门的增删查改。**动态SQL**是必须的，因此在上述代码框架中还要增加相应的XML文件完成动态SQL。员工的属性有头像，因此涉及到**文件的上传**，可以考虑用本地存储或阿里云OSS，若为阿里云OSS还必须创建aliOSSUtil类，两种方法都要创建一个uploadController来完成上传文件的控制。**分页查询**也是必要的，因此需要创建一个PageBean类存储返回的数据和数据条目数。
2. 为了完成登录校验，可以利用JWT和拦截器，因此需要一个jwt的工具类专门来生成和转换jwt，需要一个登录拦截器类和拦截器的注册类，而登录操作也可以创建一个loginController。为了完成异常处理，定义一个全局异常处理类。
3. 为了完成上述功能，除了定义额外的类，还需要必要的依赖和配置文件。而这些都是在具体的开发过程中慢慢完善的。在本阶段先分析到这一步。

## 代码编写

### 类的设计

考虑到需要返回信息给前端，因此可以设置一个返回结果类，封装返回码，状态和数据，数据直接用最泛的Object。

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {
    private Integer code;//响应码，1 代表成功; 0 代表失败
    private String msg;  //响应信息 描述字符串
    private Object data; //返回的数据

    //增删改 成功响应
    public static Result success(){
        return new Result(1,"success",null);
    }
    //查询 成功响应
    public static Result success(Object data){
        return new Result(1,"success",data);
    }
    //失败响应
    public static Result error(String msg){
        return new Result(0,msg,null);
    }
}
```

由开发过程的分析：依次从controller,service interface,service class,mapping interface(or with XML)完成业务的实现。

### 简短的增删查改（部门增删查改）

对于简短的增删查改，可以行云流水地实现在mapper层，不必写在xml中。

```java
@Slf4j
@RestController
@RequestMapping("/depts")
public class deptController {
    @Autowired
    private deptService deptService;

    //getMapping,对于get请求的映射 等价于---@RequestMapping(value = "/depts" , method = RequestMethod.GET)
    @GetMapping
    public Result deptList(){
        log.info("查询所有部门数据");
        List<Dept> deptList=deptService.deptList();
        return Result.success(deptList);
    }

    //获取路径参数 pathVariable注解
    @DeleteMapping("/{id}")
    public Result deptDel(@PathVariable Integer id){
        log.info("删除部门，id："+id);
        deptService.deptDel(id);
        return Result.success();
    }

    @PostMapping
    public Result deptIns(@RequestBody Dept dept){
        log.info("添加部门:"+dept.getName());
        deptService.deptIns(dept);
        return Result.success();
    }
    @PutMapping
    public Result deptMod(@RequestBody Dept dept){
        log.info("修改部门:"+dept.getId());
        deptService.deptMod(dept);
        return Result.success();
    }
}
```

每个函数对应一种业务，从controller开始，层层定义，实现。具体实现中值得注意的地方有：

>1. @RequestBody
>2. @RequestMapping
>3. Result.success()和Result.success(object)
>4. 特殊属性记得每次都更新：updateTime

当设计较为复杂的业务时：分页查询，动态sql，文件处理。可以按以下策略进行：

### 动态增删查改（员工增删查改）

对于“查”，不仅是动态的，而且是分页的。当数据很多的时候，总不能够全都塞在页面吧，因此要设计分页的机制。前端向后端提供页码和每页的大小。

后端根据页码和每页的大小，算出每页显示的元素的范围，用select limit完成操作。同时，前端尝尝还需要统计总的数据量给用户，因此需要用到sql中的count函数。后端将具体的信息和总的数据数返回给前端，这样一看，需要返回两种数据了，因此考虑专门设计一个类来返回这些数据。于是PageBean类由此诞生，当然，它属于pojo。

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageBean {
//    List<Emp> empList;
   /* 这里不要用EmpList，因为将来所有的分页查询都会用到这个类，不能在这里限定泛型*/
    private List rows;
    private Long total;
}
```

那后端还需要获取到前端传过来的参数：页码，每页大小，并且考虑实际运用，还需要设定默认值从第一页开始默认页码为xx，这些业务的实现需要用到：

> @RequestParam(defaulValue=“xxx”)

再接着思考，查询时添加条件是完全必要的，动态添加条件更是重要，因此考虑动态sql，因此，为了一次实现，万金油的利用，如果可以的话，将所有表属性作为参数执行动态SQL将会是一劳永逸的。当然还是得结合实际情况，要是根本不可能去根据某些属性来查询，那就确实没必要编写含有它的动态SQL了。因此可以设计出如下的controller代码：

```java
//这里是根据分页，姓名，性别，入职日期几个属性完成的条件查询
@GetMapping
    public Result selectEmpFilter(@RequestParam(defaultValue = "1") Integer page,
                                  @RequestParam(defaultValue = "10") Integer pageSize,
                                  String name, Short gender,
                                  @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,
                                  @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end)
    {
        log.info("条件查询对应的员工");
        PageBean pageBean=empService.selectEmpFilter(page,pageSize,name,gender,begin,end);
        return Result.success(pageBean);
    }
@DeleteMapping("/{ids}")
    public Result delEmp(@PathVariable Integer[] ids){
        empService.delEmp(ids);
        return Result.success();
    }
```

对应的XML实现如下：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.instance.mapper.empMapper">
    <select id="selectEmpFilterRows" resultType="com.example.instance.pojo.Emp">
        select * from emp
            <where>
                <if test="name!=null and name!=''">
                    name like concat ('%',#{name},'%')
                </if>

                <if test="gender!=null">
                    and gender = #{gender}
                </if>

                <if test="begin!=null and end!=null">
                    and entrydate between #{begin} and #{end}
                </if>
            </where>
            limit #{startIndex},#{pageSize}
--             order by update_time desc
    </select>

    <select id="selectEmpFilterTotal" resultType="long">
        select count(*) from emp
        <where>
            <if test="name!=null and name!=''">
                name like concat ('%',#{name},'%')
            </if>

            <if test="gender!=null">
                and gender = #{gender}
            </if>

            <if test="begin!=null and end!=null">
                and entrydate between #{begin} and #{end}
            </if>
        </where>
    </select>

    <delete id="delEmp">
        delete from emp where id in
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </delete>

</mapper>
```

值得注意的几个点：

>1. name like concat ('%',#{name},'%') ：利用concat 既能实现拼接又能防止sql注入！
>
>2. name !=null and name!=‘’ 这里是空的引号，千万不要加空格，否则会出现很~~傻逼~~的错误：NumberFormatException: For input string:“xx”<-这里是你输入的name，他认为你输入了number；
>3. 最重要的还得是动态sql到底是如何实现的，那几个关键字一定要学会使用<foreach> <where> <if>……
>4. 还有一点就是XML建立时，确定对应的函数的那几个对应，一定也要记住；
>5. 对于日期的处理，可以使用@DateTimeFormat(pattern=“yyyy-MM-dd”)来规范，前端不按照这个格式传，就会返回对应的提示警告。

### 文件上传（带头像的员工的增改）

上传文件，由于文件与其他一般数据不同，需要在前段端和后端都进行额外处理。

前端：form表格中 method=“post” enctype=“multipart/form-data” input中type=‘file’ name=‘xxx(设为image)’

设置好这些后，前端通过post方法传给后端的body中就会包含一般数据和类型为MultipartFile的文件，名称为：xxx（image），后端接受时应保持名称的一致，若是非要不同，可以采用：@RequestParam("image") MultipartFile file)来映射名称。

为了实现文件上传，不如将其考虑为单独的一个controller层，因此设置：uploadController类，然后在这个类中编写相应的代码。

至此，后端可以接受到前端传来的文件数据，但若不将其存储下来，他将是ephemeral的，存放在本地，数据量少尚可如此，倘若数据量大了就不现实也不安全，可以考虑阿里云的oos服务。

> 为文件上传专门定义一个接口，在添加或修改员工头像时调用并自动回显，这并不与添加或修改操作本身冲突，因为在选择文件的那瞬间就调用了upload接口，而另外的是另外的接口/emps /emps/update

#### 本地存储

先创建一个文件夹专门存放这些数据，在这里就已经提前想到了，可能会有同名文件的存在，可以通过uuid来解决这个问题。为了存放文件，必须知道（获取）文件的名称，大小，内容，输入流，和存储具体的方法。MultipartFile 常见方法中包括了这些： 

>- String  getOriginalFilename();  //获取原始文件名
>- void  transferTo(File dest);     //将接收的文件转存到磁盘文件中
>- long  getSize();     //获取文件的大小，单位：字节
>- byte[]  getBytes();    //获取文件内容的字节数组
>- InputStream  getInputStream();    //获取接收到的文件内容的输入流

还要考虑到文件大小，上传一个较大的文件(超出1M)时会报错，因为springBoot默认最大单个大小为1MB。

为了扩大一点，需要在application.properties中添加配置：

``` properties
#配置单个文件最大上传大小
spring.servlet.multipart.max-file-size=10MB
#配置单个请求最大上传大小(一次请求可以上传多个文件)
spring.servlet.multipart.max-request-size=100MB
```

```java
@Slf4j
@RestController
public class UploadController {
    @PostMapping("/upload")
    public Result upload(String username, Integer age, MultipartFile image) throws IOException {
        log.info("文件上传：{},{},{}",username,age,image);
        //获取原始文件名
        String originalFilename = image.getOriginalFilename();
        //构建新的文件名
        String extname = originalFilename.substring(originalFilename.lastIndexOf("."));//文件扩展名
        String newFileName = UUID.randomUUID().toString()+extname;//随机名+文件扩展名
        //将文件存储在服务器的磁盘目录
        image.transferTo(new File("E:/images/"+newFileName));
        return Result.success();
    }
}
```

由此可以进一步完成新增员工和修改员工的功能。

修改员工的实现：为了增强用户体验，在前端点击修改员工时，表格中应默认提供目前的员工信息，也就是要先返回一次按id的查询，然后再进行一次update操作，因此为了完成这一功能实际上要完成两部分，后端分别写与这些功能对应的接口即可，分别的调用由前端完成。

```xml
    <update id="update">
        update emp
        <set>
            <if test="username != null and username != ''">
                username = #{username},
            </if>
            <if test="password != null and password != ''">
                password = #{password},
            </if>
            <if test="name != null and name != ''">
                name = #{name},
            </if>
            <if test="gender != null">
                gender = #{gender},
            </if>
            <if test="image != null and image != ''">
                image = #{image},
            </if>
            <if test="job != null">
                job = #{job},
            </if>
            <if test="entrydate != null">
                entrydate = #{entrydate},
            </if>
            <if test="deptId != null">
                dept_id = #{deptId},
            </if>
            <if test="updateTime != null">
                update_time = #{updateTime}
            </if>
        </set>
        where id = #{id}
    </update>
</mapper>
```

==注意==在empServiceImp中还应设置updateTime，对于这一点一定要注意，只要涉及改动就要默认更新updateTime，添加员工时还需要注意设置creteTime。



#### 阿里云OSS

可以创建一个util类，当然，不要忘记@component。

要提前购买和开通oss服务，创建一个bucket，这里有四个关键信息需要保存：

```java
	private String endpoint = "https://oss-cn-wuhan-lr.aliyuncs.com"; --->对应着外网访问的endpoint
    private String accessKeyId = "xxx";
    private String accessKeySecret = "xxx";
    private String bucketName = "xxx";
```

然后再根据官方给出的示例程序，修改这四个信息即可：

```java
@Component
public class AliOSSUtils {
    private String endpoint = "https://oss-cn-wuhan-lr.aliyuncs.com";
    private String accessKeyId = "xxx";
    private String accessKeySecret = "xxx";
    private String bucketName = "web-framework01";

    /**
     * 实现上传图片到OSS
     */
    public String upload(MultipartFile multipartFile) throws IOException {
        // 获取上传的文件的输入流
        InputStream inputStream = multipartFile.getInputStream();

        // 避免文件覆盖
        String originalFilename = multipartFile.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));

        //上传文件到 OSS
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        ossClient.putObject(bucketName, fileName, inputStream);

        //文件访问路径
        String url = endpoint.split("//")[0] + "//" + bucketName + "." + endpoint.split("//")[1] + "/" + fileName;

        // 关闭ossClient
        ossClient.shutdown();
        return url;// 把上传到oss的路径返回
    }
}
```

### 配置文件

若在项目中每涉及到一个第三方技术服务，就将其参数硬编码，那参数变化时要动源码，这是要避免的。难以寻找而且很不优雅。

#### 参数配置化

```properties
#自定义的阿里云OSS配置信息
aliyun.oss.endpoint=https://oss-cn-wuhan-lr.aliyuncs.com
aliyun.oss.accessKeyId=xxxxxx
aliyun.oss.accessKeySecret=xxxxxx
aliyun.oss.bucketName=springbear-instance1
```

```java
@Component
public class AliOSSUtils {

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;
    
    @Value("${aliyun.oss.accessKeyId}")
    private String accessKeyId;
    
    @Value("${aliyun.oss.accessKeySecret}")
    private String accessKeySecret;
    
    @Value("${aliyun.oss.bucketName}")
    private String bucketName;
 	
 	//省略其他代码...
 } 
```

#### yml

```properties
server.port=8080
server.address=127.0.0.1
=>
server:
  port: 8080
  address: 127.0.0.1 #注意数据和属性之间的空格！！
```

可以看到配置同样的数据信息，yml格式的数据有以下特点：

- 容易阅读
- 容易与脚本语言交互
- 以数据为核心，重数据轻格式

yml配置文件的基本语法：

>- 大小写敏感
>- 数值前边必须有空格，作为分隔符
>- 使用缩进表示层级关系，缩进时，不允许使用Tab键，只能用空格（idea中会自动将Tab转换为空格）
>- 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
>- `#`表示注释，从这个字符一直到行尾，都会被解析器忽略

yml文件中常见的数据格式：

对象/Map集合

```yml
user:
  name: zhangsan
  age: 18
  password: 123456
```

数组/List/Set集合

```yml
hobby: 
  - java
  - game
  - sport
```

```yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/tlias
    username: root
    password: 1234
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB
      
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
	
aliyun:
  oss:
    endpoint: https://oss-cn-hangzhou.aliyuncs.com
    accessKeyId: <your-access-key-id>
    accessKeySecret: <your-access-key-secret>
    bucketName: web-397
```

#### @ConfigurationProperties

对于@value注解，当处理成批的配置文件属性时会很臃肿；可以通过@ConfigurationProperties注解来优化：

首先要在maven中引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</dependency>
```

1. 需要创建一个实现类xxxProperties来专门存放这些配置信息，且实体类中的属性名和配置文件当中key的名字必须要一致

   > 比如：配置文件当中叫endpoints，实体类当中的属性也得叫endpoints，另外实体类当中的属性还需要提供 getter / setter方法

2. 需要将实体类交给Spring的IOC容器管理，成为IOC容器当中的bean对象

3. 在实体类上添加`@ConfigurationProperties`注解，并通过perfix属性来指定配置参数项的前缀

```java
//AliOSSProperties.java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/*阿里云OSS相关配置*/
@Data
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliOSSProperties {
    //区域
    private String endpoint;
    //身份ID
    private String accessKeyId ;
    //身份密钥
    private String accessKeySecret ;
    //存储空间
    private String bucketName;
}
```

最终完成的AliOSSUtils工具类：

```java
@Component //当前类对象由Spring创建和管理
public class AliOSSUtils {

    //注入配置参数实体类对象
    @Autowired
    private AliOSSProperties aliOSSProperties;----------->把原来的各种属性改成了专门存储属性的类
   
    /**
     * 实现上传图片到OSS
     */
    public String upload(MultipartFile multipartFile) throws IOException {
        // 获取上传的文件的输入流
        InputStream inputStream = multipartFile.getInputStream();

        // 避免文件覆盖
        String originalFilename = multipartFile.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));

        //上传文件到 OSS
        OSS ossClient = new OSSClientBuilder().build(aliOSSProperties.getEndpoint(),
                aliOSSProperties.getAccessKeyId(), aliOSSProperties.getAccessKeySecret());
        ossClient.putObject(aliOSSProperties.getBucketName(), fileName, inputStream);

        //文件访问路径
        String url =aliOSSProperties.getEndpoint().split("//")[0] + "//" + aliOSSProperties.getBucketName() + "." + aliOSSProperties.getEndpoint().split("//")[1] + "/" + fileName;

        // 关闭ossClient
        ossClient.shutdown();
        return url;// 把上传到oss的路径返回
    }
}
```

#### 环境变量

还可以通过设置环境变量来完成配置文件的处理。环境变量是在操作系统级别设置的全局变量。它们包含有关操作系统和正在运行的应用程序的信息。应用程序可以读取环境变量以获取配置参数。在大多数操作系统中，可以使用特定的命令来设置和获取环境变量。例如，在Linux和Mac上，可以使用`export`命令设置环境变量，如下所示：

```
export MY_VAR=value
```

应用程序可以通过读取`MY_VAR`环境变量来获取值。

> 关于配置文件的处理，无非是从程序的可维护性和安全性出发的。~~非常好程序，这使我的屁股旋转。~~

### 登录功能

根据需求：在访问网站时，如果没有登录，则不能进入子路径url，这一点通过==过滤器或拦截器==来完成，也就是需要对除了/login路径外的其他访问，在访问前进行拦截验证，如果已经登录了，则可以完成api的请求，否则不提供服务，为了识别是否登录过了，这一点通过==会话跟踪==来完成。因此,“登录”不能仅仅只是执行一个查询检验那么简单。

#### 会话跟踪

关于会话、会话跟踪，需要知道：

==会话==指的是浏览器与服务器之间的一次连接，我们就称为一次会话。

> 在用户打开浏览器第一次访问服务器的时候，这个会话就建立了，直到有任何一方断开连接，此时会话就结束了。在一次会话当中，是可以包含多次请求和响应的。
>
> 比如：打开了浏览器来访问web服务器上的资源（浏览器不能关闭、服务器不能断开）
>
> - 第1次：访问的是登录的接口，完成登录操作
>
>   
>
> - `会话`:在用户打开浏览器第一次访问服务器的时候，这个会话就建立了，直到有任何一方断开连接，此时会话就结束了。在一次会话当中，是可以包含多次请求和响应的。
>
>   比如：打开了浏览器来访问web服务器上的资源（浏览器不能关闭、服务器不能断开）
>
> - 第1次：访问的是登录的接口，完成登录操作
>
> - 第2次：访问的是部门管理接口，查询所有部门数据
>
> - 第3次：访问的是员工管理接口，查询员工数据
>
> 只要浏览器和服务器都没有关闭，以上3次请求都属于一次会话当中完成的。

==会话跟踪==：一种维护浏览器状态的方法，服务器需要识别多次请求是否来自于同一浏览器，以便在同一次会话的多次请求间共享数据。

> 服务器会接收很多的请求，但是服务器是需要识别出这些请求是不是同一个浏览器发出来的。比如：1和2这两个请求是不是同一个浏览器发出来的，3和5这两个请求不是同一个浏览器发出来的。如果是同一个浏览器发出来的，就说明是同一个会话。如果是不同的浏览器发出来的，就说明是不同的会话。而识别多次请求是否来自于同一浏览器的过程，我就称为会话跟踪。

使用会话跟踪技术就是要完成在同一个会话中多个请求之间数据的共享。

> 为什么要共享数据呢？
>
> 由于HTTP是无状态协议，在后面请求中怎么拿到前一次请求生成的数据呢？此时就需要在一次会话的多次请求之间进行数据共享

题外话：有没有想过在刷微博或者其他客户端软件时，你所看到的表象是你的账号会显示你所个性化的内容，而别人的账号显示的是别人的个性化内容（关注，粉丝等等等），这都是数据，根据你的ID，这些数据都已存入相应的表中了，根据你的id唯一标识，将这些绑定着id的个性化内容全部连根拔起显示给你。有没有想过为什么网页版会保持登录状态，这个就是会话跟踪技术实现的，他会在一定期限内保留住登录状态。

可以通过JWT,cookie,session来实现会话跟踪。

##### JWT

json web token（官网：https://jwt.io/）

- 定义了一种简洁的、自包含的格式，用于在通信双方以json数据格式安全的传输信息。由于数字签名的存在，这些信息是可靠的。

  > 简洁：是指jwt就是一个简单的字符串。可以在请求参数或者是请求头当中直接传递。
  >
  > 自包含：指的是jwt令牌，看似是一个随机的字符串，但是可以根据自身的需求在jwt令牌中存储自定义的数据内容。如：可以直接在jwt令牌中存储用户的相关信息。
  >
  > 简单来讲，jwt就是将原始的json数据格式进行了安全的封装，这样就可以直接基于jwt在通信双方安全的进行信息传输了。

JWT的组成： （JWT令牌由三个部分组成，三个部分之间用点来分割）

- 第一部分：Header(头）， 记录令牌类型、签名算法等。 例如：{"alg":"HS256","type":"JWT"}

- 第二部分：Payload(有效载荷），携带一些自定义信息、默认信息等。 例如：{"id":"1","username":"Tom"}

- 第三部分：Signature(签名），防止Token被篡改、确保安全性。将header、payload，并加入指定秘钥，通过指定签名算法计算而来。

  > 签名的目的就是为了防jwt令牌被篡改，而正是因为jwt令牌最后一个部分数字签名的存在，整个jwt令牌是非常安全可靠的。一旦jwt令牌当中任何一个部分、任何一个字符被篡改了，整个令牌在校验的时候都会失败。

JWT是如何将原始的JSON格式数据，转变为字符串的呢？

在生成JWT令牌时，会对JSON格式的数据进行一次编码————base64编码

Base64：是一种基于64个可打印的字符来表示二进制数据的编码方式。既然能编码，那也就意味着也能解码。所使用的64个字符分别是A到Z、a到z、 0- 9，一个加号，一个斜杠，加起来就是64个字符。任何数据经过base64编码之后，最终就会通过这64个字符来表示。当然还有一个符号，那就是等号。等号它是一个补位的符号

需要注意的是Base64是编码方式，而不是加密方式。

JWT令牌最典型的应用场景就是登录认证：

1. 在浏览器发起请求来执行登录操作，此时会访问登录的接口，如果登录成功之后，我们需要生成一个jwt令牌，将生成的 jwt令牌返回给前端。
2. 前端拿到jwt令牌之后，会将jwt令牌存储(浏览器localStorage)起来。在后续的每一次请求中都会将jwt令牌携带到服务端。
3. 服务端统一拦截请求之后，先来判断一下这次请求有没有把令牌带过来，如果没有带过来，直接拒绝访问，如果带过来了，还要校验一下令牌是否是有效。如果有效，就直接放行进行请求的处理。

在JWT登录认证的场景中我们发现，整个流程当中涉及到两步操作：

1. 在登录成功之后，要生成令牌。
2. 每一次请求当中，要接收令牌并对令牌进行校验。

为此定义一个工具类JWTutil。

当然，首先要引入依赖

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```

JWTutil：

~~~java
public class JWTutil {
    private static String signKey="springbear";
    //有效期30天
    private static Long expire = 1000*3600*24*30L;
    public static String genJWT(Map<String,Object> claims){
        String jwt= Jwts.builder()
                .addClaims(claims)    //自定义消息--有效载荷---有效载荷中存放什么数据也要和前端沟通好。这个项目中是id username 和 name
                .signWith(SignatureAlgorithm.HS256, signKey)    //签名算法
                .setExpiration(new Date(System.currentTimeMillis()+expire))
                .compact();
        return jwt;
    }
    public static Claims parseJWT(String jwt){
        Claims claims=Jwts.parser()
                .setSigningKey(signKey)
                .parseClaimsJws(jwt)
                .getBody();
        return claims;
    }
~~~

在使用JWT令牌时需要注意：

- JWT校验时使用的签名秘钥，必须和生成JWT令牌时使用的秘钥是配套的。
- 如果JWT令牌解析校验时报错，则说明 JWT令牌被篡改 或 失效了，令牌非法。 

因此登录功能的实现又清晰了：登录成功则生成token，执行业务则校验token，若非法，则拦截，合法就放行。

具体在项目中：前端请求登录，先验证账密是否合法（select），如果登陆成功了，就生成JWT，并将其返回，并且这使得用户在一定时间段内（token有效期间且没有清理浏览器localstorage）不必重复进行登录验证。

登录功能：

```java
@RestController
@Slf4j
public class LoginController {
    @Autowired
    private empService empService;
    
    @PostMapping("/login")
    public Result loginTry(@RequestBody Emp emp){
        Emp empExist=empService.loginTry(emp);
        if(empExist!=null){
            log.info("登陆成功");
            Map<String,Object> claims=new HashMap<>();
            claims.put("id",empExist.getId());
            claims.put("username",empExist.getUsername());
            claims.put("name",empExist.getName());
            //假如登录成功，生成token（一个能被唯一转化的字符串）返回给前端，前端将会获取它并存储。
            //在此后的操作，前端都会携带这个token来进行操作，只要token还在有效期，就能够放行，否则被拦截器拦截。
            String token=JWTutil.genJWT(claims);
            return Result.success(token);
        }
        return Result.error("登录失败");
    }
}
```

##### cookie

cookie是客户端会话跟踪技术，存储在客户端浏览器中。用cookie来跟踪会话，可以在浏览器第一次发起服务器请求时，在服务器端来设置一个cookie。

比如第一次请求了登录接口，登录接口执行完成之后，就可以设置一个cookie，在cookie中就可以来存储用户相关的数据信息。比如在cookie中存储当前登录用户的用户名，ID。

服务器端给客户端响应数据时会**自动**将cookie响应给浏览器，浏览器接收到此cookie后，会**自动**将cookie的值存储在浏览器本地。接下来在后续的每一次请求当中，都会将浏览器本地所存储的cookie**自动**地携带到服务端。

接下来服务端就可以获取到cookie的值。因此只需要判断这个cookie的值是否存在，如果不存在这个cookie，就说明客户端之前是没有访问登录接口的；如果存在，就说明客户端之前已经登录完成了。这样就可以基于cookie在同一次会话的不同请求之间来共享数据。

3个自动：

- 服务器**自动**将cookie响应给浏览器。
- 浏览器接收到响应回来的数据之后，**自动**将cookie存储在浏览器本地。
- 在后续的请求当中，浏览器会**自动**将cookie携带到服务器端。

**为什么这一切都是自动化进行的？**

因为cookie是HTTP协议中所支持的技术，而各大浏览器厂商都支持了这一标准。协议官方给我们提供了一个响应头和请求头：

- 响应头 Set-Cookie ：设置Cookie数据
- 请求头 Cookie：携带Cookie数据

**优缺点**

- 优点：HTTP协议中支持的技术（像Set-Cookie 响应头的解析以及 Cookie 请求头数据的携带都由浏览器自动进行，无需手动操作）
- 缺点：
  - 移动端APP(Android、IOS)中无法使用Cookie
  - 不安全，用户可以自己禁用Cookie
  - Cookie不能跨域

##### session

服务器端会话跟踪技术，存储在服务器端的。Session就是基于Cookie来实现的

**优缺点**

- 优点：Session是存储在服务端的，安全
- 缺点：
  - 服务器集群环境下无法直接使用Session
  - 移动端APP(Android、IOS)中无法使用Cookie
  - 用户可以自己禁用Cookie
  - Cookie不能跨域

> PS：Session 底层是基于Cookie实现的会话跟踪，如果Cookie不可用，则该方案也就失效了。

#### 拦截器

##### 简介

什么是拦截器？

- 是一种动态拦截方法调用的机制，类似于过滤器。
- 拦截器是Spring框架中提供的，用来动态拦截控制器方法的执行。

拦截器的作用：

- 拦截请求，在指定方法调用前后，根据业务需要执行预先设定的代码。

在拦截器中通常做一些通用性操作，比如：通过拦截器来拦截前端发起的请求，将登录校验的逻辑全部编写在拦截器当中。在校验的过程当中，如发现用户登录了(携带JWT令牌且是合法令牌)，就可以直接放行，去访问spring当中的资源。如果校验时发现并没有登录或是非法令牌，就可以直接给前端响应未登录的错误信息。

##### 拦截路径

在注册拦截器时要指定拦截器的拦截路径，通过`addPathPatterns("要拦截路径")`指定要拦截的请求路径，`excludePathPatterns`指定不拦截的请求路径。

~~~java
@Configuration  
public class WebConfig implements WebMvcConfigurer {
    //拦截器对象
    @Autowired
    private LoginCheckInterceptor loginCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //注册自定义拦截器对象
        registry.addInterceptor(loginCheckInterceptor)
                .addPathPatterns("/**")//设置拦截器拦截的请求路径（ /** 表示拦截所有请求）
                .excludePathPatterns("/login");//设置不拦截的请求路径
    }
}
~~~

在拦截器中除了可以设置`/**`拦截所有资源外，还有一些常见拦截路径设置：

| 拦截路径  | 含义                 | 举例                                                |
| --------- | -------------------- | --------------------------------------------------- |
| /*        | 一级路径             | 能匹配/depts，/emps，/login，不能匹配 /depts/1      |
| /**       | 任意级路径           | 能匹配/depts，/depts/1，/depts/1/2                  |
| /depts/*  | /depts下的一级路径   | 能匹配/depts/1，不能匹配/depts/1/2，/depts          |
| /depts/** | /depts下的任意级路径 | 能匹配/depts，/depts/1，/depts/1/2，不能匹配/emps/1 |

##### 基本使用

基本使用主要包括：定义拦截器，注册拦截器。

定义拦截器：一个项目中可能有多个拦截器，不妨建立一个拦截器包，对于登录功能中的拦截，定义LoginInterceptor类,(别忘了@component),该类需要实现HandlerInterceptor，并重写其三个方法，特别是prehandle这一方法，他决定着能否放行，因此jwt的验证也在此方法中。

```java
@Component
@Slf4j
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token=request.getHeader("token");
        if(token==null){
            //设置返回消息并转json
            Result result=Result.error("NOT_LOGIN");
            String json = JSONObject.toJSONString(result);
            //设置响应头（告知浏览器：响应的数据类型为json、响应的数据编码表为utf-8）
            response.setContentType("application/json;charset=utf-8");
            //响应
            response.getWriter().write(json);
            return false;
        }
        //若存在 则验证合法性
        try {
            JWTutil.parseJWT(token);
        } catch (Exception e){
            log.info("非法token");
            //设置返回消息并转json
            Result result=Result.error("NOT_LOGIN");
            String json = JSONObject.toJSONString(result);
            //设置响应头（告知浏览器：响应的数据类型为json、响应的数据编码表为utf-8）
            response.setContentType("application/json;charset=utf-8");
            //响应
            response.getWriter().write(json);
            return false;
        }
        return true;
    }
}
/*分析此实例的流程：
* 1. 登录页面不拦截，其他页面拦截，这一点在注册拦截器时控制拦截路径实现。
* 2. 其他路径的资源请求，需要携带token(位于请求头中)来若不存在则拒绝并返回相应的信息(json)，若存在则进行验证，合法则放行，否则拒绝并返回相应信息。
* 注：为了实现object到json的转换，可以导入阿里的fastjson依赖
* 注：返回的erro信息也是有讲究的，不能瞎写，前端需要根据erro中的信息来重定向或者进行其他操作的。比如这里是not_longin,前端获取到就会执行重定向到登录页面
* */
```

注册拦截器：定义一个类WebConfig，该类需要实现webMvcConfigurer，该类中需要重写addInterceptor方法，也是在此类中完成注册拦截器和拦截路径的设置。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login");
        //为除了登录页外的其他页面注册拦截器。
    }
}
```

#### 登录业务

再次梳理登录业务：登录时，根据账密判断登录是否成功（select），成功则返回token和成功消息（jwt），否则返回错误信息，在token有效期内，该浏览器中的路径访问不会被阻拦（interceptor放行）。

![](https://s3.bmp.ovh/imgs/2023/11/20/b18f88897cc0af29.png)



### 异常处理

项目编写到这里，以为已经OK了？？实际上忽略了异常处理这一点，因此下次在设计项目时，可以提前考虑。

当添加部门或者员工时，如果客户端输入的重名了，而数据库又不能完成插入语句，如果没有异常处理，那么前后端将无法完成相应的错误操作，而用户也最好能够得到对应的解释或者哪怕只是简短的提示，也可以通过异常处理来实现，捕获异常后，后端向前端返回额外的消息，前端再经过处理提示给用户。

异常处理很简单，在每一处可能会出现异常的地方都try catch显然太杂乱臃肿。因此可以定义一个类，专门处理异常，即：全局异常处理器。

1. 定义全局异常处理器非常简单，定义一个类，为此类加上@RestControllerAdvice，加上这个注解就代表定义了一个全局异常处理器。

2. 在类中定义一个方法来捕获异常，此方法需要加注解@ExceptionHandler。通过@ExceptionHandler注解当中的value属性来指定要捕获异常的类型。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    //处理异常
    @ExceptionHandler(Exception.class) //指定能够处理的异常类型
    public Result ex(Exception e){
        e.printStackTrace();//打印堆栈中的异常信息
        //捕获到异常之后，响应一个标准的Result
        return Result.error("对不起,操作失败,请联系管理员");
    }
}
```

> @RestControllerAdvice = @ControllerAdvice + @ResponseBody
>
> 处理异常的方法返回值会转换为json后再响应给前端















