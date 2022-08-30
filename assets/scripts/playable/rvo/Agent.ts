import { Line } from "./Line";
import { Obstacle } from "./Obstacle";
import { RVOMath } from "./RVOMath";
import { Simulator } from "./Simulator";
import { Vector2 } from "./Vector2";


class KeyValuePair<TKey, TValue> {
    public constructor(readonly key: TKey, readonly value: TValue) { }
}

type int = number;

export class Agent {
    agentNeighbors_ = new Array<KeyValuePair<number, Agent>>();
    obstacleNeighbors_ = new Array<KeyValuePair<number, Obstacle>>();
    orcaLines_ = new Array<Line>();
    position_: Vector2;
    prefVelocity_: Vector2;
    velocity_: Vector2;
    id_: int = 0;
    maxNeighbors_: int = 0;
    maxSpeed_: number = 0;
    neighborDist_: number = 0;
    radius_: number = 0;
    timeHorizon_: number = 0;
    timeHorizonObst_: number = 0;
    needDelete_: boolean = false;

    private newVelocity_: Vector2 = new Vector2();

    computeNeighbors(): void {
        this.obstacleNeighbors_.length = 0;
        let rangeSq = RVOMath.Sqr(this.timeHorizonObst_ * this.maxSpeed_ + this.radius_);
        Simulator.Instance.kdTree_.computeObstacleNeighbors(this, rangeSq);

        this.agentNeighbors_.length = 0;

        if (this.maxNeighbors_ > 0) {
            rangeSq = RVOMath.Sqr(this.neighborDist_);
            Simulator.Instance.kdTree_.computeAgentNeighbors(this, rangeSq);
        }
    }

