import requests
import math

BASE_URL = 'http://localhost:3000'

def set_brush(width, color):
    """设置画笔"""
    url = f'{BASE_URL}/brush'
    data = {'width': width, 'color': color}
    response = requests.post(url, json=data)
    if response.status_code != 200:
        raise Exception(f'设置画笔失败: {response.text}')

def draw_point(x, y, state='move'):
    """绘制点"""
    url = f'{BASE_URL}/draw'
    data = {'x': x, 'y': y, 'state': state}
    response = requests.post(url, json=data)
    if response.status_code != 200:
        raise Exception(f'绘制失败: {response.text}')

def draw_star(center_x, center_y, radius):
    """绘制五角星"""
    # 设置红色画笔
    set_brush(3, '#ff0000')
    
    # 计算五角星的顶点坐标
    points = []
    for i in range(5):
        angle = math.radians(90 + i * 72)
        x = center_x + radius * math.cos(angle)
        y = center_y - radius * math.sin(angle)
        points.append((x, y))
    
    # 绘制五角星
    for i in range(5):
        # 开始绘制
        draw_point(points[i][0], points[i][1], state='start')
        # 连接到下一个点
        next_point = points[(i + 2) % 5]
        draw_point(next_point[0], next_point[1])
    
    # 结束绘制
    draw_point(0, 0, state='end')

if __name__ == '__main__':
    # 在画布中心绘制一个半径为100的五角星
    draw_star(250, 250, 100)
    print("红色五角星绘制完成")