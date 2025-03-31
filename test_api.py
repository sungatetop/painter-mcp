import requests

# 服务器地址
BASE_URL = 'http://127.0.0.1:3000'
# 添加代理设置
proxies = {
    'http': 'http://127.0.0.1:7890',  # 根据实际情况修改代理地址和端口
    'https': 'http://127.0.0.1:7890'
}
def test_brush():
    """测试画笔设置接口"""
    url = f'{BASE_URL}/brush'
    data = {'width': 5, 'color': '#ff0000'}
    response = requests.post(url, json=data)
    print(f'Brush Test: {response.status_code} - {response.json()}')

def test_eraser():
    """测试橡皮擦设置接口"""
    url = f'{BASE_URL}/eraser'
    data = {'width': 10}
    response = requests.post(url, json=data)
    print(f'Eraser Test: {response.status_code} - {response.json()}')

def test_draw():
    """测试绘制接口"""
    url = f'{BASE_URL}/draw'
    # 测试开始绘制
    data = {'x': 100, 'y': 100, 'isStart': True, 'isEnd': False}
    response = requests.post(url, json=data)
    print(f'Draw Start Test: {response.status_code} - {response.json()}')

    # 测试绘制过程
    data = {'x': 150, 'y': 150, 'isStart': False, 'isEnd': False}
    response = requests.post(url, json=data)
    print(f'Draw Process Test: {response.status_code} - {response.json()}')

    # 测试结束绘制
    data = {'x': 0, 'y': 0, 'isStart': False, 'isEnd': True}
    response = requests.post(url, json=data)
    print(f'Draw End Test: {response.status_code} - {response.json()}')

def test_color_picker():
    """测试颜色选择器接口"""
    url = f'{BASE_URL}/color-picker'
    data = {'color': '#00ff00'}
    response = requests.post(url, json=data)
    print(f'Color Picker Test: {response.status_code} - {response.json()}')

def test_clear():
    """测试清空画布接口"""
    url = f'{BASE_URL}/clear'
    response = requests.post(url)
    print(f'Clear Test: {response.status_code} - {response.json()}')

def test_get_image():
    """测试获取图片接口"""
    url = f'{BASE_URL}/image'
    response = requests.get(url)
    print(f'Get Image Test: {response.status_code} - Content Length: {len(response.content)}')

if __name__ == '__main__':
    # 运行所有测试
    test_brush()
    test_eraser()
    test_draw()
    test_color_picker()
    test_clear()
    test_get_image()