import { instantiate, Node, Prefab } from "cc";

declare module "cc" {
    interface Node {
        _poolKey: Node | Prefab;
    }
}

export default class NodePool {
    private static pool = new Map<Node | Prefab, Node[]>();
    private static root: Node;

    public static initilaize(root: Node): void {
        NodePool.root = root;
    }

    public static clear(): void {
        NodePool.pool.clear();
    }

    public static cacheNodes(count: number, prefab: Node | Prefab): void {
        let list = NodePool.getPoolList(prefab);
        for (let i = 0; i < count; i++) {
            let node = NodePool.instantiateNode(prefab);
            list.push(node);
            node.active = false;
        }
    }

    private static getPoolList(prefab: Node | Prefab): Node[] {
        let list = NodePool.pool.get(prefab);
        if (list == null) {
            list = [];
            NodePool.pool.set(prefab, list);
        }
        return list;
    }

    public static createNode(prefab: Node | Prefab): Node {
        let list = NodePool.getPoolList(prefab);
        let node = list.pop();
        if (node == null)
            node = NodePool.instantiateNode(prefab);
        node.active = true;
        return node;
    }

    public static destroyNode(node: Node): boolean {
        if (node._poolKey == null) return node.destroy();
        let list = NodePool.getPoolList(node._poolKey);
        list.push(node);
        node.setParent(NodePool.root, false);
        return true;
    }

    private static instantiateNode(prefab: Node | Prefab): Node {
        let node = instantiate(prefab) as Node;
        node._poolKey = prefab;
        node.setParent(NodePool.root, false);
        return node;
    }
}