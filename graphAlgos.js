import { reset } from "./index.js";
import { paintEdge, paintNode, instantPaintEdge, instantPaintNode, displayedNodeData } from "./graph.js";

export const doDFS = async function() {
    let r = await dfs("0", displayedNodeData);
    return r;
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
