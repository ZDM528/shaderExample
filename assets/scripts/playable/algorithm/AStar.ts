interface IGridNode {
    readonly x: number;
    readonly y: number;
}

class GridNode implements IGridNode {
    public f: number = 0;
    public g: number = 0;
    public h: number = 0;
    public visited: boolean = false;
    public closed: boolean = false;
    public parent: GridNode = null;

    public constructor(public readonly x, public readonly y, public readonly weight) { }

    public toString(): string {
        return "[" + this.x + " " + this.y + "]";
    }

    public getCost(fromNeighbor: GridNode): number {
        // Take diagonal weight into consideration.
        if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            return this.weight * 1.41421;
        }
        return this.weight;
    }

    public isWall(): boolean {
        return this.weight === 0;
    }

    public cleanNode(): void {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.visited = false;
        this.closed = false;
        this.parent = null;
    }
}

class BinaryHeap {
    private readonly content: GridNode[] = [];
    public constructor(public readonly scoreFunction: (node: GridNode) => number) { }

    public push(element: GridNode): void {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    }

    public pop(): GridNode {
        // Store the first element so we can return it later.
        let result = this.content[0];
        // Get the element at the end of the array.
        let end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }

    public remove(node: GridNode): void {
        let i = this.content.indexOf(node);
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        let end = this.content.pop();
        if (i !== this.content.length - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    }
    public size(): number {
        return this.content.length;
    }

    public rescoreElement(node: GridNode) {
        this.sinkDown(this.content.indexOf(node));
    }

    private sinkDown(n: number): void {
        // Fetch the element that has to be sunk.
        let element = this.content[n];
        // When at 0, an element can not sink any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            let parentN = ((n + 1) >> 1) - 1;
            let parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    }

    private bubbleUp(n: number): void {
        // Look up the target element and its score.
        let length = this.content.length;
        let element = this.content[n];
        let elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            let child2N = (n + 1) << 1;
            let child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            let swap = null;
            let child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                let child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                let child2 = this.content[child2N];
                let child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
}

class Graph {
    private readonly nodes: GridNode[][] = [];
    private readonly grid: GridNode[][] = [];
    private dirtyNodes: GridNode[];
    private diagonal: boolean;

    /**
     * A graph memory structure
     * @param gridIn 2D array of input weights
     * @param diagonal Specifies whether diagonal moves are allowed
     */
    public constructor(gridIn: number[][], diagonal: boolean = true) {
        this.diagonal = diagonal;
        for (let x = 0; x < gridIn.length; x++) {
            this.grid[x] = [];
            this.nodes[x] = [];
            for (let y = 0, row = gridIn[x]; y < row.length; y++) {
                let node = new GridNode(x, y, row[y]);
                this.grid[x][y] = node;
                this.nodes[x][y] = node;
            }
        }
        this.init();
    }

    public addNode(x: number, y: number, weight: number): void {
        let node = new GridNode(x, y, weight);
        this.grid[x][y] = node;
        this.nodes[x][y] = node;
        this.nodes[x][y].cleanNode();
    }

    public getNode(x: number, y: number): GridNode {
        return this.nodes[x][y];
    }

    private init(): void {
        this.dirtyNodes = [];
        for (let x = 0; x < this.nodes.length; x++) {
            for (let y = 0; y < this.nodes[x].length; y++)
                this.nodes[x][y].cleanNode();
        }
    };

    public cleanDirty(): void {
        for (let i = 0; i < this.dirtyNodes.length; i++) {
            this.dirtyNodes[i].cleanNode();
        }
        this.dirtyNodes = [];
    };

    public markDirty(node: GridNode): void {
        this.dirtyNodes.push(node);
    };

    public neighbors(node: GridNode): GridNode[] {
        let ret: GridNode[] = [];
        let x = node.x;
        let y = node.y;
        let grid = this.grid;

        // West
        if (grid[x - 1] && grid[x - 1][y]) {
            ret.push(grid[x - 1][y]);
        }

        // East
        if (grid[x + 1] && grid[x + 1][y]) {
            ret.push(grid[x + 1][y]);
        }

        // South
        if (grid[x] && grid[x][y - 1]) {
            ret.push(grid[x][y - 1]);
        }

        // North
        if (grid[x] && grid[x][y + 1]) {
            ret.push(grid[x][y + 1]);
        }

        if (this.diagonal) {
            // Southwest
            if (grid[x - 1] && grid[x - 1][y - 1]) {
                ret.push(grid[x - 1][y - 1]);
            }

            // Southeast
            if (grid[x + 1] && grid[x + 1][y - 1]) {
                ret.push(grid[x + 1][y - 1]);
            }

            // Northwest
            if (grid[x - 1] && grid[x - 1][y + 1]) {
                ret.push(grid[x - 1][y + 1]);
            }

            // Northeast
            if (grid[x + 1] && grid[x + 1][y + 1]) {
                ret.push(grid[x + 1][y + 1]);
            }
        }

        return ret;
    };

    public toString(): string {
        let graphString: string[] = [];
        let nodes = this.grid;
        for (let x = 0; x < nodes.length; x++) {
            let rowDebug = [];
            let row = nodes[x];
            for (let y = 0; y < row.length; y++) {
                rowDebug.push(row[y].weight);
            }
            graphString.push(rowDebug.join(" "));
        }
        return graphString.join("\n");
    };
}

// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
class Heuristics {
    public static manhattan(pos0: IGridNode, pos1: IGridNode): number {
        let d1 = Math.abs(pos1.x - pos0.x);
        let d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
    }

    public static diagonal(pos0: IGridNode, pos1: IGridNode): number {
        let D = 1;
        let D2 = Math.sqrt(2);
        let d1 = Math.abs(pos1.x - pos0.x);
        let d2 = Math.abs(pos1.y - pos0.y);
        return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
}

export default class AStar {
    public static createGraph(...args: ConstructorParameters<typeof Graph>): Graph {
        return new Graph(...args);
    }

    /**
     * @param graph 
     * @param start 
     * @param end 
     * @param closest Specifies whether to return the path to the closest node if the target is unreachable.
     * @param heuristic Heuristic function @see Heuristics.manhattan
     * @returns 
     */
    public static search(graph: Graph, startPoint: IGridNode, endPoint: IGridNode, closest: boolean = false, heuristicFunc?: (pos0: IGridNode, pos1: IGridNode) => number): IGridNode[] {
        graph.cleanDirty();
        let heuristic = heuristicFunc || Heuristics.manhattan;

        let start = graph.getNode(startPoint.x, startPoint.y);
        let end = graph.getNode(endPoint.x, endPoint.y);

        if (start.x != startPoint.x || start.y != startPoint.y)
            console.error("getNode start", start, startPoint)
        if (end.x != endPoint.x || end.y != endPoint.y)
            console.error("getNode end", end, endPoint)

        let openHeap = new BinaryHeap((node) => { return node.f; });
        let closestNode = start; // set the start node to be the closest if required

        start.h = heuristic(start, end);
        graph.markDirty(start);

        openHeap.push(start);

        while (openHeap.size() > 0) {
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            let currentNode = openHeap.pop();
            // End case -- result has been found, return the traced path.
            if (currentNode === end) {
                return AStar.pathTo(currentNode);
            }
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
            // Find all neighbors for the current node.
            let neighbors = graph.neighbors(currentNode);
            for (let i = 0, il = neighbors.length; i < il; ++i) {
                let neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                let gScore = currentNode.g + neighbor.getCost(currentNode);
                let beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {
                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.markDirty(neighbor);
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                            closestNode = neighbor;
                        }
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    } else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        if (closest)
            return AStar.pathTo(closestNode);

        // No result was found - empty array signifies failure to find path.
        return [];
    }

    private static pathTo(node: GridNode): GridNode[] {
        let curr = node;
        let path: GridNode[] = [];
        while (curr.parent) {
            path.unshift(curr);
            curr = curr.parent;
        }
        return path;
    }
}