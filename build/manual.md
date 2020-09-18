# MyNote Manual #

# 1. 简介

`mynote.html`是使用纯`javascrit+html+css`实现的一个笔记网页查看工具。`mynote`自动将`markdown`格式的文本转为`html`。

`markdown`文件以`.md`作为后缀名。

# 2. mynote的使用

在开始使用mynote之前，你需要对浏览器进行设置。

chrome浏览器
===

为chrome浏览器创建一个快捷方式，右键点击chrome.exe，选择“创建快捷方式”或者“发送到”→“桌面快捷方式”），右键点击快捷方式，选择属性。 然后将`--enable-webgl --ignore-gpu-blacklist --allow-file-access-from-files`参数加到目标后，注意`exe`后面一定要加空格。

- 各个参数的含义是：
    - `--enable-webgl`: 表示开启`WebGL`支持。
    - `--ignore-gpu-blacklist`: 表示忽略`GPU`黑名单，也就是说有一些显卡`GPU`因为过于陈旧等原因，不建议运行`WebGL`，这个参数可以让浏览器忽略这个黑名单，强制运行`WebGL`。
    - `--allow-file-access-from-files`: 表示允许从本地载入资源。

Ok，以后都以这个快捷方式启动，你就能够加载本地资源了。

mynote加载markdown文件
===

使用浏览器打开`mynote.html`时，`mynote.html`会自动在同级目录下寻找名为`index.md`的markdown文件。也就是说`index.md`始终是主页。

# 3. mynote 语法

## 3.1 注释 

```
<!-- 注释是给自己看的，预览时也不会出现，当然发布出去别人也不会看见 -->
```

## 3.2 目录标题

使用`#`将目录的标题括起来，目录的标题一般位于文档的最前面，例如`# mynote使用手册 #`。

## 3.3 标题

- 总共有1到6级标题，使用1个井号`#`定义一级标题，2个井号`##`定义二级标题，以此类推，6个井号`######`定义六级标题。例如：

```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

提示：`mynote`会自动在页面左侧根据标题生成目录。

## 3.4 目录

`mynote`会自动在页面左侧根据标题生成目录。

## 3.5 标头

在文本下方使用3个等号`===`表明这是一个标头。

例如：

```
标头文本
===
```

的效果如下：

标头文本
===

## 3.6 段落和换行

一个`mynote`段落是由一个或多个连续的文本行组成，它的前后要有一个以上的空行（空行的定义是显示上看起来像是空的，便会被视为空行。比方说，若某一行只包含空格和制表符，则该行也会被视为空行）。

mynote允许段落内的强迫换行（插入换行符），实现换行的方式是：在需要换行的地方，使用HTML的`<br />`实现。

## 3.7 强调

- 斜体字使用单个星号`*`将文本括起来，例如`*这是斜体字*`的效果为：*这是斜体字*。
- 斜体字使用2个星号`**`将文本括起来，例如`**这是加粗字**`的效果为：**这是加粗字**。
- 删除线使用2个波浪号`~~`将文本括起来，例如`~~加上删除线~~`的效果为：~~加上删除线~~。

## 3.8 分隔线

在单独一行使用三个以上的`*`或者`-`或者`_`来定义一个分隔线，行内不能有其他东西。

例如：

```
---
```

的效果如下：

---

## 3.9 注意和提示

1. `注意`使用`note`或者`注意`开头。

例如：
```
note:这是一个例外。
```

的效果如下：

note:这是一个例外。

或者：

```
注意:这是一个例外。
```

的效果如下：

注意:这是一个例外。

2. `提示`使用`tip`或者`提示`开头。

例如：
```
tip:请使用mynote。
```

的效果如下：

tip:请使用mynote。

或者：
```
提示:请使用mynote。
```
的效果如下：
提示:请使用mynote。

## 3.10 区块引用

区块引用使用`>`开头。如果你想对某个部分做的内容做一些说明或者引用某某的话等，可以用区块引用。

例如：

```
不以结婚为目的的谈恋爱都叫耍流氓！ 
> 这是毛主席说的。

