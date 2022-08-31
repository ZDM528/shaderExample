import { instantiate, Node, Prefab } from "cc";

type KeyType = Node | Prefab;

declare module "cc" {
    interface Node {
        _poolKey: KeyType;
    }
}

export default class NodePool {
    private static pool = new Map<KeyType, Node[]>();
    private static root: Node;

    public static initilaize(root: Node): void {
        NodePool.root = root;
    }

    public static clear(): void {
        NodePool.pool.clear();
    }

    public static cacheNodes(prefab: KeyType, count: number): void {
        let list = NodePool.getPoolList(prefab);
        for (let i = 0; i < count; i++) {
            let node = NodePool.instantiateNode(prefab, NodePool.root);
            list.push(node);
            node.active = false;
        }
    }

    private static getPoolList(prefab: KeyType): Node[] {
        let list = NodePool.pool.get(prefab);
        if (list == null) {
            list = [];
            NodePool.pool.set(prefab, list);
        }
        return list;
    }

    public static createNode(prefab: KeyType): Node {
        let list = NodePool.getPoolList(prefab);
        let node = list.pop();
        if (node == null)
            node = NodePool.instantiateNode(prefab, NodePool.root);
        node.active = true;
        return node;
    }

    public static destroyNode(node: Node): boolean {
        if (node._poolKey == null) return node.destroy();
        let list = NodePool.getPoolList(node._poolKey);
        list.push(node);
        NodePool.root.addChild(node);
        return true;
    }

    public static instantiateNode(prefab: KeyType, parent: Node): Node {
        let node = instantiate(prefab) as Node;
        node._poolKey = prefab;
        parent.addChild(node);
        return node;
    }
}