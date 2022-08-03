import { _decorator, Node, Component } from "cc";
import { View } from "./playable/ui/View";

const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    public static _instance:Ball;
    public static get instance(){
        return  Ball._instance;
    }

    start(){
        Ball._instance=this;
    }       
}