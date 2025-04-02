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
    drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    drawRect(ctx, x, y, width, height, fill = false) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        if (fill) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
    fillRect(ctx, x, y, width, height) {
        ctx.fillRect(x, y, width, height);
    }
    drawGradientRect(ctx, x, y, width, height, colorStops) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        ctx.fillStyle = gradient;
        this.fillRect(ctx, x, y, width, height);
        ctx.fillStyle = ""
    }
    drawCircle(ctx, x, y, radius, fill = false) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
    drawText(ctx, text, x, y, font = '16px Arial') {
        ctx.font = font;
        ctx.fillText(text, x, y);
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
        this.currentTool.configureContext(this.ctx);
        this.currentTool.drawLine(this.ctx, x1, y1, x2, y2);
    }
    drawRect(x1,y1,width,height){
        this.currentTool.configureContext(this.ctx)
        this.currentTool.drawRect(this.ctx,x1,y1,width,height)
    }
    drawCircle(x,y,radius,fill){
        this.currentTool.configureContext(this.ctx)
        this.currentTool.drawCircle(this.ctx,x,y,radius,fill)
    }
    drawGradientRect(x, y, width, height, colorStops) {
        this.currentTool.configureContext(this.ctx)
        this.currentTool.drawGradientRect(this.ctx, x, y, width, height, colorStops);
    }
    drawText(text,x,y,font){
        this.currentTool.configureContext(this.ctx)
        if(font===null){
            this.ctx.font="16px Arial"
        }
        this.currentTool.drawText(this.ctx,text,x,y,font)
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