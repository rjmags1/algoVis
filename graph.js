import { getSizeSliderValue, getCurrentSpeed, getGraphViz, selected } from "./index.js";
import * as shapesMath from "./shapesMath.js";

export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 600;
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

export const paintFreshGraph = function(e) {
    if (nodeCanvasData === null) nodeCanvasData = shapesMath.generateNodeCanvasData();
    let canvas = getCanvas();
    canvas.remove();
    removeTables();
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
    if (selected === "Top Sort") {
        drawTopSortOrder()
        drawScoresTable();
    }
}

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
    [lineStart, lineEnd] = shapesMath.getEdgeTips(x1, y1, x2, y2, r, m, c);
    shapesMath.drawLine(lineStart, lineEnd, 2, color);
    shapesMath.drawTriangle(lineStart, lineEnd, x2, y2, m, c, color);
};

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

export const removeTables = function() {
    let elem;
    let rem = []
    for (let i = 0; i < getGraphViz().children.length; i++) {
        elem = getGraphViz().children[i];
        if (elem.id !== "graph-canvas") rem.push(elem);
    }
    while (rem.length > 0) rem.shift().remove();
}

export const getMinDistanceTableDistCell = (label) => getMinDistanceTable().children[1].children[label];

export const paintMinDistCol = async function(label, color, textColor) {
    instantPaintMinDistCol(label, color, textColor);
    return new Promise(resolve => {
        setTimeout(() => { resolve(); }, getCurrentSpeed());
    });
}

export const instantPaintMinDistCol = function(label, color, textColor) {
    let labelCell, distCell;
    [labelCell, distCell] = getMinDistanceTableDistCol(label);
    labelCell.style.backgroundColor = color;
    labelCell.style.color = textColor;
    distCell.style.backgroundColor = color;
    distCell.style.color = textColor;
}

export const updateTableContents = function(label, dist) {
    getMinDistanceTableDistCell(label).innerText = String(dist);
}

export const getContext = () =>  getCanvas().getContext('2d');

export const drawScoresTable = function() {
    getGraphViz().appendChild(getFreshScoresTable());
    let caption = document.createElement("caption");
    caption.id = "scores-caption";
    caption.innerText = "Connection Scores";
    caption.classList.add("min-distances");
    getGraphViz().appendChild(caption);
}

export const instantPaintScoreCol = function(label, color) {
    getScoresTable().children[0].children[label].style.backgroundColor = color;
    getScoresTable().children[1].children[label].style.backgroundColor = color;
}

export const topSortOrderAppend = async function(label) {
    let orderP = getTopSortOrder();
    let sp = document.createElement("span");
    sp.innerText = `${label}, `;
    sp.classList.add("top-sort-order");
    sp.style.color = "green";
    orderP.appendChild(sp);
    return new Promise(resolve => {
        setTimeout(() => {
            sp.style.color = "black";
            resolve();
        }, getCurrentSpeed());
    })
}

const drawTopSortOrder = function() {
    let orderHeader = document.createElement("p");
    orderHeader.id = "top-sort-order";
    orderHeader.classList.add("min-distances");
    orderHeader.innerText = "Top Sort Order: "
    getGraphViz().appendChild(orderHeader);
}

const getFreshScoresTable = function() {
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
            td.innerText = r === 0 ? String(label) : "0";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    return table;
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

const getMinDistanceTableDistCol = (label) => [getMinDistanceTable().children[0].children[label], getMinDistanceTable().children[1].children[label]];

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
    let m = shapesMath.slope(x1, y1, x2, y2);
    let [wx, wy] = shapesMath.midpoint(x1, y1, x2, y2);
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
    let m = shapesMath.slope(x1, y1, x2, y2);
    let c = y1 - m * x1;
    let lineStart, lineEnd;
    [lineStart, lineEnd] = shapesMath.getEdgeTips(x1, y1, x2, y2, startData.radius, m, c);
    shapesMath.drawLine(lineStart, lineEnd, 2, "grey");
    shapesMath.drawTriangle(lineStart, lineEnd, x2, y2, m, c);
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

const getCanvas = () =>  document.getElementById("graph-canvas");
const getMinDistanceTable = () => document.getElementById("min-distances-table");
const getTopSortOrder = () => document.getElementById("top-sort-order");
