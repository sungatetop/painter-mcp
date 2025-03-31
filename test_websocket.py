import websockets
import asyncio
import json

async def test_websocket():
    uri = "ws://localhost:3000"  # 根据实际端口修改
    async with websockets.connect(uri) as websocket:
        print("已连接到WebSocket服务器")

        # 测试开始绘图
        start_data = {
            "operation": "draw",
            "x": 100,
            "y": 100,
            "isStart": True
        }
        await websocket.send(json.dumps(start_data))
        print("发送开始绘图指令:", start_data)

        # 测试绘制线条
        for i in range(10):
            draw_data = {
                "operation": "draw",
                "x": 100 + i * 10,
                "y": 100 + i * 10
            }
            await websocket.send(json.dumps(draw_data))
            print("发送绘图指令:", draw_data)
            await asyncio.sleep(0.5)  # 模拟绘制间隔

        # 测试结束绘图
        end_data = {
            "operation": "draw",
            "x": 0,
            "y": 0,
            "isEnd": True
        }
        await websocket.send(json.dumps(end_data))
        print("发送结束绘图指令:", end_data)

        # 测试设置画笔
        brush_data = {
            "operation": "setBrush",
            "width": 10,
            "color": "#f1fffe"
        }
        await websocket.send(json.dumps(brush_data))
        print("发送画笔设置指令:", brush_data)

        # 测试设置橡皮擦
        eraser_data = {
            "operation": "setEraser",
            "width": 10
        }
        await websocket.send(json.dumps(eraser_data))
        print("发送橡皮擦设置指令:", eraser_data)

        # 测试设置颜色
        color_data = {
            "operation": "setColor",
            "color": "#f1fffe"
        }
        await websocket.send(json.dumps(color_data))
        print("发送颜色设置指令:", color_data)
        for i in range(10):
            draw_data = {
                "operation": "draw",
                "x": 200 + i * 10,
                "y": 200 + i * 10
            }
            await websocket.send(json.dumps(draw_data))
            print("发送绘图指令:", draw_data)
            await asyncio.sleep(0.5)  # 模拟绘制间隔

        # 测试结束绘图
        end_data = {
            "operation": "draw",
            "x": 0,
            "y": 0,
            "isEnd": True
        }
        await websocket.send(json.dumps(end_data))
        print("发送结束绘图指令:", end_data)
        # 接收服务器广播的消息
        while True:
            response = await websocket.recv()
            print("收到服务器消息:", response)

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(test_websocket())