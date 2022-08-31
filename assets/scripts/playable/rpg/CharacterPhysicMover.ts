import { RigidBody, Vec3 } from "cc";
import CharacterMoveBaseController from "./CharacterMoveBaseController";

export default class CharacterPhysicMover extends CharacterMoveBaseController {

    private rigibody: RigidBody;
    private moveDirection = new Vec3();
    private currentVelocity: Vec3 = new Vec3();

    public initialize(rigibody: RigidBody): void {
        this.rigibody = rigibody;
        super.initialize();
    }

    public setVelocity(velocity: Vec3, updateForward: boolean = true, smoothTime: number = 0.08): void {
        this.rigibody.setLinearVelocity(velocity);
        if (updateForward) {
            // if (velocity.x != velocity.z && velocity.x != 0)
            this.moveDirection.set(-velocity.x, 0, -velocity.z);
            this.node.forward = this.node.forward.smoothDamp(this.moveDirection, this.currentVelocity, smoothTime);
        }
    }
}