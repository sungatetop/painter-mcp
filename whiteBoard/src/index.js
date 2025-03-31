const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { DrawingTool, Eraser, ColorPicker, CanvasManager } = require('./tools');
const fs = require('fs');

const publicPath = path.join(__dirname, '../public');
// 添加路径验证
if (!fs.existsSync(publicPath)) {
    console.error(`静态文件目录不存在: ${publicPath}`);
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(publicPath));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// 根路由处理
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
        res.status(404).send('index.html 文件未找到');
        return;
    }
    res.sendFile(indexPath);
});

// 初始化画布管理器和工具
const canvasManager = new CanvasManager();
const drawingTool = new DrawingTool();
const eraser = new Eraser();
const colorPicker = new ColorPicker();

// 画笔操作
function handleBrushOperation(width, color) {
    drawingTool.setWidth(width);
    drawingTool.setColor(color);
    canvasManager.setTool(drawingTool);
}

// 修改后的画笔操作路由
app.post('/brush', (req, res) => {
    try {
        const { width, color } = req.body;
        handleBrushOperation(width, color);

        // 广播画笔设置消息
        const response = {
            operation: 'setBrush',
            status: 'success',
            data: { width, color }
        };
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(response));
            }
        });

        res.json({ status: 'success' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});
// 橡皮擦操作
function handleEraserOperation(width) {
    // 设置橡皮擦宽度
    eraser.setWidth(width);
    eraser.setColor('#ffffff');
    // 停止当前绘制
    canvasManager.stopDrawing();
    // 设置橡皮擦为当前工具
    canvasManager.setTool(eraser);
}
// 修改后的橡皮擦操作路由
app.post('/eraser', (req, res) => {
    try {
        const { width } = req.body;
        handleEraserOperation(width);

        // 广播橡皮擦设置消息
        const response = {
            operation: 'setEraser',
            status: 'success',
            data: { width }
        };
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(response));
            }
        });

        res.json({ status: 'success' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});
// 绘画操作
function handleDrawOperation(x, y, isStart, isEnd) {
    if (isStart) {
        // 无论当前工具是什么，都开始新的绘制
        canvasManager.startDrawing(x, y);
    } else if (isEnd) {
        // 结束当前绘制
        canvasManager.stopDrawing();
    } else {
        // 进行绘制
        canvasManager.draw(x, y);
    }
}
// 修改后的绘画操作路由
app.post('/draw', (req, res) => {
    const { x, y, isStart, isEnd } = req.body;
    try {
        // 处理绘画操作
        if(canvasManager.checkPointInCanvas(x, y)){
            handleDrawOperation(x, y, isStart, isEnd);
            // 广播绘制消息
            const response = {
                operation: 'draw',
                status: 'success',
                data: { x, y, isStart, isEnd }
            };
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(response));
                }
            });
            res.json({ status: 'success' });
        }else{
            res.status(400).json({ status: 'error', message: '坐标越界,画板左上角为坐标原点，y向下为正，x向右为正' });
        }
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// 颜色选择器操作
app.post('/color-picker', (req, res) => {
    try {
        const { color } = req.body;
        const selectedColor = colorPicker.setColor(color);

        // 广播颜色设置消息
        const response = {
            operation: 'setColor',
            status: 'success',
            data: { color: selectedColor }
        };
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(response));
            }
        });

        res.json({ status: 'success', color: selectedColor });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// 获取绘制结果
app.get('/image', (req, res) => {
    try {
        const image = canvasManager.getImage();
        if (!image || image.length === 0) {
            throw new Error('生成的图片为空');
        }
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length
        });
        res.end(image);
    } catch (error) {
        console.error('获取图片失败:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 清空画布
app.post('/clear', (req, res) => {
    try {
        canvasManager.clear();
        // 广播清空消息给所有客户端
        const response = {
            operation: 'clear',
            status: 'success'
        };
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(response));
            }
        });

        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
app.post('/set_canvas_size', (req, res) => {
    try {
        const { width, height } = req.body;
        canvasManager.setCanvasSize(width, height);
        res.json({ status:'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
app.get('/get_canvas_size', (req, res) => {
    try {
        const size = canvasManager.getCanvasSize();
        res.json({ status:'success', width: size.width, height: size.height });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
app.get('/get_current_draw_parameters', (req, res) => {
    try {
        const parameters = canvasManager.getDrawParameters();
        res.json({ status:'success', parameters });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
// 存储所有连接的客户端
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('新客户端已连接');
    clients.add(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('收到消息:', data);
        const response = {
            operation: data.operation,
            status: 'success',
            data: null
        };

        try {
            switch (data.operation) {
                case 'draw':
                    // 处理绘画操作
                    console.log("do draw", data.x, data.y, data.isStart, data.isEnd)
                    handleDrawOperation(data.x, data.y, data.isStart, data.isEnd);
                    response.data = { x: data.x, y: data.y, isStart: data.isStart, isEnd: data.isEnd };
                    break;
                case 'setBrush':
                    handleBrushOperation(data.width, data.color);
                    response.data = { width: data.width, color: data.color };
                    break;
                case 'setEraser':
                    handleEraserOperation(data.width);
                    response.data = { width: data.width };
                    break;
                case 'setColor':
                    const color = colorPicker.setColor(data.color);
                    response.data = { color };
                    break;
                case 'clear':
                    canvasManager.clear();
                    break;
                default:
                    response.operation = 'error';
                    response.status = 'failed';
                    response.data = { message: '未知操作类型' };
            }
        } catch (error) {
            response.operation = 'error';
            response.status = 'failed';
            response.data = { message: error.message };
        }

        // 广播消息给所有客户端
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(response));
            }
        });
    });

    ws.on('close', () => {
        console.log('客户端已断开连接');
        clients.delete(ws);
    });
});

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';
server.listen(PORT, () => {
    console.log(`画板服务器运行在端口 ${PORT}`);
    if (isDev) {
        console.log('开发模式已启用，支持热重载');
    }
});

