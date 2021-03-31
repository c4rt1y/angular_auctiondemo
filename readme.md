
# 这个代码是根据我学习《Angular 4.0从入门到实战 打造股票管理网站》 编辑的代码，我使用的环境为:
Angular CLI: 11.1.3
Node: 14.15.4
OS: darwin x64

# 具体使用的功能如下:
路由
依赖注入
响应式编程
响应式表格
组件中间人模式
网络通信（http/websocket）

# 目录结构
.
├── dist
├── readme.md
├── shop
├── shop_server.js
└── shop_server.ts

shop为client代码
shop_server.ts为server代码的typescript代码
shop_server.js为server代码

dist目录下
.
├── client
└── server

client是对shop进行打包的代码
server是服务段代码

# 使用方法
进入目录
cd dist/server
安装模块
npm install ws
npm install nodemon
npm install express
运行
nodemon shop_server.js

