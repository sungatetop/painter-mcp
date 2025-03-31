const { createCanvas } = require('canvas');

class DrawingTool {
    constructor(width = 2, color = '#000000') {
        this.width = width;
        this.color = color;
    }

    configureContext(ctx) {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    draw(ctx, x, y, isDrawing) {
        if (!isDrawing) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    setWidth(width) {
        this.width = width;
    }

    setColor(color) {
        this.color = color;
    }
}

class Eraser extends DrawingTool {
    constructor(width = 20) {
        super(width, '#ffffff');
    }

    configureContext(ctx) {
        super.configureContext(ctx);
        ctx.globalCompositeOperation = 'destination-out';
    }
}

class ColorPicker {
    constructor(initialColor = '#000000') {
        this.color = initialColor;
    }

    setColor(color) {
        this.color = color;
        return this.color;
    }

    getColor() {
        return this.color;
    }
}

class CanvasManager {
    constructor(width = 800, height = 600) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = '#ffffff00';
        this.ctx.fillRect(0, 0, width, height);
        
        this.currentTool = new DrawingTool();
        this.colorPicker = new ColorPicker();
        this.isDrawing = false;
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    startDrawing(x, y) {
        this.isDrawing = true;
        this.currentTool.configureContext(this.ctx);
        this.currentTool.draw(this.ctx, x, y, false);
    }

    draw(x, y, state) {
        switch(state) {
            case 'start':
                this.isDrawing = true;
                this.currentTool.configureContext(this.ctx);
                this.currentTool.draw(this.ctx, x, y, false);
                break;
            case 'move':
                if (this.isDrawing) {
                    this.currentTool.draw(this.ctx, x, y, true);
                }
                break;
            case 'end':
                this.isDrawing = false;
                break;
        }
    }
    checkPointInCanvas(x, y) {
        return x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    getImage() {
        console.log('获取图片，画布尺寸:', this.canvas.width, 'x', this.canvas.height);
        // 确保返回正确的图片格式
        return this.canvas.toBuffer('image/png');
    }
    getCanvasSize() {
        return { width: this.canvas.width, height: this.canvas.height };
    }
    getDrawParameters() {
        return {
            width: this.currentTool.width,
            color: this.currentTool.color
        }; 
    }
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    clear() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

module.exports = {
    DrawingTool,
    Eraser,
    ColorPicker,
    CanvasManager
};