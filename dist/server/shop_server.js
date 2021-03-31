"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.Comment = exports.Product = void 0;
var express = require("express");
var ws_1 = require("ws");
var path = require("path");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, '第一个商品', 1.19, 1, 'angular demo', ['电子产品', '硬件设备']),
    new Product(2, '第二个商品', 1.39, 2, 'angular demo', ['电子产品', '硬件设备']),
    new Product(3, '第三个商品', 1.79, 3, 'angular demo', ['电子产品', '硬件设备']),
    new Product(4, '第四个商品', 1.29, 4, 'angular demo', ['电子产品', '硬件设备']),
    new Product(5, '第五个商品', 1.61, 3, 'angular demo', ['电子产品', '硬件设备']),
    new Product(5, '第六个商品', 1.73, 5, 'angular demo', ['电子产品', '硬件设备']),
];
var comments = [
    new Comment(1, 1, "2020-02-01 10:30:41", "张三", 3, "东西不错"),
    new Comment(2, 1, "2020-02-01 11:23:03", "李四", 2, "东西还不错"),
    new Comment(3, 1, "2020-02-01 12:11:00", "王五", 4, "东西蛮不错的"),
    new Comment(4, 3, "2020-02-01 11:10:10", "赵六", 5, "东西还行")
];

// app.get('/', function (req, res) {
//     res.send("Hello Express");
// });

app.use('/',express.static(path.join(__dirname,'..','client')));

app.get('/api/products', function (req, res) {
    // res.send("接收到商品查询请求");
    var result = products;
    if (req.query.title) {
        result = result.filter(function (p) { return p.title.indexOf(req.query.title) !== -1; });
    }
    if (req.query.price && req.query.price !== 'null' && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(req.query.price); });
    }
    if (req.query.category && req.query.category !== "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(req.query.category) !== -1; });
    }
    // console.log(result);
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == parseInt(req.params.id); }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == parseInt(req.params.id); }));
});
var server = app.listen(8888, "localhost", function () {
    console.log("服务器已启动，地址是：http://localhost:8888");
});
var wsServer = new ws_1.Server({ port: 8085 });
//关注的商品id集合
var subscriptions = new Map();
// 发送定时推送，同时接收数据信息
wsServer.on('connection', function (websocket) {
    // websocket.send("这个消息是服务器主动推送的");
    websocket.on("message", function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, __spreadArray(__spreadArray([], productIds), [messageObj.productId]));
    });
});
//价格集合
var currentBids = new Map();
// 每5秒发送一次定时推送
setInterval(function () {
    products.forEach(function (client) {
        var currentBid = currentBids.get(client.id) || client.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(client.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        var newBids = productIds.map(function (pid) {
            return ({
                productId: pid,
                bid: currentBids.get(pid)
            });
        });
        ws.send(JSON.stringify(newBids));
    });
}, 5000);
