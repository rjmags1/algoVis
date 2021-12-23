import { getSizeSliderValue } from "./index.js";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 600;
const DRAW_ORDER = [9, 13, 14, 10, 5, 4, 8, 12, 17, 18, 19, 15, 11, 6, 2, 1, 0, 3, 7, 16, 21, 22, 23, 24, 20];    
const LABELS_TO_EDGES = [
                        [1, 2], // 0
                        [7, 8],
                        [4, 9],
                        [],
                        [3, 5, 14], // 4
                        [6, 18],
                        [],
                        [8, 19],
                        [20], // 8
                        [11, 22],
                        [],
                        [10, 12, 13, 24],
                        [],
                        [3, 14], // 13
                        [15],
                        [5, 16, 17],
                        [],
                        [16], // 17
                        [7],
                        [],
                        [21], // 20
                        [0],
                        [8],
                        [],
                        [23]
                        ];

var nodeData = [];
var displayedNodeData = {};

export const paintFreshGraph = function() {
    let canvas = document.getElementById("graph-canvas");
    canvas.remove();
    canvas = document.createElement("canvas");
    canvas.id = "graph-canvas";
    document.getElementById("graph-visualizer").appendChild(canvas);
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext('2d');
    const numNodes = getSizeSliderValue() / 2;
    if (nodeData.length === 0) generateNodeData();
    drawNodes(numNodes, context);
    // draw nodes. max 25 min 2
    drawEdges(numNodes, context);
    updateDisplayedNodeData(numNodes);
    console.log(displayedNodeData)
}

export const doDFS = async function() {
    let r = await dfs(0, displayedNodeData);
    return r;
}

const dfs = async function(current, nodes) {
    if (current.visited) return true;

    // remove random input button for graph algos
}

const drawEdges = function(numNodes, context) {
    const map = getLabelToDataMap(numNodes);
    let lastDrawnEdge = numNodes - 1;
    let edges, destDrawn;
    context.strokeStyle = "#000000";
    context.fillStyle = "#000000";
    for (let i = 0; i < numNodes; i++) {
        edges = LABELS_TO_EDGES[i];
        for (let j = 0; j < edges.length; j++) {
            let dest = edges[j];
            destDrawn = lastDrawnEdge >= dest;
            if (destDrawn) drawEdge(map[i], map[dest], context);
        }
    }
}

const updateDisplayedNodeData = function(numNodes) {
    let nodeData;
    displayedNodeData = {};
    for (let n = 0; n < numNodes; n++) {
        nodeData = {};
        nodeData.edges = getDisplayedEdges(n, numNodes - 1);
        nodeData.visited = false;
        displayedNodeData[String(n)] = nodeData;
    }
}

const getDisplayedEdges = function(nodeLabel, lastNode) {
    let result = [];
    let edges = LABELS_TO_EDGES[nodeLabel];
    for (let i = 0; i < edges.length; i++) {
        if (edges[i] <= lastNode) result.push(edges[i]);
    }
    return result;
}

const drawEdge = function(startData, endData, context) {
    let r = startData.radius;
    let x1, y1, x2, y2;
    x1 = startData.x, y1 = startData.y, x2 = endData.x, y2 = endData.y;
    let lStart, lEnd;
    let m = x1 === x2 ? Infinity : (y1 - y2) / (x1 - x2);
    let c = y1 - m * x1;
    [lStart, lEnd] = getEdgeTips(x1, y1, x2, y2, r, m, c);
    drawLine(lStart, lEnd, 2, context);
    drawTriangle(lStart, lEnd, x2, y2, m, c, context);
}

const drawTriangle = function(lStart, lEnd, nodeCenterX, nodeCenterY, m, c, context) {
    let baseMidPoint, baseEdges;
    if (m === Infinity) {
        baseMidPoint = lStart[1] > lEnd[1] ? [lEnd[0], lEnd[1] + 20] : [lEnd[0], lEnd[1] - 20];
        baseEdges = [[baseMidPoint[0] - 10, baseMidPoint[1]], [baseMidPoint[0] + 10, baseMidPoint[1]]];
    }
    else if (m === 0) {
        baseMidPoint = lStart[0] > lEnd[0] ? [lEnd[0] + 20, lEnd[1]] : [lEnd[0] - 20, lEnd[1]];
        baseEdges = [[baseMidPoint[0], baseMidPoint[1] - 10], [baseMidPoint[0], baseMidPoint[1] + 10]];
    }
    else {
        baseMidPoint = getTriangleBaseMidPoint(lEnd[0], lEnd[1], nodeCenterX, nodeCenterY, m, c);
        let orthoM = -(1 / m);
        let k = baseMidPoint[1] - orthoM * baseMidPoint[0]; // y int of line orthogonal to array line, d = y0 + m*x0
        baseEdges = getLinePointsDistanceAwayFromXY(10, baseMidPoint[0], baseMidPoint[1], orthoM, k);
    }
    let x1, y1, x2, y2, x3, y3;
    x1 = lEnd[0], y1 = lEnd[1];
    x2 = baseEdges[0][0], y2 = baseEdges[0][1];
    x3 = baseEdges[1][0], y3 = baseEdges[1][1];

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.fill();
}

const getTriangleBaseMidPoint = function(x, y, nodeCenterX, nodeCenterY, m, c) {
    let points = getLinePointsDistanceAwayFromXY(20, x, y, m, c);
    return furthestFrom([nodeCenterX, nodeCenterY], points);
}

