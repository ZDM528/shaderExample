import LogicConfig from "./playable/gameConfig/LogicConfig";

export const logicConfig = LogicConfig.create({
    moveSpeed: {
        value: 3,
        min: 0, max: 10,
    },
    closeDistance: {
        value: 1,
        min: 0, max: 10,
    },
    attackPower: {
        type: "interval",
        value: [25, 30],
    }
});