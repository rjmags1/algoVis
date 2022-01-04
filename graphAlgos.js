import { reset } from "./index.js";
import { paintEdge, paintNode, instantPaintNode, displayedNodeData, edgesToWeights,
         instantPaintEdge, paintMinDistCol, instantPaintMinDistCol, updateTableContents,
         topSortOrderAppend } from "./graph.js";

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
    let start = 0;
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
        currentData.visited = true;
        queue = queue.filter(label => label !== current);
        instantPaintMinDistCol(current, "red", "white");
        if (pathInfo[current].prev !== null) {
            instantPaintEdge(displayedNodeData[pathInfo[current].prev].canvasData, currentData.canvasData, "green");
        }
        await paintNode(currentData.canvasData, "red", current);
        if (reset()) return true;

        let d, prevDist, destCanvasData, oldColor;
        for (const dest of displayedNodeData[current].edges) {
            destCanvasData = displayedNodeData[dest].canvasData;
            oldColor = displayedNodeData[dest].visited ? "green" : "grey";
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

            instantPaintNode(destCanvasData, oldColor, dest)
            await paintEdge(currentData.canvasData, destCanvasData, "grey");
            if (reset()) return true;
        }
        instantPaintMinDistCol(current, "green", "white");
        await paintNode(currentData.canvasData, "green", current);
        if (reset()) return true;
    }
    resetVisited(displayedNodeData);
    return false;
}

export const doTopSort = async function() {
    let labels = Object.keys(displayedNodeData).map(label => Number(label));
    let scores = getTopSortScores();
    let cd;
    for (const n of labels) {
        cd = displayedNodeData[n].canvasData;
        instantPaintMinDistCol(n, "blue", "white");
        updateTableContents(n, scores[n]);
        await paintNode(cd, "blue", n);
        if (reset()) return true;
        instantPaintMinDistCol(n, "white", "black");
        instantPaintNode(cd, "grey", n);
    }

    let sorted = 0;
    let zeroScores, ecd;
    while (sorted < labels.length) {
        zeroScores = getZeroScores(scores);
        for (const n of zeroScores) {
            cd = displayedNodeData[n].canvasData;
            instantPaintMinDistCol(n, "red", "white");
            await paintNode(cd, "red", n);
            if (reset()) return true;

            for (const d of displayedNodeData[n].edges) {
                scores[d]--;
                ecd = displayedNodeData[d].canvasData;
                instantPaintNode(ecd, "blue", d);
                instantPaintMinDistCol(d, "blue", "white");
                updateTableContents(d, scores[d]);
                await paintEdge(cd, ecd, "blue");
                if (reset()) return true;

                instantPaintNode(ecd, "grey", d);
                instantPaintMinDistCol(d, "white", "black");
                instantPaintEdge(cd, ecd, "green");
            }

            scores[n]--;
            sorted++;
            instantPaintMinDistCol(n, "green", "white");
            await paintNode(cd, "green", n);
            if (reset()) return true;
            await topSortOrderAppend(n);
            if (reset()) return true;
        }
    }

    return false;
}

const getTopSortScores = function() {
    let scores = {};
    for (const n of Object.keys(displayedNodeData)) {
        if (!(n in scores)) scores[n] = 0;
        for (const d of displayedNodeData[n].edges) {
            if (!(d in scores)) scores[d] = 0;
            scores[d]++;
        }
    }

    return scores;
}

const getZeroScores = (scores) => Object.keys(scores).filter(s => scores[s] === 0);

const nextClosest = function(labels, pathInfo) {
    let result = labels[0];
    for (const label of labels.slice(1, labels.length)) {
        if (comp(label, result, pathInfo)) result = label;
    }
    return result;
}

const comp = (first, second, pathInfo) => pathInfo[first].distance < pathInfo[second].distance;

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
