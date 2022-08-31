import { assert, Node, Vec3 } from "cc";
import { Func } from "../../utility/ActionEvent";
import BaseCharacter from "../BaseCharacter";
import CharacterComponent from "../CharacterComponent";
import ISteer from "./ISteer";
import Steering from "./Steering";

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();

export default class SteerMover extends CharacterComponent<BaseCharacter> implements ISteer {
    private readonly steeringList: Steering[] = [];
    public get maxAcceleration(): number { return this.character.config.runSpeed; }
    public maxAngularAcceleration: number = 3;
    public isPlanar: boolean = true;
    private readonly _velocity = new Vec3();
    public get velocity(): Readonly<Vec3> { return this._velocity; }
    public get radius(): number { return this.character.config.bodyRadius; }
    public target: Vec3 | Node;
    public get targetPosition(): Vec3 { return this.target instanceof Node ? this.target.worldPosition : this.target; }
    public get position(): Readonly<Vec3> { return this.character.node.worldPosition; }
    public getNeiboursFunc: Func<ISteer[], Vec3>;

    public addSteer<T extends AnyConstructor<Steering>>(classType: T, ...params: ConstructorParameters<T>): InstanceType<T> {
        assert(!this.containesSteer(classType));
        let steering = new classType(...params);
        this.steeringList.push(steering);
        return steering as InstanceType<T>;
    }

    public containesSteer<T extends Steering>(classType: AnyConstructor<T>): boolean {
        return this.steeringList.find(t => t instanceof classType) != null;
    }

    public removeSteer<T extends Steering>(classType: AnyConstructor<T>): void {
        for (let i = 0; i < this.steeringList.length; i++) {
            const steer = this.steeringList[i];
            if (steer instanceof classType) {
                this.steeringList.removeAt(i);
                return;
            }
        }
    }

    public getNeibours(): ISteer[] {
        return this.getNeiboursFunc(this.position);
    }

    public limitLinear(linear: Vec3): Vec3 {
        let linearLength = linear.length();
        if (linearLength > this.maxAcceleration)
            linear.multiplyScalar(this.maxAcceleration / linearLength);
        return linear;
    }

    public onUpdate(deltaTime: number) {
        let accelaration = vec3Temp1.set();
        for (let behavior of this.steeringList) {
            let linear = behavior.getSteering(this);
            accelaration.add(Vec3.multiplyScalar(vec3Temp2, linear, behavior.weight));
        }

        if (this.isPlanar)
            accelaration.y = 0;

        this.limitLinear(accelaration);
        this.velocity.set(accelaration);
        this.move(accelaration.multiplyScalar(deltaTime));
        this.setDirection(accelaration);
    }

    public move(directoin: Readonly<Vec3>): void {
        this.character.node.translate(directoin, Node.NodeSpace.WORLD);
    }

    public setDirection(directoin: Readonly<Vec3>): void {
        let eulerAngles: Vec3 = this.character.node.eulerAngles;
        eulerAngles.y = Math.atan2(directoin.x, directoin.z) * Math.RADIAN_TO_DEGREE;
        this.character.node.eulerAngles = eulerAngles;
    }
}