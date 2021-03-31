import * as express from 'express';
import {Server} from "ws";

const app=express();

export class Product {
    constructor(public id: number,
                public title: string,
                public price: number,
                public rating: number,
                public desc: string,
                public categories: Array<string>) {
    }
}
export class Comment {
    constructor(public id: number,
                public productId: number,
                public timestamp: string,
                public user: string,
                public rating: number,
                public content: string) {
    }
}

const products :Product[] = [
    new Product(1, '第一个商品', 1.19, 1, 'angular demo', ['电子产品', '硬件设备']),
    new Product(2, '第二个商品', 1.39, 2, 'angular demo', ['电子产品', '硬件设备']),
    new Product(3, '第三个商品', 1.79, 3, 'angular demo', ['电子产品', '硬件设备']),
    new Product(4, '第四个商品', 1.29, 4, 'angular demo', ['电子产品', '硬件设备']),
    new Product(5, '第五个商品', 1.61, 3, 'angular demo', ['电子产品', '硬件设备']),
    new Product(5, '第六个商品', 1.73, 5, 'angular demo', ['电子产品', '硬件设备']),
];

const comments:Comment[] = [
    new Comment(1,1,"2020-02-01 10:30:41","张三",3,"东西不错"),
    new Comment(2,1,"2020-02-01 11:23:03","李四",2,"东西还不错"),
    new Comment(3,1,"2020-02-01 12:11:00","王五",4,"东西蛮不错的"),
    new Comment(4,3,"2020-02-01 11:10:10","赵六",5,"东西还行")
];

app.get('/',(req,res)=>{
    res.send("Hello Express");
});

app.get('/api/products',(req,res)=>{
    // res.send("接收到商品查询请求");
    var result = products;
    if (req.query.title) {
        result = result.filter(function (p) { return p.title.indexOf(req.query.title as any) !== -1; });
    }
    if (req.query.price && req.query.price !=='null' && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(req.query.price as any); });
    }
    if (req.query.category &&req.query.category !== "-1"&& result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(req.query.category as any) !== -1; });
    }
    // console.log(result);
    res.json(result);
});

app.get('/api/product/:id',  (req, res)=> {
    res.json(products.find((product) => product.id == parseInt(req.params.id)));
});

app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == parseInt(req.params.id); }));
});


const server=app.listen(8888,"localhost",()=>{
    console.log("服务器已启动，地址是：http://localhost:8888");
});



const wsServer = new Server({port: 8085});
//关注的商品id集合
var subscriptions = new Map();
// 发送定时推送，同时接收数据信息
wsServer.on('connection',  websocket => {
    // websocket.send("这个消息是服务器主动推送的");
    websocket.on("message",message=>{
        let messageObj = JSON.parse(message as string);
        let productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, [...productIds,messageObj.productId])
    });
});
//价格集合
var currentBids = new Map();
// 每5秒发送一次定时推送
setInterval(()=>{
    products.forEach(client =>{
        let currentBid = currentBids.get(client.id) || client.price;
        let newBid = currentBid + Math.random() * 5;
        currentBids.set(client.id, newBid);
    })
    subscriptions.forEach( (productIds, ws) =>{
        var newBids = productIds.map( pid => { return ({
            productId: pid,
            bid: currentBids.get(pid)
        }); });
        ws.send(JSON.stringify(newBids));
    });
},5000);
