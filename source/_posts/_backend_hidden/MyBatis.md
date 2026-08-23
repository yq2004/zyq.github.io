---
title: Mybatis基础
date: {{date}}
tags:
- 后端
- MyBatis
categories:
- [后端, MyBatis]
---



# MyBatis

## Config

### construction

创建spring项目，添加项目依赖，选择SQL大选项，选择里面的mybatis framework和mysql driver

### properties

在application.properties中添加数据库四大件和必要的配置：日志显示和自动处理命名风格

```properties
spring.datasource.password=zyq2004zyq
spring.datasource.username=root
spring.datasource.url=jdbc:mysql://localhost:3306/mybatisstudy
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

#mybatis log:mybatislog-impl std
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl

#camel :mybatis naming map
mybatis.configuration.map-underscore-to-camel-case=true
```

### plugins

安装mybatisX插件

### structure

根据分层解耦，创建mapper包，并创建mapper接口添加mapper注释

```java
@Mapper
public interface EmpMapper
```

创建实体类以及其所在的包pojo，可以利用lombok方便生成其构造方法 getter setter tostring等基本方法,使用前需要在pom.xml中添加依赖,其实也可以不这么做，直接在创建项目时就勾选开发依赖lombok，其实这两种方法没什么本质区别，熟练后直接在创建的时候添加就好了。	

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Emp
```

***

> 在mybatis中，主要以两种形式完成与数据库的信息交换，一种是映射注释的风格，另一种是XML文件的风格。对于简单的SQL语句，直接用映射的形式，对于复杂的SQL语句更建议用XML的形式

## Mapping

每种SQL语句都有其对应的注释。在mapper接口中添加public方法，对这个方法添加相应的注释，注释后的括号就是要执行的sql语句。

更多细节：为了方便在设计时不必取别名，必须始终严格遵守pojo类的属性与数据库中表的属性相同，下划线式转驼峰即可。因此对于涉及到多个属性的SQL语句，可以直接用对象的形式封存，mybatis自动完成了存取，你只需要保持一切都能对应上即可。

1. 通过参数进行SQL语句的执行是必不可少的，比如删除某个id为xx的数据。因此这里涉及到传参，通过#{id}实现即可。另外还有￥{}

   ```java
   //#{}预编译 换成？ 用于参数传递
   //${} 直接拼接 存在sql注入问题 表名和列表动态设置时使用
   @Delete("delete from emp where id=#{id  }")
   public void delete(Integer id);
   ```

2. 执行某些sql语句后，时常需要返回他的主键，进行更进一步的sql操作，***主键返回***：需要用到option注释

   ```java
   //主键返回
   //useGeneratedKeys获取生成的属性 赋予给keyProperty属性
   @Options(useGeneratedKeys = true,keyProperty = "id")
   @Insert("insert into emp(username,name,gender,image,job,entrydate,dept_id,create_time,update_time)"+
           "values(#{username},#{name},#{gender},#{image},#{job},#{entrydate},#{deptId},#{createTime},#{updateTime})")
   public void insert2(Emp emp);
   ```

3. 查询语句是有返回值的，只要为上述函数定义返回对应的类型即可，对于查询语句，一般是pojo类的集合：

   ```java
   @Select("select * from emp")
   public List<Emp> select();
   //above is in test
   @Test
       public void testMappingSelect(){
           List<Emp> empList=empMapper.select();
           System.out.println(empList);
       }
   ```

如果整个项目都这样写，特别是当SQL语句较复杂时，将不利于维护和编写，因此XML风格的写法是很重要的，而且XML风格能针对一些issue提供有效的solution。

***

## XML

### rule

在resource文件夹中新建与mapper相同名称路径的目录，建立时记得要==**用斜杠**==来一次性建立目录，不能用点，然后在此文件夹中创建与mapper接口相同名称的==xml==文件。然后写入基本的配置信息：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mbbasic.mapper.EmpMapper">
    <select id="sb" resultType="com.example.mbbasic.pojo.Emp">
    select * from emp
    </select>
</mapper>
```

在使用时，需要用mapper标签中的namespace属性来标记出对应的mapper接口路径，路径==包括接口本身==，并且，在执行对应的SQL语句时，需要在sql标签中的id属性设置与mapper接口中方法的同名，只有这样让程序才能能精准定位。对于又返回结果集的select语句，还需要添加resultType标签，并往里写入返回结果集基本元素的pojo类路径，==包括类本身==。

总结：有四大要素：

1. xml文件名和文件路径与mapper接口和mapper包路径对应；