const furthestFrom = (target, points) => {
    let x1, y1, x2, y2, a, b;
    x1 = points[0][0], y1 = points[0][1], x2 = points[1][0], y2 = points[1][1];
    a = target[0], b = target[1];
    let diff1 = Math.abs(a - x1) + Math.abs(b - y1);
    let diff2 = Math.abs(a - x2) + Math.abs(b - y2);
    return diff1 > diff2 ? points[0] : points[1];
}

const getLinePointsDistanceAwayFromXY = function(d, x, y, m, c) {
    let A = 1 + m ** 2;
    let B = 2 * (m * (c - y) - x)
    let C = x ** 2 + (c - y) ** 2 - d ** 2;
    let x1 = (-B + ((B ** 2 - 4 * A * C) ** 0.5)) / (2 * A);
    let x2 = (-B - ((B ** 2 - 4 * A * C) ** 0.5)) / (2 * A);
    let y1 = m * x1 + c;
    let y2 = m * x2 + c;
    return [[x1, y1], [x2, y2]];
}

const drawLine = function(lStart, lEnd, width, context) {
    context.beginPath();
    context.moveTo(lStart[0], lStart[1]);
    context.lineTo(lEnd[0], lEnd[1]);
    context.lineWidth = width;
    context.stroke();
}

const getEdgeTips = function(x1, y1, x2, y2, r, m, c) {
    // be sure to account for vertical line edge case
    if (x1 === x2) return verticalEdgeTips(x1, y1, x2, y2, r);

    let circle1Points = getLineCircleIntersection(x1, y1, m, c, r);
    let circle2Points = getLineCircleIntersection(x2, y2, m, c, r);
    let tips = null;
    let p1, p2;
    for (let i = 0; i < circle1Points.length; i++) {
        p1 = circle1Points[i];
        for (let j = 0; j < circle2Points.length; j++) {
            p2 = circle2Points[j];
            if (tips === null || (distanceBetween(p1, p2) < distanceBetween(tips[0], tips[1]))) {
                tips = [p1, p2];
            }
        }
    }
    return tips;
}

const verticalEdgeTips = function(x1, y1, x2, y2, r) {
    let topY = y1 < y2 ? y1 : y2;
    let bottomY = y1 > y2 ? y1 : y2;
    return y1 < y2 ? [[x1, topY + 20], [x1, bottomY - 20]] : [[x1, bottomY - 20], [x1, topY + 20]];
}

const getLineCircleIntersection = function(p, q, m, c, r) {
    let A = m ** 2 + 1;
    let B = 2 * (m * c - m * q - p);
    let C = q ** 2 - r ** 2 + p ** 2 - 2 * c * q + c ** 2;
    if ((B ** 2 - 4 * A * C) < 0) {
        console.log("no intersection");
        return [];
    }
    let x1 = (-B + ((B ** 2 - 4 * A * C) ** 0.5)) / (2 * A);
    let x2 = (-B - ((B ** 2 - 4 * A * C) ** 0.5)) / (2 * A);
    let y1 = m * x1 + c;
    let y2 = m * x2 + c;
    return [[x1, y1], [x2, y2]];
}

const distanceBetween = function(p1, p2) {
    let x1, y1, x2, y2;
    x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

const getLabelToDataMap = function(numNodes) {
    let map = {};
    for (let i = 0; i < numNodes; i++) map[i] = nodeData[DRAW_ORDER[i]];
    return map;
}

const drawNodes = function(numNodes, context) {
    for (let i = 0; i < numNodes; i++) {
        let nodeInfo = nodeData[DRAW_ORDER[i]];
        drawNode(nodeInfo, String(i), context);
    }
}

const drawNode = function(nodeInfo, label, context) {
    // draw node as circle
    context.beginPath();
    context.fillStyle = nodeInfo.fillStyle;
    context.arc(nodeInfo.x, nodeInfo.y, nodeInfo.radius, 0, Math.PI * 2);
    context.strokeStyle = nodeInfo.strokeStyle;
    context.stroke();
    context.fill();

    // label node
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "#FFFFFF";
    context.font = "20px monospace";
    if (label.length === 1) context.fillText(label, nodeInfo.x - 5, nodeInfo.y + 7);
    else context.fillText(label, nodeInfo.x - 10, nodeInfo.y + 7);
}

const generateNodeData = function() {
    let ORIGIN_Y = 50;
    let ORIGIN_X = 50;
    let w = CANVAS_WIDTH;
    for (let r = 0; r < 6; r++) {
        if (r === 0) { rowData(3, ORIGIN_X + w / 4, ORIGIN_Y, 150) }
        else if (r % 2 === 1) { rowData(4, ORIGIN_X + w / 8, ORIGIN_Y + (r * 100), 150) }
        else { rowData(5, ORIGIN_X, ORIGIN_Y + (r * 100), 150) }
    }
}

const rowData = function(numNodes, firstX, firstY, spaceBetween) {
    for (let c = 0; c < numNodes; c++) {
        let newNode = {
            radius: 20,
            fillStyle: "#808080", // grey
            strokeStyle: "#000000", // black outline
        };
        newNode.x = firstX + (c * spaceBetween);
        newNode.y = firstY;
        nodeData.push(newNode);
    }
}
