import { getSizeSliderValue, getCurrentSpeed, getGraphViz, selected } from "./index.js";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 600;
const RC_TO_LABEL = {
    0: 16,
    1: 15,
    2: 14,
    3: 17,
    4: 5,
    5: 4,
    6: 13,
    7: 18,
    8: 6,
    9: 0,
    10: 3,
    11: 12,
    12: 7,
    13: 1,
    14: 2,
    15: 11,
    16: 19,
    17: 8,
    18: 9,
    19: 10,
    20: 24,
    21: 20,
    22: 21,
    23: 22,
    24: 23
}
const LABELS_TO_EDGES = [
    [1, 2], // 0
    [7, 8],
    [4, 9],
    [],
    [3, 5, 14], // 4
    [18],
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

export var displayedNodeData = {};
export var edgesToWeights = {};
var nodeCanvasData = null;



export const paintEdge = async function(startCanvasData, endCanvasData, color) {
    instantPaintEdge(startCanvasData, endCanvasData, color);
    return new Promise(resolve => {
        setTimeout(() => { resolve(); }, getCurrentSpeed());
    });
};

export const paintNode = async function(canvasData, color, label) {
    instantPaintNode(canvasData, color, label);
    return new Promise(resolve => {
        setTimeout(() => { resolve(); }, getCurrentSpeed());
    });
};

export const instantPaintNode = function(canvasData, color, label) {
    // redraw node
    getContext().beginPath();
    getContext().fillStyle = color;
    getContext().arc(canvasData.x, canvasData.y, canvasData.radius, 0, Math.PI * 2);
    getContext().strokeStyle = "#000000";
    getContext().stroke();
    getContext().fill();

    // label node
    getContext().fillStyle = "#FFFFFF";
    getContext().strokeStyle = "#FFFFFF";
    getContext().font = "20px monospace";
    if (label.length === 1) getContext().fillText(label, canvasData.x - 5, canvasData.y + 7);
    else getContext().fillText(label, canvasData.x - 10, canvasData.y + 7);
};

export const instantPaintEdge = function(startCanvasData, endCanvasData, color) {
    let r = startCanvasData.radius;
    let x1, y1, x2, y2;
    x1 = startCanvasData.x, y1 = startCanvasData.y, x2 = endCanvasData.x, y2 = endCanvasData.y;
    let lineStart, lineEnd;
    let m = x1 === x2 ? Infinity : (y1 - y2) / (x1 - x2);
    let c = y1 - m * x1;
    [lineStart, lineEnd] = getEdgeTips(x1, y1, x2, y2, r, m, c);
    drawLine(lineStart, lineEnd, 2, color);
    drawTriangle(lineStart, lineEnd, x2, y2, m, c, color);
};

export const paintFreshGraph = function(e) {
    if (nodeCanvasData === null) nodeCanvasData = generateNodeCanvasData();
    let canvas = getCanvas();
    canvas.remove();
    removeMinDistancesTable();
    canvas = document.createElement("canvas");
    canvas.id = "graph-canvas";
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.getElementById("graph-visualizer").appendChild(canvas);

    const numNodes = getSizeSliderValue() / 2;
    drawNodes(numNodes);
    drawEdges(numNodes);
    updateDisplayedNodeData(numNodes);
    if (selected === "Dijsktra") {
        let newWeights = e && e.target.id === "random-input-button";
        drawEdgeWeights(newWeights);
        drawMinDistancesTable();
    }
}

export const drawEdgeWeights = function(newWeights=true) {
    if (newWeights) edgesToWeights = generateShownEdgeWeights()
    else resizeEdgesToWeights();
    let start, end;
    for (const [key, weight] of Object.entries(edgesToWeights)) {
        [start, end] = key.split("-").map(label => Number(label));
        drawEdgeWeight(displayedNodeData[start].canvasData, displayedNodeData[end].canvasData, weight, "black");
    }
}

export const drawMinDistancesTable = function() {
    getGraphViz().appendChild(getFreshMinDistancesTable());
    let caption = document.createElement("caption")
    caption.id = "min-distances-caption";
    caption.innerText = "Min Distances";
    caption.classList.add("min-distances");
    getGraphViz().appendChild(caption);
}

export const removeMinDistancesTable = function() {
    if (getTable() !== null) {
        getTable().remove();
        getCaption().remove()
    }
}

export const getTableDistCell = (label) => getTable().children[1].children[label];

export const paintMinDistCol = async function(label, color, textColor) {
    instantPaintMinDistCol(label, color, textColor);
    return new Promise(resolve => {
        setTimeout(() => { resolve(); }, getCurrentSpeed());
    });
}

export const instantPaintMinDistCol = function(label, color, textColor) {
    let labelCell, distCell;
    [labelCell, distCell] = getTableDistCol(label);
    labelCell.style.backgroundColor = color;
    labelCell.style.color = textColor;
    distCell.style.backgroundColor = color;
    distCell.style.color = textColor;
}

export const updateTableContents = function(label, dist) {
    getTableDistCell(label).innerText = String(dist);
}

const resizeEdgesToWeights = function() {
    if (Object.keys(edgesToWeights).length === 0) {
        edgesToWeights = generateShownEdgeWeights();
        return;
    }

    let oldEdgesToWeights = edgesToWeights;
    edgesToWeights = {};
    let key;
    for (let label = 0; label < Object.keys(displayedNodeData).length; label++) {
        for (const dest of displayedNodeData[label].edges) {
            key = `${label}-${dest}`;
            edgesToWeights[key] = key in oldEdgesToWeights ? oldEdgesToWeights[key] : Math.floor(Math.random() * 5 + 1);
        }
    }
}

const getTableDistCol = (label) => [getTable().children[0].children[label], getTable().children[1].children[label]];

const getFreshMinDistancesTable = function() {
    let table = document.createElement("table");
    table.id = "min-distances-table";
    table.classList.add("min-distances");
    let numNodes = Object.keys(displayedNodeData).length;
    let tr, td;
    for (let r = 0; r < 2; r++) {
        tr = document.createElement("tr");
        tr.classList.add("min-distances");

        for (let label = 0; label < numNodes; label++) {
            td = document.createElement("td");
            td.classList.add("min-distances");
            td.classList.add("min-distances-td");
            td.innerText = r === 0 ? String(label) : "INF";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    return table;
}

const generateShownEdgeWeights = function() {
    let numNodes = getSizeSliderValue() / 2;
    let result = {};
    let labelEdges, key;
    for (let label = 0; label < numNodes; label++) {
        labelEdges = getDisplayedEdges(label, numNodes - 1);
        for (const dest of labelEdges) {
            key = `${label}-${dest}`;
            result[key] = Math.floor(Math.random() * 5 + 1);
        }
    }
    return result;
}

const drawEdgeWeight = function(startData, endData, weight, color) {
    let x1, y1, x2, y2;
    x1 = startData.x, y1 = startData.y, x2 = endData.x, y2 = endData.y;
    let m = slope(x1, y1, x2, y2);
    let [wx, wy] = midpoint(x1, y1, x2, y2);
    if (m === Infinity) wx += 5;
    else {
        wy -= 5;
        wx -= 5
    }
    getContext().beginPath();
    getContext().strokeStyle = color
    getContext().font = "14px monospace";
    getContext().lineWidth = 0.75;
    getContext().strokeText(String(weight), wx, wy);
}

const drawEdges = function(numNodes) {
    let lastDrawnEdge = numNodes - 1;
    let shouldDraw;
    getContext().strokeStyle = "grey";
    getContext().fillStyle = "grey";
    for (let label = 0; label < numNodes; label++) {
        for (const dest of LABELS_TO_EDGES[label]) {
            shouldDraw = lastDrawnEdge >= dest;
            if (shouldDraw) drawEdge(nodeCanvasData[label], nodeCanvasData[dest]);
        }
    }
}

const updateDisplayedNodeData = function(numNodes) {
    let data;
    displayedNodeData = {};
    for (let label = 0; label < numNodes; label++) {
        data = {};
        data.edges = getDisplayedEdges(label, numNodes - 1);
        data.visited = false;
        data.canvasData = nodeCanvasData[label];
        displayedNodeData[String(label)] = data;
    }
}

const getDisplayedEdges = function(nodeLabel, lastNode) {
    let result = [];
    for (const dest of LABELS_TO_EDGES[nodeLabel]) {
        if (dest <= lastNode) result.push(dest);
    }
    return result;
}

const drawEdge = function(startData, endData) {
    let x1, y1, x2, y2;
    x1 = startData.x, y1 = startData.y, x2 = endData.x, y2 = endData.y;
    let m = slope(x1, y1, x2, y2);
    let c = y1 - m * x1;
    let lineStart, lineEnd;
    [lineStart, lineEnd] = getEdgeTips(x1, y1, x2, y2, startData.radius, m, c);
    drawLine(lineStart, lineEnd, 2, "grey");
    drawTriangle(lineStart, lineEnd, x2, y2, m, c);
}

const drawTriangle = function(lineStart, lineEnd, nodeCenterX, nodeCenterY, m, c, color) {
    let baseMidPoint, baseEdges;
    if (m === Infinity) {
        baseMidPoint = lineStart[1] > lineEnd[1] ? [lineEnd[0], lineEnd[1] + 20] : [lineEnd[0], lineEnd[1] - 20];
        baseEdges = [[baseMidPoint[0] - 10, baseMidPoint[1]], [baseMidPoint[0] + 10, baseMidPoint[1]]];
    }
    else if (m === 0) {
        baseMidPoint = lineStart[0] > lineEnd[0] ? [lineEnd[0] + 20, lineEnd[1]] : [lineEnd[0] - 20, lineEnd[1]];
        baseEdges = [[baseMidPoint[0], baseMidPoint[1] - 10], [baseMidPoint[0], baseMidPoint[1] + 10]];
    }
    else {
        baseMidPoint = getTriangleBaseMidPoint(lineEnd[0], lineEnd[1], nodeCenterX, nodeCenterY, m, c);
        let orthoM = -(1 / m);
        let k = baseMidPoint[1] - orthoM * baseMidPoint[0]; // y int of line orthogonal to array line, d = y0 + m*x0
        baseEdges = getLinePointsDistanceAwayFromXY(10, baseMidPoint[0], baseMidPoint[1], orthoM, k);
    }
    let x1, y1, x2, y2, x3, y3;
    x1 = lineEnd[0], y1 = lineEnd[1];
    x2 = baseEdges[0][0], y2 = baseEdges[0][1];
    x3 = baseEdges[1][0], y3 = baseEdges[1][1];

    getContext().beginPath();
    getContext().fillStyle = color;
    getContext().moveTo(x1, y1);
    getContext().lineTo(x2, y2);
    getContext().lineTo(x3, y3);
    getContext().fill();
}

const getTriangleBaseMidPoint = function(lineEndX, lineEndY, nodeCenterX, nodeCenterY, m, c) {
    return furthestFrom([nodeCenterX, nodeCenterY], getLinePointsDistanceAwayFromXY(20, lineEndX, lineEndY, m, c));
}

const furthestFrom = (target, points) => {
    let x1, y1, x2, y2, targetX, targetY;
    x1 = points[0][0], y1 = points[0][1], x2 = points[1][0], y2 = points[1][1];
    targetX = target[0], targetY = target[1];
    let diff1 = Math.abs(targetX - x1) + Math.abs(targetY - y1);
    let diff2 = Math.abs(targetX - x2) + Math.abs(targetY - y2);
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

const drawLine = function(lineStart, lineEnd, width, color) {
    getContext().beginPath();
    getContext().moveTo(lineStart[0], lineStart[1]);
    getContext().strokeStyle = color;
    getContext().lineTo(lineEnd[0], lineEnd[1]);
    getContext().lineWidth = width;
    getContext().stroke();
}

const getEdgeTips = function(x1, y1, x2, y2, r, m, c) {
    if (x1 === x2) return verticalEdgeTips(x1, y1, x2, y2, r);

    let tips = null;
    for (const p1 of getLineCircleIntersection(x1, y1, m, c, r)) {
        for (const p2 of getLineCircleIntersection(x2, y2, m, c, r)) {
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

const drawNodes = function(numNodes) {
    for (let label = 0; label < numNodes; label++) drawNode(nodeCanvasData[label], String(label));
}

const drawNode = function(nodeInfo, label) {
    // draw node as circle
    getContext().beginPath();
    getContext().fillStyle = nodeInfo.fillStyle;
    getContext().arc(nodeInfo.x, nodeInfo.y, nodeInfo.radius, 0, Math.PI * 2);
    getContext().strokeStyle = nodeInfo.strokeStyle;
    getContext().stroke();
    getContext().fill();

    // label node
    getContext().fillStyle = "#FFFFFF";
    getContext().strokeStyle = "#FFFFFF";
    getContext().font = "20px monospace";
    if (label.length === 1) getContext().fillText(label, nodeInfo.x - 5, nodeInfo.y + 7);
    else getContext().fillText(label, nodeInfo.x - 10, nodeInfo.y + 7);
}

const generateNodeCanvasData = function() {
    let originY = 50;
    let originX = 50;
    let w = CANVAS_WIDTH;
    let canvasData = {};
    for (let r = 0; r < 6; r++) {
        if (r === 0) generateRowData(3, originX + w / 4, originY, 150, canvasData, r);
        else if (r % 2 === 1) generateRowData(4, originX + w / 8, originY + (r * 100), 150, canvasData, r);
        else generateRowData(5, originX, originY + (r * 100), 150, canvasData, r);
    }
    return canvasData;
}

const generateRowData = function(rowNodes, firstX, firstY, spaceBetween, canvasData, row) {
    for (let c = 0; c < rowNodes; c++) {
        let newNode = {
            radius: 20,
            fillStyle: "#808080", // grey
            strokeStyle: "#000000", // black outline
        };
        newNode.x = firstX + (c * spaceBetween);
        newNode.y = firstY;
        canvasData[labelFromRC(row, c)] = newNode;
    }
}

const labelFromRC = function(row, col) {
    let rcNumber = col;
    if (row > 0) rcNumber += 3;
    if (row > 1) rcNumber += 4;
    if (row > 2) rcNumber += 5;
    if (row > 3) rcNumber += 4;
    if (row > 4) rcNumber += 5;

    return RC_TO_LABEL[rcNumber];
}

const getCanvas = () =>  document.getElementById("graph-canvas");
const getContext = () =>  getCanvas().getContext('2d');
const getCaption = () => document.getElementById("min-distances-caption");
const getTable = () => document.getElementById("min-distances-table");
const midpoint = (x1, y1, x2, y2) => [(x1 + x2) / 2, (y1 + y2) / 2];
const slope = (x1, y1, x2, y2) => x1 - x2 === 0 ? Infinity : (y1 - y2) / (x1 - x2);