前方高能！
> 注意：这里是为了提醒前面有很刺激的事情发生，
请做好准备。
```

的效果为：

不以结婚为目的的谈恋爱都叫耍流氓！ 
> 这是毛主席说的。

前方高能！
> 注意：这里是为了提醒前面有很刺激的事情发生，
请做好准备。

## 3.11 列表

### 3.11.1 无序列表

无序列表使用`*`或者`-`或者`+`作为列表标记，使用空格缩进实现多级无序列表。

注意：列表前后至少有一个空行。

例如：

```
* a
  * aa
    * aaa
      * aaaa
      * aaab
    * aab
    * aac
  * ab
    * aba
      * abaa
        * abaaa
      * abab

* a
  * aa
  * ab
* b
  * bb
```

的效果为：

* a
  * aa
    * aaa
      * aaaa
      * aaab
    * aab
    * aac
  * ab
    * aba
      * abaa
        * abaaa
      * abab

* a
  * aa
  * ab
* b
  * bb

### 3.11.2 有序列表

有序列表使用数字或者字母加英文句点.来表示，使用空格缩进实现多级无序列表。

注意：列表前后至少有一个空行。

例如：

```
1. a
    1. aa
    2. ab
2. b
3. c
```

的效果为：

1. a
    1. aa
    2. ab
2. b
3. c

### 3.11.3 无序列表和有序列表混用

同样使用空格缩进来实现多级列表。

注意：列表前后至少有一个空行。

例如：

```
- a
    - aa
        1. aaa
        2. aab
            - aaba
            - aabb
        3. aac
    - ab
    - ac
- b
    - ba
    - bb
