import { getContext, CANVAS_WIDTH } from "./graph.js";

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

export const drawTriangle = function(lineStart, lineEnd, nodeCenterX, nodeCenterY, m, c, color) {
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

export const drawLine = function(lineStart, lineEnd, width, color) {
    getContext().beginPath();
    getContext().moveTo(lineStart[0], lineStart[1]);
    getContext().strokeStyle = color;
    getContext().lineTo(lineEnd[0], lineEnd[1]);
    getContext().lineWidth = width;
    getContext().stroke();
}

export const getEdgeTips = function(x1, y1, x2, y2, r, m, c) {
    if (x1 === x2) return verticalEdgeTips(x1, y1, x2, y2);

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

export const generateNodeCanvasData = function() {
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

export const midpoint = (x1, y1, x2, y2) => [(x1 + x2) / 2, (y1 + y2) / 2];
export const slope = (x1, y1, x2, y2) => x1 - x2 === 0 ? Infinity : (y1 - y2) / (x1 - x2);

const getTriangleBaseMidPoint = function(lineEndX, lineEndY, nodeCenterX, nodeCenterY, m, c) {
    return furthestFrom([nodeCenterX, nodeCenterY], getLinePointsDistanceAwayFromXY(20, lineEndX, lineEndY, m, c));
}

const verticalEdgeTips = function(x1, y1, x2, y2) {
    let topY = y1 < y2 ? y1 : y2;
    let bottomY = y1 > y2 ? y1 : y2;
    return y1 < y2 ? [[x1, topY + 20], [x1, bottomY - 20]] : [[x1, bottomY - 20], [x1, topY + 20]];
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
