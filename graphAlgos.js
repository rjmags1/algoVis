import { reset } from "./index.js";
import { paintEdge, paintNode, instantPaintEdge, instantPaintNode, displayedNodeData, freshVisitedEdgesMap } from "./graph.js";

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

const bfs = async function(nodes) {
    let label, current, destLabel, dest, edgeLabel;
    let visitedEdges = freshVisitedEdgesMap(Object.keys(nodes).length);
    let queue = [0];
    while (queue.length > 0) {
        label = String(queue.shift());
        current = nodes[label];
        if (current.visited) continue;

        current.visited = true;
        await paintNode(current.canvasData, "red", label);
        if (reset()) return true;
        for (let i = 0; i < current.edges.length; i++) {
            destLabel = String(current.edges[i]);
            dest = nodes[destLabel];
            edgeLabel = label + "-" + destLabel;
            if (!(dest.visited)) instantPaintNode(dest.canvasData, "blue", destLabel);
            if (!(visitedEdges[edgeLabel])) {
                visitedEdges[edgeLabel] = true;
                await paintEdge(current.canvasData, dest.canvasData, "green");
                if (reset()) return true;
            }
            queue.push(current.edges[i]);
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

    for (let i = 0; i < current.edges.length; i++) {
        let destLabel = String(current.edges[i]);
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