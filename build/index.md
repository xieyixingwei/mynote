


# wiki #

```
---
***
---
___
```


```
# 一级标题  
## 二级标题  
### 三级标题  
#### 四级标题  
##### 五级标题  
###### 六级标题 
```

<script>
function myFunction(){
    var x = document.getElementById("uname");
    x.value = x.value.toUpperCase();
}
</script>

<input type="text" id="uname" onchange="myFunction()">

<p id="pt">使用纯javasript将markdown文件转为html。</p>

<style id="style:css/mycss.css">

#pt {
    color: red;
}
</style>


``` css
p { color: red }
```


<script>
    console.log('wolrd');
</script>

this a code example.

``` javascript
var test = function() {

}
```
```
outputing
```
above output.

## 1. 基础语法

### 1.1 块级元素

- 标题


- 段落
- 图片

### 1.2 行内元素

1. 加粗
    - 一级加粗
    - 二级加粗
        1. 细加粗
        2. 很加粗
    - time

2. 斜体
3. 下划线

## 2. 扩展语法

`$`

- 包含其它markdown

[include](./include.md)
[include](./include1.md)
