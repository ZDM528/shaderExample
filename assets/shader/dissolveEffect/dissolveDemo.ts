import { Material } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { XTween } from '../../scripts/playable/xtween/XTween';
import { MeshRenderer } from 'cc';
import { Mesh } from 'cc';
import { SkinnedMeshBatchRenderer } from 'cc';
import { SkinnedMeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('dissolveDemo')
export class dissolveDemo extends Component {

    @property(Material)
    material: Material = null;

    @property(SkinnedMeshRenderer)
    role: MeshRenderer = null;

    @property(SkinnedMeshRenderer)
    weapon: MeshRenderer = null;

    start() {
        let roleMaterial = this.role.material;
        let weaponMaterial = this.weapon.material;
        let value = 0;
        new XTween({ value }).to(1.5, { value: 1 }, {
            onUpdate: (radio, value) => {
                this.material.setProperty("dissloveThreshold", value);
                roleMaterial.setProperty("dissloveThreshold", value);
                weaponMaterial.setProperty("dissloveThreshold", value);
            }
        }).play();


    }

    update(deltaTime: number) {

    }
}

