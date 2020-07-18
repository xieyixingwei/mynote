# MyNote Manual #

# 1. 简介

`mynote.html`是使用纯javascrit+html+css实现的一个笔记网页查看工具。mynote自动将markdown格式的文本转为html。

# 2. mynote的使用

在开始使用mynote之前，你需要对浏览器进行设置。


mynote.html
css
html
docker
sql
makefile
markdown
matlab
tcl
swift
objective-c
verilog
VHDL
perl
php
yaml
git
go
yaml
c-lick
javascript
python
qml
java
regex
bash+shell
json
java
ruby
rust
C
C#
C++
Cmake

``` html
<p>title</p>
<ul>
    <li>item</li>
</ul>
```

``` css
p { color: red }
```

``` javascript
var test = function() {

}
```

``` c
void main()
{
    int i = 0;
    for(i = 0; i < 10; i++)
    {

    }
}
```

``` Python
def countdown(start):
    n = start

    def diaplay():
        print('T-minus %d' % n)

    while n > 0:
        display()
        n -= 1
```

``` sql
SELECT * FROM students WHERE score >= 80 AND gender = 'M';
```

``` verilog
module test
    (
    input  wire clk,
    input  wire rst_n,
    output wire led
    );

reg [7:0] count;

always@(posedge clk or negedge rst_n)
begin
    if(!rst_n)
        count <= 8'h0;
    else 
        count <= count + 8'h1;
end

assign led = count[7];

endmodule
```

``` makefile
first_second = Hello      
a = first      
b = second      
c = $($a_$b)　　　    

all:      
    @echo $(c) 
```

``` bash
stra=abcd

if [[ "${stra}" =~ "bc" ]]; then
    echo contain
else
    echo no contain
fi
```

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





<script>
    console.log('wolrd');
</script>

this a code example.


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

[C++](./include.md)
[include](./include1.md)