    computeNewVelocity(): void {
        this.orcaLines_.length = 0;

        let invTimeHorizonObst = 1.0 / this.timeHorizonObst_;

        let vt1 = new Vector2(), vt2 = new Vector2(), vt3 = new Vector2(), vt4 = new Vector2();
        /* Create obstacle ORCA lines. */
        for (let i = 0; i < this.obstacleNeighbors_.length; ++i) {

            let obstacle1 = this.obstacleNeighbors_[i].value;
            let obstacle2 = obstacle1.next_;

            let relativePosition1 = Vector2.Subtract(obstacle1.point_, this.position_, vt1);
            let relativePosition2 = Vector2.Subtract(obstacle2.point_, this.position_, vt2);

            /*
             * Check if velocity obstacle of obstacle is already taken care
             * of by previously constructed obstacle ORCA lines.
             */
            let alreadyCovered = false;

            for (let j = 0; j < this.orcaLines_.length; ++j) {
                let orcaLine = this.orcaLines_[j];
                let rp1i = Vector2.Multiply(relativePosition1, invTimeHorizonObst, vt3);
                let rp2i = Vector2.Multiply(relativePosition2, invTimeHorizonObst, vt4);
                if (RVOMath.Det(Vector2.Subtract(rp1i, orcaLine.point, rp1i), orcaLine.direction) - invTimeHorizonObst * this.radius_
                    >= -RVOMath.RVO_EPSILON && RVOMath.Det(Vector2.Subtract(rp2i, orcaLine.point, rp2i), orcaLine.direction) - invTimeHorizonObst * this.radius_
                    >= -RVOMath.RVO_EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }

            if (alreadyCovered)
                continue;

            /* Not yet covered. Check for collisions. */
            let distSq1 = RVOMath.AbsSq(relativePosition1);
            let distSq2 = RVOMath.AbsSq(relativePosition2);

            let radiusSq = RVOMath.Sqr(this.radius_);

            let obstacleVector = Vector2.Subtract(obstacle2.point_, obstacle1.point_, vt3);
            let rp1n = Vector2.Negate(relativePosition1, vt4);
            let s = Vector2.Dot(rp1n, obstacleVector) / RVOMath.AbsSq(obstacleVector);
            let distSqLine = RVOMath.AbsSq(Vector2.Subtract(rp1n, Vector2.Multiply(obstacleVector, s, obstacleVector), rp1n));

            let line: Line = new Line();
            if (s < 0.0 && distSq1 <= radiusSq) {
                /* Collision with left vertex. Ignore if non-convex. */
                if (obstacle1.convex_) {
                    line.point = new Vector2(0.0, 0.0);
                    line.direction = RVOMath.Normalize(new Vector2(-relativePosition1.y, relativePosition1.x));
                    this.orcaLines_.push(line);
                }

                continue;
            } else if (s > 1.0 && distSq2 <= radiusSq) {
                /*
                 * Collision with right vertex. Ignore if non-convex or if
                 * it will be taken care of by neighboring obstacle.
                 */
                if (obstacle2.convex_ && RVOMath.Det(relativePosition2, obstacle2.direction_) >= 0.0) {
                    line.point = new Vector2(0.0, 0.0);
                    line.direction = RVOMath.Normalize(new Vector2(-relativePosition2.y, relativePosition2.x));
                    this.orcaLines_.push(line);
                }

                continue;
            } else if (s >= 0.0 && s < 1.0 && distSqLine <= radiusSq) {
                /* Collision with obstacle segment. */
                line.point = new Vector2(0.0, 0.0);
                line.direction = Vector2.Negate(obstacle1.direction_);
                this.orcaLines_.push(line);
                continue;
            }

            /*
             * No collision. Compute legs. When obliquely viewed, both legs
             * can come from a single vertex. Legs extend cut-off line when
             * non-convex vertex.
             */

            let leftLegDirection: Vector2, rightLegDirection: Vector2;

            if (s < 0.0 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that left vertex
                 * defines velocity obstacle.
                 */
                if (!obstacle1.convex_) {
                    /* Ignore obstacle. */
                    continue;
                }

                obstacle2 = obstacle1;

                let leg1 = RVOMath.Sqrt(distSq1 - radiusSq);
                leftLegDirection = new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1);
                leftLegDirection = Vector2.Divide(leftLegDirection, distSq1, leftLegDirection);
                rightLegDirection = new Vector2(relativePosition1.x * leg1 + relativePosition1.y * this.radius_, -relativePosition1.x * this.radius_ + relativePosition1.y * leg1);
                rightLegDirection = Vector2.Divide(rightLegDirection, distSq1, rightLegDirection);
            } else if (s > 1.0 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that
                 * right vertex defines velocity obstacle.
                 */
                if (!obstacle2.convex_) {
                    /* Ignore obstacle. */
                    continue;
                }

                obstacle1 = obstacle2;

                let leg2 = RVOMath.Sqrt(distSq2 - radiusSq);
                leftLegDirection = new Vector2(relativePosition2.x * leg2 - relativePosition2.y * this.radius_, relativePosition2.x * this.radius_ + relativePosition2.y * leg2);
                leftLegDirection = Vector2.Divide(leftLegDirection, distSq2, leftLegDirection);
                rightLegDirection = new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2);
                rightLegDirection = Vector2.Divide(rightLegDirection, distSq2, rightLegDirection);
            } else {
                /* Usual situation. */
                if (obstacle1.convex_) {
                    let leg1 = RVOMath.Sqrt(distSq1 - radiusSq);
                    leftLegDirection = new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1);
                    leftLegDirection = Vector2.Divide(leftLegDirection, distSq1, leftLegDirection);
                } else {
                    /* Left vertex non-convex; left leg extends cut-off line. */
                    leftLegDirection = Vector2.Negate(obstacle1.direction_);
                }

                if (obstacle2.convex_) {
                    let leg2 = RVOMath.Sqrt(distSq2 - radiusSq);
                    rightLegDirection = new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2);
                    rightLegDirection = Vector2.Divide(rightLegDirection, distSq2, rightLegDirection);
                } else {
                    /* Right vertex non-convex; right leg extends cut-off line. */
                    rightLegDirection = obstacle1.direction_;
                }
            }

            /*
             * Legs can never point into neighboring edge when convex
             * vertex, take cutoff-line of neighboring edge instead. If
             * velocity projected on "foreign" leg, no constraint is added.
             */

            let leftNeighbor = obstacle1.previous_;

            let isLeftLegForeign = false;
            let isRightLegForeign = false;

            let leftNeighborNegate = Vector2.Negate(leftNeighbor.direction_);
            if (obstacle1.convex_ && RVOMath.Det(leftLegDirection, leftNeighborNegate) >= 0.0) {
                /* Left leg points into obstacle. */
                leftLegDirection = leftNeighborNegate;
                isLeftLegForeign = true;
            }

            if (obstacle2.convex_ && RVOMath.Det(rightLegDirection, obstacle2.direction_) <= 0.0) {
                /* Right leg points into obstacle. */
                rightLegDirection = obstacle2.direction_;
                isRightLegForeign = true;
            }

            /* Compute cut-off centers. */
            let leftCutOff = Vector2.Subtract(obstacle1.point_, this.position_);
            leftCutOff = Vector2.Multiply(leftCutOff, invTimeHorizonObst, leftCutOff);
            let rightCutOff = Vector2.Subtract(obstacle2.point_, this.position_);
            rightCutOff = Vector2.Multiply(rightCutOff, invTimeHorizonObst, rightCutOff);
            let cutOffVector = Vector2.Subtract(rightCutOff, leftCutOff);

            /* Project current velocity on velocity obstacle. */

            /* Check if current velocity is projected on cutoff circles. */
            let vslc = Vector2.Subtract(this.velocity_, leftCutOff);
            let t = obstacle1 == obstacle2 ? 0.5 : Vector2.Dot(vslc, cutOffVector) / RVOMath.AbsSq(cutOffVector);
            let tLeft = Vector2.Dot(vslc, leftLegDirection);
            let tRight = Vector2.Dot(vslc, rightLegDirection);

            if ((t < 0.0 && tLeft < 0.0) || (obstacle1 == obstacle2 && tLeft < 0.0 && tRight < 0.0)) {
                /* Project on left cut-off circle. */
                let unitW = RVOMath.Normalize(vslc);

                line.direction = new Vector2(unitW.y, -unitW.x);
                let vw = Vector2.Multiply(unitW, this.radius_ * invTimeHorizonObst, unitW);
                line.point = Vector2.Add(leftCutOff, vw);
                this.orcaLines_.push(line);

                continue;
            } else if (t > 1.0 && tRight < 0.0) {
                /* Project on right cut-off circle. */
                let vsrc = Vector2.Subtract(this.velocity_, rightCutOff);
                let unitW = RVOMath.Normalize(vsrc);

                line.direction = new Vector2(unitW.y, -unitW.x);
                let vw = Vector2.Multiply(unitW, this.radius_ * invTimeHorizonObst, unitW);
                line.point = Vector2.Add(rightCutOff, vw);
                this.orcaLines_.push(line);

                continue;
            }

            /*
             * Project on left leg, right leg, or cut-off line, whichever is
             * closest to velocity.
             */
            let vt10 = Vector2.Multiply(cutOffVector, t);
            vt10 = Vector2.Add(leftCutOff, vt10, vt10);
            vt10 = Vector2.Subtract(this.velocity_, vt10, vt10);

            let distSqCutoff = (t < 0.0 || t > 1.0 || obstacle1 == obstacle2) ? Number.MAX_VALUE : RVOMath.AbsSq(vt10);

            let vt11 = Vector2.Multiply(leftLegDirection, tLeft, vt10);
            vt11 = Vector2.Add(leftCutOff, vt11, vt10);
            vt11 = Vector2.Subtract(this.velocity_, vt11, vt10);

            let distSqLeft = tLeft < 0.0 ? Number.MAX_VALUE : RVOMath.AbsSq(vt11);

            let vt12 = Vector2.Multiply(rightLegDirection, tRight, vt10);
            vt12 = Vector2.Add(rightCutOff, vt12, vt10);
            vt12 = Vector2.Subtract(this.velocity_, vt12, vt10);

            let distSqRight = tRight < 0.0 ? Number.MAX_VALUE : RVOMath.AbsSq(vt12);

            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                /* Project on cut-off line. */
                line.direction = Vector2.Negate(obstacle1.direction_);
                let point = new Vector2(-line.direction.y, line.direction.x);
                point = Vector2.Multiply(point, this.radius_ * invTimeHorizonObst, point);
                line.point = Vector2.Add(leftCutOff, point, point);
                this.orcaLines_.push(line);

                continue;
            }

            if (distSqLeft <= distSqRight) {
                /* Project on left leg. */
                if (isLeftLegForeign)
                    continue;

                line.direction = leftLegDirection;
                let point = new Vector2(-line.direction.y, line.direction.x);
                point = Vector2.Multiply(point, this.radius_ * invTimeHorizonObst, point);
                line.point = Vector2.Add(leftCutOff, point, point);
                this.orcaLines_.push(line);

                continue;
            }

            /* Project on right leg. */
            if (isRightLegForeign)
                continue;

            line.direction = Vector2.Negate(rightLegDirection);
            let point = new Vector2(-line.direction.y, line.direction.x);
            point = Vector2.Multiply(point, this.radius_ * invTimeHorizonObst, point);
            line.point = Vector2.Add(rightCutOff, point, point);
            this.orcaLines_.push(line);
        }


        let numObstLines = this.orcaLines_.length;

        let invTimeHorizon = 1.0 / this.timeHorizon_;

        /* Create agent ORCA lines. */
        for (let i = 0; i < this.agentNeighbors_.length; ++i) {
            let other = this.agentNeighbors_[i].value;

            let relativePosition = Vector2.Subtract(other.position_, this.position_, vt1);
            let relativeVelocity = Vector2.Subtract(this.velocity_, other.velocity_, vt2);
            let distSq = RVOMath.AbsSq(relativePosition);
            let combinedRadius = this.radius_ + other.radius_;
            let combinedRadiusSq = RVOMath.Sqr(combinedRadius);

            let line: Line = new Line();
            let u: Vector2;

            if (distSq > combinedRadiusSq) {
                /* No collision. */
                let rpi = Vector2.Multiply(relativePosition, invTimeHorizon, vt3);
                let w: Vector2 = Vector2.Subtract(relativeVelocity, rpi, rpi);

                /* Vector from cutoff center to relative velocity. */
                let wLengthSq = RVOMath.AbsSq(w);
                let dotProduct1 = Vector2.Dot(w, relativePosition);

                if (dotProduct1 < 0.0 && RVOMath.Sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
                    /* Project on cut-off circle. */
                    let wLength = RVOMath.Sqrt(wLengthSq);
                    let unitW = Vector2.Divide(w, wLength);

                    line.direction = new Vector2(unitW.y, -unitW.x);
                    u = Vector2.Multiply(unitW, combinedRadius * invTimeHorizon - wLength);
                } else {
                    /* Project on legs. */
                    let leg = RVOMath.Sqrt(distSq - combinedRadiusSq);

                    if (RVOMath.Det(relativePosition, w) > 0.0) {
                        /* Project on left leg. */
                        line.direction = new Vector2(relativePosition.x * leg - relativePosition.y * combinedRadius, relativePosition.x * combinedRadius + relativePosition.y * leg);

                    } else {
                        /* Project on right leg. */
                        line.direction = new Vector2(relativePosition.x * leg + relativePosition.y * combinedRadius, -relativePosition.x * combinedRadius + relativePosition.y * leg);
                        line.direction = Vector2.Negate(line.direction);
                    }

                    line.direction = Vector2.Divide(line.direction, distSq, line.direction);

                    let dotProduct2 = Vector2.Dot(relativeVelocity, line.direction);
                    let ld = Vector2.Multiply(line.direction, dotProduct2);
                    u = Vector2.Subtract(ld, relativeVelocity, ld);
                }
            } else {
                /* Collision. Project on cut-off circle of time timeStep. */
                let invTimeStep = 1.0 / Simulator.Instance.timeStep_;

                /* Vector from cutoff center to relative velocity. */
                let rpi = Vector2.Multiply(relativePosition, invTimeStep, vt3);
                let w = Vector2.Subtract(relativeVelocity, rpi, rpi);

                let wLength = RVOMath.Abs(w);
                let unitW = Vector2.Divide(w, wLength, w);

                line.direction = new Vector2(unitW.y, -unitW.x);
                u = Vector2.Multiply(unitW, combinedRadius * invTimeStep - wLength);
            }

            u = Vector2.Multiply(u, 0.5);
            line.point = Vector2.Add(this.velocity_, u, u);
            this.orcaLines_.push(line);
        }

        let lineFail = this.linearProgram2(this.orcaLines_, this.maxSpeed_, this.prefVelocity_, false);
        this.newVelocity_ = lineFail.result;
        if (lineFail.count < this.orcaLines_.length) {
            this.newVelocity_ = this.linearProgram3(this.orcaLines_, numObstLines, lineFail.count, this.maxSpeed_, this.newVelocity_);
        }
    }

    insertAgentNeighbor(agent: Agent, rangeSq: number): number {
        if (this != agent) {
            let distSq = RVOMath.AbsSq(Vector2.Subtract(this.position_, agent.position_));

            if (distSq < rangeSq) {
                if (this.agentNeighbors_.length < this.maxNeighbors_) {
                    this.agentNeighbors_.push(new KeyValuePair<number, Agent>(distSq, agent));
                }

                let i = this.agentNeighbors_.length - 1;

                while (i != 0 && distSq < this.agentNeighbors_[i - 1].key) {
                    this.agentNeighbors_[i] = this.agentNeighbors_[i - 1];
                    --i;
                }

                this.agentNeighbors_[i] = new KeyValuePair<number, Agent>(distSq, agent);

                if (this.agentNeighbors_.length == this.maxNeighbors_) {
                    rangeSq = this.agentNeighbors_[this.agentNeighbors_.length - 1].key;
                }
            }
        }
        return rangeSq;
    }

    insertObstacleNeighbor(obstacle: Obstacle, rangeSq: number): number {
        let nextObstacle = obstacle.next_;

        let distSq = RVOMath.DistSqPointLineSegment(obstacle.point_, nextObstacle.point_, this.position_);

        if (distSq < rangeSq) {
            this.obstacleNeighbors_.push(new KeyValuePair<number, Obstacle>(distSq, obstacle));

            let i = this.obstacleNeighbors_.length - 1;

            while (i != 0 && distSq < this.obstacleNeighbors_[i - 1].key) {
                this.obstacleNeighbors_[i] = this.obstacleNeighbors_[i - 1];
                --i;
            }
            this.obstacleNeighbors_[i] = new KeyValuePair<number, Obstacle>(distSq, obstacle);
        }
        return rangeSq;
    }

    private vpv = new Vector2();
    update() {
        this.velocity_ = this.newVelocity_.Clone();
        let vt = Vector2.Multiply(this.velocity_, Simulator.Instance.timeStep_, this.vpv);
        this.position_ = Vector2.Add(this.position_, vt, this.position_);
        // log("agent update", this.id_, this.velocity_);
    }

    linearProgram1(lines: Array<Line>, lineNo: int, radius: number, optVelocity: Vector2, directionOpt: boolean): Vector2 {
        let lineNoDirection = lines[lineNo].direction, lineNoPoint = lines[lineNo].point;
        let dotProduct = Vector2.Dot(lineNoPoint, lineNoDirection);
        let discriminant = RVOMath.Sqr(dotProduct) + RVOMath.Sqr(radius) - RVOMath.AbsSq(lineNoPoint);

        /* Max speed circle fully invalidates line lineNo. */
        if (discriminant < 0.0)
            return null;

        let sqrtDiscriminant = RVOMath.Sqrt(discriminant);
        let tLeft = -dotProduct - sqrtDiscriminant;
        let tRight = -dotProduct + sqrtDiscriminant;

        let vt = new Vector2();

        for (let i = 0; i < lineNo; ++i) {
            let denominator = RVOMath.Det(lineNoDirection, lines[i].direction);
            let numerator = RVOMath.Det(lines[i].direction, Vector2.Subtract(lineNoPoint, lines[i].point, vt));

            if (RVOMath.FAbs(denominator) <= RVOMath.RVO_EPSILON) {
                /* Lines lineNo and i are (almost) parallel. */
                if (numerator < 0.0)
                    return null;

                continue;
            }

            let t = numerator / denominator;

            if (denominator >= 0.0) {
                /* Line i bounds line lineNo on the right. */
                tRight = Math.min(tRight, t);
            } else {
                /* Line i bounds line lineNo on the left. */
                tLeft = Math.max(tLeft, t);
            }

            if (tLeft > tRight)
                return null;
        }

        let vector: Vector2 = vt;
        if (directionOpt) {
            /* Optimize direction. */
            if (Vector2.Dot(optVelocity, lineNoDirection) > 0.0) {
                /* Take right extreme. */
                vt = Vector2.Multiply(lineNoDirection, tRight, vt);
                vector = Vector2.Add(lineNoPoint, vt, vt);
            } else {
                /* Take left extreme. */
                vt = Vector2.Multiply(lineNoDirection, tLeft, vt);
                vector = Vector2.Add(lineNoPoint, vt, vt);
            }
        } else {
            /* Optimize closest point. */
            vt = Vector2.Subtract(optVelocity, lineNoPoint, vt);
            let t = Vector2.Dot(lineNoDirection, vt);

            if (t < tLeft) {
                vt = Vector2.Multiply(lineNoDirection, tLeft, vt);
                vector = Vector2.Add(lineNoPoint, vt, vt);
            } else if (t > tRight) {
                vt = Vector2.Multiply(lineNoDirection, tRight, vt);
                vector = Vector2.Add(lineNoPoint, vt, vt);
            } else {
                vt = Vector2.Multiply(lineNoDirection, t, vt);
                vector = Vector2.Add(lineNoPoint, vt, vt);
            }
        }

        return vector;
    }

    linearProgram2(lines: Array<Line>, radius: number, optVelocity: Vector2, directionOpt: boolean): { count: int, result: Vector2 } {
        let result: Vector2;
        if (directionOpt) {
            /*
             * Optimize direction. Note that the optimization velocity is of
             * unit length in this case.
             */
            result = Vector2.Multiply(optVelocity, radius);
        } else if (RVOMath.AbsSq(optVelocity) > RVOMath.Sqr(radius)) {
            /* Optimize closest point and outside circle. */
            let n = RVOMath.Normalize(optVelocity);
            result = Vector2.Multiply(n, radius, n);
        } else {
            /* Optimize closest point and inside circle. */
            result = optVelocity.Clone();
        }

        let vt = new Vector2();
        for (let i = 0; i < lines.length; ++i) {
            let lpr = Vector2.Subtract(lines[i].point, result, vt);
            if (RVOMath.Det(lines[i].direction, lpr) > 0.0) {
                /* Result does not satisfy constraint i. Compute new optimal result. */
                // let tempResult = result;
                let tempResult = this.linearProgram1(lines, i, radius, optVelocity, directionOpt);
                if (tempResult == null)
                    return { count: i, result };
                result = tempResult;
            }
        }

        return { count: lines.length, result };
    }

    linearProgram3(lines: Array<Line>, numObstLines: int, beginLine: int, radius: number, result: Vector2): Vector2 {
        let distance = 0.0;

        let vt = new Vector2();
        for (let i = beginLine; i < lines.length; ++i) {
            if (RVOMath.Det(lines[i].direction, Vector2.Subtract(lines[i].point, result, vt)) > distance) {
                /* Result does not satisfy constraint of line i. */
                let projLines = new Array<Line>();
                for (let ii = 0; ii < numObstLines; ++ii) {
                    projLines.push(lines[ii]);
                }

                for (let j = numObstLines; j < i; ++j) {
                    let line: Line = new Line();

                    let determinant = RVOMath.Det(lines[i].direction, lines[j].direction);

                    if (RVOMath.FAbs(determinant) <= RVOMath.RVO_EPSILON) {
                        /* Line i and line j are parallel. */
                        if (Vector2.Dot(lines[i].direction, lines[j].direction) > 0.0) {
                            /* Line i and line j point in the same direction. */
                            continue;
                        } else {
                            /* Line i and line j point in opposite direction. */
                            let lialj = Vector2.Add(lines[i].point, lines[j].point);
                            line.point = Vector2.Multiply(lialj, 0.5);
                        }
                    } else {
                        let lislj = Vector2.Subtract(lines[i].point, lines[j].point);
                        let lids = Vector2.Multiply(lines[i].direction, RVOMath.Det(lines[j].direction, lislj) / determinant, lislj);
                        line.point = Vector2.Add(lines[i].point, lids, lislj);
                    }

                    let ljsli = Vector2.Subtract(lines[j].direction, lines[i].direction);
                    line.direction = RVOMath.Normalize(ljsli, ljsli);
                    projLines.push(line);
                }

                let results = this.linearProgram2(projLines, radius, new Vector2(-lines[i].direction.y, lines[i].direction.x), true);
                if (results.count >= projLines.length) {
                    /*
                     * This should in principle not happen. The result is by
                     * definition already in the feasible region of this
                     * linear program. If it fails, it is due to small
                     * floating point error, and the current result is kept.
                     */
                    result = results.result;
                }

                let lisr = Vector2.Subtract(lines[i].point, result, vt);
                distance = RVOMath.Det(lines[i].direction, lisr);
            }
        }
        return result;
    }
}