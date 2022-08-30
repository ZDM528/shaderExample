import { gfx, Mesh, utils, Vec3 } from "cc";
import Curve from "./Curve";

const vec3Temp0 = new Vec3();
const vec3Temp1 = new Vec3();

export default class CurveMeshHelper {
    constructor(public readonly curve: Curve, public readonly width: number) {
    }

    public createMesh(divisions: number): Mesh {
        let points: Vec3[] = this.curve.getPoints(divisions);

        const pathCount = points.length;
        let verticesCount = pathCount * 2;
        let positions: number[] = [];
        let vertices = new Array<Vec3>(verticesCount);

        let halfWidth = this.width * 0.5;
        let direction = vec3Temp0;
        for (let i = 0; i < pathCount; i++) {
            let position = points[i];
            let index = i * 2;

            if (i + 1 < pathCount) {
                direction = Vec3.subtract(direction, position, points[i + 1]);
                direction = Vec3.cross(direction, direction, Vec3.UP).normalize();
            }

            let p1 = Vec3.multiplyScalar(vec3Temp1, direction, -halfWidth).add(position);
            vertices[index + 0] = p1.clone();
            positions.push(p1.x, p1.y, p1.z);

            let p2 = Vec3.multiplyScalar(vec3Temp1, direction, +halfWidth).add(position);
            vertices[index + 1] = p2.clone();
            positions.push(p2.x, p2.y, p2.z);
        }

        let indiceCount = (pathCount - 1) * 6;
        let indices = new Array<number>(indiceCount);
        for (let i = 0, vi = 0; i < indiceCount; i += 6, vi += 2) {
            indices[i + 0] = vi + 0;
            indices[i + 1] = vi + 3;
            indices[i + 2] = vi + 1;
            indices[i + 3] = vi + 2;
            indices[i + 4] = vi + 3;
            indices[i + 5] = vi + 0;
        }

        let uvs = new Array<number>(verticesCount * 2);
        let ud = 0, vd = 0;

        for (let i = 0; i < verticesCount; i += 2) {
            let index = i * 2;
            uvs[index + 0] = 0, uvs[index + 1] = 0 + ud / this.width;
            uvs[index + 2] = 1, uvs[index + 3] = 0 + vd / this.width;

            let v = i + 2;
            if (v < verticesCount) {
                ud += Vec3.distance(vertices[v], vertices[i]);
                vd += Vec3.distance(vertices[v + 1], vertices[i + 1]);
            }
        }

        const attributes: any[] = [{
            name: gfx.AttributeName.ATTR_POSITION,
            format: gfx.Format.RGB32F,
        }];

        return utils.createMesh({
            positions: positions,
            indices: indices,
            uvs: uvs,
            primitiveMode: gfx.PrimitiveMode.TRIANGLE_LIST,
            attributes: attributes,
        });
    }
}