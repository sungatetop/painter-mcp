import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "mcp-painter",
    version: "1.1.0",
}, {
    capabilities: {
        tools: {},
        resources: {
            list: true,
            read: true,
            subscribe: false
        },
        prompts: {
            list: true,
            get: true
        }
    }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            //   {
            //   name: "calculate_sum",
            //   description: "计算两个数的总和",
            //   inputSchema: {
            //     type: "object",
            //     properties: {
            //       a: { type: "number", description: "数字a" },
            //       b: { type: "number", description: "数字b" }
            //     },
            //     required: ["a", "b"]
            //   }
            // },
            {
                name: "draw_on_canvas",
                description: "在画板上绘制图形",
                inputSchema: {
                    type: "object",
                    properties: {
                        x: { type: "number", description: "X坐标" },
                        y: { type: "number", description: "Y坐标" },
                        state: { type: "string", description: "绘制状态：start,move,end" },
                    },
                    required: ["x", "y", "state"]
                }
            },
            // {
            //   name:"draw_line",
            //   description:"在画板上绘制线段",
            //   inputSchema:{
            //     type: "object",
            //     properties: {
            //       x1: { type: "number", description: "起点X坐标" },
            //       y1: { type: "number", description: "起点Y坐标" },
            //       x2: { type: "number", description: "终点X坐标" },
            //       y2: { type: "number", description: "终点Y坐标" },
            //     },
            //     required: ["x1", "y1", "x2","y2"]
            //   }
            // },
            {
                name: "use_eraser",
                description: "使用橡皮擦",
                inputSchema: {
                    type: "object",
                    properties: {
                        width: { type: "number", description: "橡皮擦宽度" }
                    },
                    required: ["width"]
                }
            },
            {
                name: "set_brush",
                description: "设置画笔",
                inputSchema: {
                    type: "object",
                    properties: {
                        width: { type: "number", description: "画笔宽度" },
                        color: { type: "string", description: "画笔颜色十六进制，例如#ffffff" }
                    },
                    required: ["width", "color"]
                }
            },
            {
                name: "set_color",
                description: "设置颜色",
                inputSchema: {
                    type: "object",
                    properties: {
                        color: { type: "string", description: "颜色值" }
                    },
                    required: ["color"]
                }
            },
            {
                name: "clear_canvas",
                description: "清空画布",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "set_canvas_size",
                description: "设置画布大小",
                inputSchema: {
                    type: "object",
                    properties: {
                        width: { type: "number", description: "画布宽度" },
                        height: { type: "number", description: "画布高度" }
                    },
                    required: ["width", "height"]
                }
            },
            {
                name: "get_canvas_size",
                description: "获取当前画布大小",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            },
            {
                name: "get_current_draw_parameters",
                description: "获取当前画笔的绘画参数",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            }
        ]
    };
});
// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "image:///current_image.png",
                name: "当前绘制结果的图像",
                mimeType: "image/png"
            }
        ]
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "image:///current_image.png") {
        const response = await fetch('http://localhost:3000/image');
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "获取图像失败");
        const imageBuffer = await response.arrayBuffer();
        return { content: [
                {
                    "uri": uri,
                    "name": "绘制结果图像",
                    "mimeType": "image/png",
                    "blob": Buffer.from(imageBuffer).toString('base64')
                }
            ] };
    }
    throw new Error("Resource not found");
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!request.params || !request.params.arguments) {
        throw new McpError(ErrorCode.InvalidParams, "缺少参数");
    }
    if (!request.params.arguments || typeof request.params.arguments !== 'object') {
        throw new McpError(ErrorCode.InvalidParams, "参数无效");
    }
    // if (request.params.name === "calculate_sum") {
    //   const { a, b } = request.params.arguments as { a: number; b: number };
    //   if (typeof a !== 'number' || typeof b !== 'number') {
    //     throw new McpError(ErrorCode.InvalidParams, "Invalid number parameters");
    //   }
    //   return { content: [{ type: "text", text: (a + b).toString() }] };
    // }
    if (request.params.name === "draw_on_canvas") {
        //获取画板大小
        const { x, y, state } = request.params.arguments;
        // 调用画板API
        const response = await fetch('http://localhost:3000/draw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ x, y, state })
        });
        if (!response.ok) {
            throw new McpError(ErrorCode.InternalError, "画板API调用失败" + response.statusText);
        }
        return { content: [{ type: "text", text: "绘制成功" }] };
    }
    // if (request.params.name === "draw_line") {
    //   //获取画板大小
    //   const { x1, y1, x2,y2 } = request.params.arguments as {
    //     x1: number;
    //     y1: number;
    //     x2: number;
    //     y2: number;
    //   };
    //   // 调用画板API
    //   const response = await fetch('http://localhost:3000/draw_line', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ x1, y1, x2, y2 })
    //   });
    //   if (!response.ok) {
    //     throw new McpError(ErrorCode.InternalError, "画板API调用失败"+response.statusText);
    //   }
    //   return { content: [{ type: "text", text: "绘制成功" }] };
    // }
    if (request.params.name === "use_eraser") {
        const { width } = request.params.arguments;
        const response = await fetch('http://localhost:3000/eraser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ width })
        });
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "橡皮擦设置失败");
        return { content: [{ type: "text", text: "橡皮擦设置成功" }] };
    }
    if (request.params.name === "set_brush") {
        const { width, color } = request.params.arguments;
        const response = await fetch('http://localhost:3000/brush', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ width, color })
        });
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "画笔设置失败");
        return { content: [{ type: "text", text: "画笔设置成功" }] };
    }
    if (request.params.name === "set_color") {
        const { color } = request.params.arguments;
        const response = await fetch('http://localhost:3000/color-picker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ color })
        });
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "颜色设置失败");
        return { content: [{ type: "text", text: "颜色设置成功" }] };
    }
    // if (request.params.name === "get_image") {
    //   const response = await fetch('http://localhost:3000/image');
    //   if (!response.ok) throw new McpError(ErrorCode.InternalError, "获取图像失败");
    //   const imageBuffer = await response.arrayBuffer();
    //   return { content:[{"type":"image","image_url":Buffer.from(imageBuffer).toString('base64')}]};
    // }
    if (request.params.name === "clear_canvas") {
        const response = await fetch('http://localhost:3000/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new McpError(ErrorCode.InternalError, "清空画布失败");
        }
        return { content: [{ type: "text", text: "画布已清空" }] };
    }
    if (request.params.name === "set_canvas_size") {
        const { width, height } = request.params.arguments;
        const response = await fetch('http://localhost:3000/set_canvas_size', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ width, height })
        });
        if (!response.ok) {
            throw new McpError(ErrorCode.InternalError, "设置画布大小失败");
        }
        return { content: [{ type: "text", text: "画布大小设置成功" }] };
    }
    if (request.params.name === "get_canvas_size") {
        const response = await fetch('http://localhost:3000/get_canvas_size');
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "获取画布大小失败");
        const size = await response.json();
        return { content: [{ type: "text", text: `画布大小:` + JSON.stringify(size) }] };
    }
    if (request.params.name === "get_current_draw_parameters") {
        const response = await fetch('http://localhost:3000/get_current_draw_parameters');
        if (!response.ok)
            throw new McpError(ErrorCode.InternalError, "获取画布大小失败");
        const param = await response.json();
        return { content: [{ type: "text", text: `画笔绘画参数:` + JSON.stringify(param) }] };
    }
    throw new McpError(ErrorCode.MethodNotFound, "工具未找到");
});
const transport = new StdioServerTransport();
await server.connect(transport);
