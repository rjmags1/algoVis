import { reset, getStartNode } from "./index.js";
import { paintEdge, paintNode, instantPaintNode, displayedNodeData, edgesToWeights, getTableDistCell, instantPaintEdge, paintMinDistCol, instantPaintMinDistCol, updateTableContents } from "./graph.js";

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
    start = Number(start);
    let pathInfo = {};
    let labels = Object.keys(displayedNodeData).map(label => Number(label));
    for (const label of labels) {
        pathInfo[label] = label === start ? {distance: 0, prev: null} :
                                            {distance: Infinity, prev: null};
    }
    updateTableContents(start, 0);
    
    let queue = labels;
    let current, currentData;
    while (queue.length > 0) {
        current = nextClosest(queue, pathInfo);
        currentData = displayedNodeData[current];
        queue = queue.filter(label => label !== current);
        instantPaintMinDistCol(current, "red", "white");
        if (pathInfo[current].prev !== null) {
            instantPaintEdge(displayedNodeData[pathInfo[current].prev].canvasData, currentData.canvasData, "green");
        }
        await paintNode(currentData.canvasData, "red", current);
        if (reset()) return true;

        let d, prevDist;
        for (const dest of displayedNodeData[current].edges) {
            let destCanvasData = displayedNodeData[dest].canvasData;
            instantPaintNode(destCanvasData, "blue", dest)
            await paintEdge(currentData.canvasData, destCanvasData, "blue");
            if (reset()) return true;

            prevDist = pathInfo[dest].distance;
            d = prevDist === Infinity ? pathInfo[current].distance : prevDist;
            d += edgesToWeights[`${current}-${dest}`];
            if (d < prevDist) {
                pathInfo[dest].distance = d;
                pathInfo[dest].prev = current;
                updateTableContents(dest, d);
                await paintMinDistCol(dest, "blue", "white");
                if (reset()) return true;
                instantPaintMinDistCol(dest, "white", "black");
            }

            instantPaintNode(destCanvasData, "grey", dest)
            await paintEdge(currentData.canvasData, destCanvasData, "grey");
        }
        instantPaintMinDistCol(current, "green", "white");
        await paintNode(currentData.canvasData, "green", current);
    }

}

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