- c
```

的效果为：

- a
    - aa
        1. aaa
        2. aab
            - aaba
            - aabb
        3. aac
- b
    - ba
    - bb
- c

## 3.12 表格

使用符号`|`分隔表格的单元格，使用`:--`定义表格内容左对齐，`:--:`定义表格内容居中对齐，`--:`定义表格内容右对齐。

注意：定义表格需要另起一行。
提示：如果要在单元格内插入`|`号，可以使用`\\|`。

例如：

```
name | age | sex
:-- | :--: | --:
tony liu | 20 | 男
lucy | 18 | 女
```

的效果为：

name | age | sex
:-- | :--: | --:
tony liu | 20 | 男
lucy | 18 | 女

## 3.13 插入图片

使用`![文本](图片网址或图片文件名)`格式插入一幅图片，如果小括号内是图片的网络地址，则插入的是网络图片；也可以插入本地图片，如果要插入本地图片，则小括号内的应该是本地图片的路径（相对于当前页面的相对路径）和图片的文件名。

可以在中括号`[]`内使用`width`定义图片的宽度， `heigh`定义图片的高度，`align`定义图片的对齐方式。`width`和`heigh`的单位使用`px`（像素），`align`有3个可选值（left:左对其，right:右对齐，center:居中对其，默认是居中对齐）例如：
`![width:400px;heigh:300px;align:center](../temp/ko.png)`。

- 注意：`![文本](图片网址或图片文件名)`应该单独位于一行。

例如插入一张网络图片：

```
![插入网络图片](https://www.cnblogs.com/images/logo_small.gif)
```

的效果为：

![插入网络图片](https://www.cnblogs.com/images/logo_small.gif)

  
  

例如插入一张本地图片(`juhua.jpeg`位于当前目录下的`images`目录下)：

```
![插入本地图片](./images/juhua.jpeg)
```

的效果为：

![插入本地图片](./images/juhua.jpeg)


- `.`表示当前目录，`..`表示上一级目录。

## 3.14 链接

使用`[显示文本](地址)`定义一个链接，可以定义一个网络链接（小括号内使用网络地址）；也可以定义一个本地链接（小括号内是一个相对路径和文件名）。

- 本地链接的一个非常有用的使用方式是链接到另外的`mynote`文件，这样就可以将非常多的`mynote`文件组织起来。

例如定义一个网络链接：

```
点击进入[百度](http://www.baidu.com)首页。
```

的效果为：

点击进入[百度](http://www.baidu.com)首页。

---

例如定义一个本地链接（当前目录下有一个`include2.md`文件）：

```
请[点击查看](./include2.md)文档。
```

的效果为：

请[点击查看](./include2.md)文档。

## 3.15 行内代码

可以用单反引号`\``（键盘上波良号`~`那个按键）包起来，例如`\`2=3+4\``的效果为：`2=3+4`。

- 如果要插入`\``号，可以使用`\\\``。

## 3.16 代码块

- 使用一对`\`\`\``将代码包裹起来，在第一个`\`\`\``后面可以跟上代码的类型，目前`mynote`支持的代码类型有：
    - C
    - C++
    - C#
    - python
    - java
    - objective-c
    - go
    - php
    - javascript
    - html
    - css
    - json
    - matlab
    - regex
    - makefile
    - bash
    - shell
    - swift
    - verilog
    - vhdl
    - ruby
    - rust
    - cmake
    - sql
    - yaml
    - qml
    - markdown
    - docker
    - tcl
    - perl
    - yaml
    - git
    - c-lick

例如：

C语言代码块：
===

```
\`\`\` c
int main(int argc, char** argv)
{
    printf("hello world");

    while(1)
    {
        ;
    }

    return 0;
}
\`\`\`
```

的效果为：

``` c
int main(int argc, char** argv)
{
    printf("hello world");

    while(1)
    {
        ;
    }

    return 0;
}
```

同样的可以定义C++语言代码块：

```
\`\`\` c++
void main()
{
    int i = 0;
    for(i = 0; i < 10; i++)
    {

    }
}
\`\`\`
```

的效果为：

``` c++
void main()
{
    int i = 0;
    for(i = 0; i < 10; i++)
    {

    }
}
```

Python语言代码块：
===

``` python
def countdown(start):
    n = start

    def diaplay():
        print('T-minus %d' % n)

    while n > 0:
        display()
        n -= 1
```

Makefile代码块：
===

``` makefile
first_second = Hello      
a = first      
b = second      
c = $($a_$b)　　　    

all:      
    @echo $(c) 
```

Bash/Shell代码块：
===

``` bash
stra=abcd

if [[ "${stra}" =~ "bc" ]]; then
    echo contain
else
    echo no contain
fi
```

Javascript代码块：
===

``` javascript
var test = function() {
    console.log('hello world');
}
```

HTML代码块：
===

``` html
<p>t
`itle</p>
<ul>
    <li>item</li>
</ul>
```

CSS代码块：
===

``` css
p { color: red }
```

SQL代码块：
===

``` sql
SELECT * FROM students WHERE score >= 80 AND gender = 'M';
```

Verilog代码块：
===

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

## 3.17 include其它mynote文件

可以使用`[include](相对路径和文件名)`将别的文件包含进当前文件的当前位置。

- `include`非常有用，例如，当一个`mynote`文件太大的时候，可以将一个大的文件拆分为多个文件，然后通过`[include](相对路径和文件名)`将几个文件包含进顶层文件。
- 小括号内的文件名应该包含相对于当前页面所在目录的相对路径，`.`表示当前目录，`..`表示上一级目录。
- `[include](相对路径和文件名)`应该位于单独一行。

例如：（`include2.md`位于当前页面所在目录）

```
[include] (./include2.md)
```

的效果如下：

[include](./include2.md)


## 3.18 上下标

- 上标

```
2[^7] - 2[^7] - 1
```

2[^7] - 2[^7] - 1

- 下标

```
H[v2]O
```

H[v2]O

## 3.19 特殊符号

- 星号 `\\\*`

# 4. 使用mynote和github搭建自己的在线wiki

首先参见[建立github.io page](https://guides.github.com/features/pages/)建议一个github.io仓库。然后将`mynote.html`重命名为`index.html`上传到新建的仓库中。同时将`index.md`和其它`*.md`文档上传到新建的仓库中。然后只需要访问`https://你的github账号.github.io/新建仓库的名字`就可以了。