2. mapper标签namespace属性与mapper接口路径对应；

3. sql语句id与mapper接口方法对应；

4. 对于查询语句，resultType与pojo类路径对应。

### CommonSQL

对于一般SQL，就是所有属性都能一一对应的比较死板的SQL。这样的SQL很基础，更多用到的是动态SQL，考虑一种情况，当你需要select实体集合时，你编写了sql语句，sql语句中的属性，有时是基于表项属性中的1个，2个，3个…而且还不知道是哪几个，要么你写很多组查询方法，这太麻烦了，肯定不回去考虑，要么你一次性写出基于多个属性的查询，但实际在用的时候你还是可能只基于其中的某一个或多个属性来查询，因此多余的属性将会以null参数的形式传入，这样你将无法得到你想要的结果。查询如此，更新等语句更是如此，要是有一种机制能够帮助你完成类似java中的不定参数函数的功能就会很方便：这就是动态SQL。

### DynamicSQL

动态SQL对以上issue的solution是提供更多封装好了功能的标签，你只要学会去使用，将思维深度转换为广度，将脑力转换为记忆，以此助人登阶，何其浪漫~

mybatis提供的标签：<if> <foreach> <where> <set> / <sql> <include>分别适用于不同场景，前组是‘关键字’，后两者是‘函数‘。

更方便的是，在mapper接口的方法的参数中，可以十分笼统地编写形参！

```java
@Mapper
public interface EmpMapper {
    public void deleteByIds(List<Integer> ids);
    public List<Emp> list(Emp emp);
    public void update(Emp emp);
}
```

必须多练才能牢固记忆。

```xml
<if test="条件表达式">
   要拼接的sql语句
</if>

<foreach collection="集合名称" item="集合遍历出来的元素/项" separator="每一次遍历使用的分隔符" 
         open="遍历开始前拼接的片段" close="遍历结束后拼接的片段">
</foreach>

------------------------------
实现delete from emp where id in (1,2,3);
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.EmpMapper">
    <!--删除操作-->
    <delete id="deleteByIds">
        delete from emp where id in
        <foreach collection="ids" item="id" separator="," open="(" close=")">
            #{id}
        </foreach>
    </delete>
</mapper>
------------------------------
实现不会出现and(单属性查询是不会出现and了 中间间隔的情况也会导致多余and的出现)或者where(select *是没有where字句的)干扰的查询
<where>只会在子元素有内容的情况下才插入where子句，而且会自动去除子句的开头的AND或OR
    
<select id="list" resultType="com.itheima.pojo.Emp">
        select * from emp
        <where>
             <!-- if做为where标签的子元素 -->
             <if test="name != null">
                 and name like concat('%',#{name},'%')
             </if>
             <if test="gender != null">
                 and gender = #{gender}
             </if>
             <if test="begin != null and end != null">
                 and entrydate between #{begin} and #{end}
             </if>
        </where>
        order by update_time desc
</select>
------------------------------
实现不会有逗号干扰的update操作，用set标签替换set语句
<set>：动态的在SQL语句中插入set关键字，并会删掉额外的逗号。（用于update语句中）
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.EmpMapper">

    <!--更新操作-->
    <update id="update">
        update emp
        <!-- 使用set标签，代替update语句中的set关键字 -->
        <set>
            <if test="username != null">
                username=#{username},
            </if>
            <if test="name != null">
                name=#{name},
            </if>
            <if test="gender != null">
                gender=#{gender},
            </if>
            <if test="image != null">
                image=#{image},
            </if>
            <if test="job != null">
                job=#{job},
            </if>
            <if test="entrydate != null">
                entrydate=#{entrydate},
            </if>
            <if test="deptId != null">
                dept_id=#{deptId},
            </if>
            <if test="updateTime != null">
                update_time=#{updateTime}
            </if>
        </set>
        where id=#{id}
    </update>
</mapper>
```

```xml
<sql id="commonSelect">
 	select id, username, password, name, gender, image, job, entrydate, dept_id, create_time, update_time from emp
</sql>

<include refid="commonSelect"/>

---------------------------------
<select id="list" resultType="com.itheima.pojo.Emp">
    <include refid="commonSelect"/>
    <where>
        <if test="name != null">
            name like concat('%',#{name},'%')
        </if>
        <if test="gender != null">
            and gender = #{gender}
        </if>
        <if test="begin != null and end != null">
            and entrydate between #{begin} and #{end}
        </if>
    </where>
    order by update_time desc
</select>
```

