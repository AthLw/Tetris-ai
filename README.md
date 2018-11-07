# Tetris Game

## 注意！ 实现ai需要安装node.js

> 1. 首先下载 [node](https://nodejs.org/zh-cn/download/)
> 2. 下载完成后可以按[此教程](http://www.runoob.com/nodejs/nodejs-install-setup.html)配置
> 3. 确定环境变量配置好后，进入websocket文件夹
> 4. 执行```npm install ws``` 确保ws模块已安装
> 5. 执行
    ```node websocket-server.js```

## JavaScript files

> 1. alllisten.js  
    添加监听器
> 2. lib.js  
    执行过程中需要用的库函数
> 3. Model.js  
    方块的定义
> 4. render.js  
    渲染函数
> 5. Tetris.js  
    游戏主要文件，定义用到的各项数据以及函数
> 6. Thread.js
    游戏入口

## CSS file

> 样式文件

## HTML file

> 主要游戏网页

## Websocket

> 1. websocket-client.js  
    客户端加载js实现与AI的数据交换
> 2. websocket-server.js  
    AI后台，接受客户端传来的消息，计算从而得出结果
