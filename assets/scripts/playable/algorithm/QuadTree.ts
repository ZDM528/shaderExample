
type Bounds = { centerX: number; centerY: number; halfWidth: number; halfHeight: number; }

/**
 * 此版本来源于quadtree-js的改版。
 * 理论与示例，请参与原版本地址
 * @version 1.2.2
 * @license MIT
 * @author Timo Hausmann
 * https://github.com/timohausmann/quadtree-js.git
 */
export default class QuadTree {
    public readonly maxObjects: number;
    public readonly maxLevels: number;
    public readonly level: number;
    public readonly bounds: Bounds;
    public readonly objects = new Array<Bounds>();
    public readonly nodes = new Array<QuadTree>();
    private splitNodes: boolean = false;
    private objectCount: number = 0;
    public get isSplitNodes() { return this.splitNodes; }
    private tempIndexes1: number[] = [];
    private tempIndexes2: number[] = [];

    /**
     * Quadtree Constructor
     * @param bounds bounds of the node { x, y, width, height }
     * @param maxObjects (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
     * @param maxLevels (optional) total max levels inside root Quadtree (default: 4) 
     * @param level (optional) deepth level, required for subnodes (default: 0)
     */
    public constructor(bounds: Bounds, maxObjects: number = 10, maxLevels: number = 4, level: number = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
    }

    /**
     * Split the node into 4 subnodes
     */
    private split(): void {
        this.splitNodes = true;
        if (this.nodes.length > 0) return;
        let nextLevel = this.level + 1;
        let centerX = this.bounds.centerX;
        let centerY = this.bounds.centerY;
        let halfWidth = this.bounds.halfWidth * 0.5;
        let halfHeight = this.bounds.halfHeight * 0.5;

        //top right node
        this.nodes[0] = new QuadTree({ centerX: centerX + halfWidth, centerY: centerY + halfHeight, halfWidth, halfHeight }, this.maxObjects, this.maxLevels, nextLevel);
        //top left node
        this.nodes[1] = new QuadTree({ centerX: centerX - halfWidth, centerY: centerY + halfHeight, halfWidth, halfHeight }, this.maxObjects, this.maxLevels, nextLevel);
        //bottom left node
        this.nodes[2] = new QuadTree({ centerX: centerX - halfWidth, centerY: centerY - halfHeight, halfWidth, halfHeight }, this.maxObjects, this.maxLevels, nextLevel);
        //bottom right node
        this.nodes[3] = new QuadTree({ centerX: centerX + halfWidth, centerY: centerY - halfHeight, halfWidth, halfHeight }, this.maxObjects, this.maxLevels, nextLevel);
    }

    /**
     * Determine which node the object belongs to
     * @param rect bounds of the area to be checked, with x, y, width, height
     * @return an array of indexes of the intersecting subnodes 
     *                          (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     */
    private getIndex(rect: Bounds, outList: number[] = this.tempIndexes1): number[] {
        let indexes: number[] = outList;
        indexes.length = 0;

        let startIsTop = rect.centerY + rect.halfHeight > this.bounds.centerY;
        let endIsBottom = rect.centerY - rect.halfHeight < this.bounds.centerY;
        let startIsLeft = rect.centerX - rect.halfWidth < this.bounds.centerX;
        let endIsRight = rect.centerX + rect.halfWidth > this.bounds.centerX;

        //top-right quad
        if (startIsTop && endIsRight)
            indexes.push(0);
        //top-left quad
        if (startIsLeft && startIsTop)
            indexes.push(1);
        //bottom-left quad
        if (startIsLeft && endIsBottom)
            indexes.push(2);
        //bottom-right quad
        if (endIsRight && endIsBottom)
            indexes.push(3);
        return indexes;
    }

    /**
     * Insert the object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     * @param rect bounds of the object to be added { x, y, width, height }
     */
    public insert(rect: Bounds): void {
        this.objectCount++;
        //if we have subnodes, call insert on matching subnodes
        if (this.splitNodes) {
            let indexes = this.getIndex(rect);
            for (let i of indexes)
                this.nodes[i].insert(rect);
            return;
        }

        //otherwise, store object here
        this.objects.push(rect);

        //max_objects reached
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            //split if we don't already have subnodes
            if (!this.splitNodes)
                this.split();

            //add all objects to their corresponding subnode
            for (let o of this.objects) {
                let indexes = this.getIndex(o);
                for (let i of indexes)
                    this.nodes[i].insert(o);
            }

            //clean up this node
            this.objects.length = 0;
        }
    }

    public remove(rect: Bounds): void {
        this.objectCount--;
        if (this.splitNodes) {
            let indexes = this.getIndex(rect);
            for (let i of indexes)
                this.nodes[i].remove(rect);

            // if (this.objectCount <= this.maxObjects)
            //     this.Combine();
            return;
        }

        let index = this.objects.indexOf(rect);
        this.objects.splice(index, 1);
    }

    private combine(): void {
        for (let node of this.nodes) {
            if (node.isSplitNodes)
                node.combine();
            for (let o of node.objects) {
                if (this.objects.indexOf(o) == -1)
                    this.objects.push(o);
            }
            node.clear();
        }
        this.splitNodes = false;
    }

    public update(oldRect: Bounds, newRect: Bounds): boolean {
        if (this.splitNodes) {
            let oldIndexes = this.getIndex(oldRect, this.tempIndexes1);
            let newIndexes = this.getIndex(newRect, this.tempIndexes2);
            if (oldIndexes.length != newIndexes.length) return true;
            for (let i = 0; i < oldIndexes.length; i++) {
                let oldIndex = oldIndexes[i];
                if (oldIndex != newIndexes[i]) return true;
                if (this.nodes[oldIndex].update(oldRect, newRect)) return true;
            }
        }
        return false;
    }

    /**
     * Return all objects that could collide with the given object
     * @param rect bounds of the object to be checked { x, y, width, height }
     * @Return array with all detected objects
     */
    public retrieve<T extends Bounds>(rect: Bounds, outList: T[] = []): T[] {
        let returnObjects: Bounds[] = outList;

        for (let o of this.objects) {
            if (returnObjects.indexOf(o) == -1) // remove duplicates
                returnObjects.push(o);
        }

        //if we have subnodes, retrieve their objects
        if (this.splitNodes) {
            let indexes = this.getIndex(rect);
            for (let i of indexes)
                this.nodes[i].retrieve(rect, returnObjects);
        }

        return returnObjects as T[];
    }

    /**
     * Clear the quadtree
     */
    public clear(): void {
        if (this.splitNodes) {
            for (let node of this.nodes)
                node.clear();
        }
        this.objectCount = 0;
        this.objects.length = 0;
        this.splitNodes = false;
    }
}