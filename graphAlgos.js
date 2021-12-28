import { reset, getStartNode } from "./index.js";
import { paintEdge, paintNode, instantPaintNode, displayedNodeData, edgesToWeights, getTableDistCell, instantPaintEdge, paintMinDistCol, instantPaintMinDistCol } from "./graph.js";

export const doDFS = async function() {
    let r = await dfs("0", displayedNodeData);
    resetVisited(displayedNodeData);
    return r;
}

export const doBFS = async function() {
    let r = await bfs(displayedNodeData);
    resetVisited(displayedNodeData);
    return r;
}

export const doDijsktra = async function() {
    let start = getStartNode();
    if (!validStart(start)) {
        alert("please specify valid start node!")
        return true;
    }
    let pathInfo = {};
    let labels = Object.keys(displayedNodeData);
    for (const label of labels) {
        pathInfo[label] = label === start ? {distance: 0, prev: null} :
                                            {distance: Infinity, prev: null};
    }
    
    let current, currentDistance, oldColor;
    while (labels.length > 0) {
        current = nextClosest(labels, pathInfo); // get next closest
        await paintNode(displayedNodeData[current].canvasData, "red", current);
        if (reset()) return true;
        labels = labels.filter(label => label !== current); // remove current from labels queue
        
        for (const dest of displayedNodeData[current].edges) {
            currentDistance = edgesToWeights[edgeKey(current, dest)] + getMinDistanceSoFar(current);
            oldColor = getColor(current);
            instantPaintEdge(displayedNodeData[current].canvasData, displayedNodeData[dest].canvasData, "blue");
            await paintNode(displayedNodeData[dest].canvasData, "blue", dest);
            if (reset()) return true;

            if (currentDistance < pathInfo[dest].distance) {
                await setMinDistanceSoFar(dest, currentDistance);
                if (reset()) return true;
                pathInfo[dest].prev = current;
                instantPaintMinDistCol(dest, "white");
            }

            instantPaintNode(displayedNodeData[dest].canvasData, oldColor, dest);
            instantPaintEdge(displayedNodeData[current].canvasData, displayedNodeData[dest].canvasData, "blue");
        }
        instantPaintNode(displayedNodeData[current].canvasData, "green", current);
        displayedNodeData[current].visited = true;
    }
}

const getColor = (label) => displayedNodeData[label].visited ? "green" : "grey";

const setMinDistanceSoFar = async function(label, distance) {
    getTableDistCell(label).innerText = String(distance);
    await paintMinDistCol(label, "yellow");
}

const getMinDistanceSoFar = function(label) {
    let cellContents = getTableDistCell(label).innerText;
    return cellContents === "INF" ? Infinity : Number(cellContents);
}

const edgeKey = (start, dest) => `${start}-${dest}`;

const nextClosest = function(labels, pathInfo) {
    let result = labels[0];
    for (const label of labels.slice(1, labels.length)) {
        if (comp(label, result, pathInfo)) result = label;
    }
    return result;
}

const comp = (first, second, pathInfo) => pathInfo[first].distance < pathInfo[second].distance;

const validStart = (start) => start.match(/^\d+$/) !== null && 0 <= Number(start) && Number(start) < Object.keys(displayedNodeData).length;

const bfs = async function(nodes) {
    let label, current, destLabel, dest, edgeLabel;
    let visitedEdges = {};
    let queue = [0];
    while (queue.length > 0) {
        label = String(queue.shift());
        current = nodes[label];
        if (current.visited) continue;

        current.visited = true;
        await paintNode(current.canvasData, "red", label);
        if (reset()) return true;
        for (const d of current.edges) {
            destLabel = String(d);
            dest = nodes[destLabel];
            edgeLabel = `${ label }-${ destLabel }`;
            if (!(dest.visited)) instantPaintNode(dest.canvasData, "blue", destLabel);
            if (!(edgeLabel in visitedEdges)) {
                visitedEdges[edgeLabel] = true;
                await paintEdge(current.canvasData, dest.canvasData, "green");
                if (reset()) return true;
            }
            queue.push(d);
        }
        await paintNode(current.canvasData, "green", label);
        if (reset()) return true;
    }

    return false;
} 

const dfs = async function(label, nodes, fromEdge=null) {
    let r;
    let current = nodes[label];
    if (current.visited) {
        if (fromEdge !== null) await paintEdge(fromEdge[0], fromEdge[1], "green");
        return reset();
    }

    await paintNode(current.canvasData, "red", label);
    if (reset()) return true;
    current.visited = true;

    for (const d of current.edges) {
        let destLabel = String(d);
        let destCanvasData = nodes[destLabel].canvasData;
        await paintEdge(current.canvasData, destCanvasData, "red");
        if (reset()) return true;
        r = await dfs(destLabel, nodes, [current.canvasData, destCanvasData]);
        if (r) return true;
    }
    await paintNode(current.canvasData, "green", label);
    if (reset()) return true;
    if (fromEdge !== null) await paintEdge(fromEdge[0], fromEdge[1], "green");
    return reset();
}

const resetVisited = (nodes) => {
    for (let i = 0; i < Object.keys(nodes).length; i++) nodes[i].visited = false;
}
