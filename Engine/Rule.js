export default class Rule {
    constructor(gameObject, scriptList) {
        this.engine = gameObject.engine;
        this.gameObject = gameObject;
        var expression = new String();
        scriptList.forEach((script) => { // add scripts to expression
            expression += this.parseNodeList(script) + ";";
        });
        expression = expression.replace(/Me\./g, gameObject.name + "."); // replace Me by game objects's name
        console.log("Rule expression: " + expression);
        return (math.compile(expression));
   }
    parseNodeList(nodeList) {
        if (!nodeList) return ("[]");
        var secuence = [];
        if (nodeList.length > 0) {
            nodeList.forEach(node => {
                if(!this[node.type.toLowerCase()]) return ("[]"); // check if node type is valid
                secuence += this[node.type.toLowerCase()](node.parameters, node.nodeListTrue, node.nodeListFalse) + ";"; // call node function
            });
            secuence = "[" + secuence.replace(/.$/, "]"); // replace last ; by ];
        }
        else secuence = "[]"; // empty nodeList
        return (secuence);
    }
    //#region Actions
    edit(params) {
        return (params.property + " = " + params.value);
    }
    delete() {
        return ("Engine.delete(" + this.gameObject.name + ")");
    }
    spawn(params) {
        let attributes = "{";
        if (params.attributes) {
            for (let key in params.attributes) {
                if (params.attributes.hasOwnProperty(key)) {
                    attributes += key + ": " + params.attributes[key] + ", ";
                }
            }
            attributes = attributes.slice(0, -2); // remove last comma and space
        }
        attributes += "}";
        return ("Engine.spawn('" + params.actor + "', " + attributes + ")");
    }
    move(params) {
        return ("Engine.move(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.speed + ", " + params.keepForces + ")");
    }
    move_to(params) {
        return ("Engine.moveTo(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.speed + ", " + params.keepForces + ")");
    }
    rotate(params) {
        return ("Engine.rotate(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.angle + ")");
    }
    rotate_to(params) {
        return ("Engine.rotateTo(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.speed + ")");
    }
    rotate_around(params) {
        return ("Engine.rotateAround(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + ", " + params.axisX + ", " + params.axisY + ", " + params.axisZ + ", " + params.angle + ")");
    }
    push(params) {
        return ("Engine.push(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    push_to(params) {
        return ("Engine.pushTo(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    impulse(params) {
        return ("Engine.impulse(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    impulse_to(params) {
        return ("Engine.impulseTo(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    torque(params) {
        return ("Engine.torque(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    torque_impulse(params) {
        return ("Engine.torqueImpulse(" + this.gameObject.name + ", " + params.x + ", " + params.y + ", " + params.z + ", " + params.force + ")");
    }
    set_timer(params) {
        return ("Engine.setTimer(" + this.gameObject.name + ", '" + params.name + "', " + params.time + ", " + params.repeat + ", " + params.start + ")");
    }
    start_timer(params) {
        return ("Engine.startTimer(" + this.gameObject.name + ", '" + params.name + "')");
    }
    stop_timer(params) {
        return ("Engine.stopTimer(" + this.gameObject.name + ", '" + params.name + "')");
    }
    reset_timer(params) {
        return ("Engine.resetTimer(" + this.gameObject.name + ", '" + params.name + "')");
    }
    delete_timer(params) {
        return ("Engine.deleteTimer(" + this.gameObject.name + ", '" + params.name + "')");
    }
    play_sound(params) {
        return ("Engine.playSound(" + this.gameObject.name + ", '" + params.sound + "')");
    }
    stop_sound(params) {
        return ("Engine.stopSound(" + this.gameObject.name + ")");
    }
    set_volume(params) {
        return ("Engine.setVolume(" + this.gameObject.name + ", " + params.volume + ")");
    }
    set_global_volume(params) {
        return ("Engine.setGlobalVolume(" + params.volume + ")");
    }
    animate(params) {
        return ("Engine.animate(" + this.gameObject.name + ", " + 
            (isNaN(params.animation) ? "'" + params.animation + "'" : params.animation) + ", " +
            params.loop + ", " + (params.transition != undefined ? params.transition : 0.1) + ")");
    }
    stop_animation(params) {
        return ("Engine.stopAnimation(" + this.gameObject.name + ", " + 
            (params.transition != undefined ? params.transition : 0.1) + ")");
    }
    debug(params) {
        return ("Engine.debug('" + this.gameObject.name + "', '" + params.message + "', [" + (params.values ? params.values.map(value => ", " + value).join("").slice(1) : " ") + "])");
    }
    //#endregion
    //#region Conditions
    compare(params, nodeListTrue, nodeListFalse) {
        var dictionary = { "Less": "<", "Less Equal": "<=", "Equal": "==", "Greater Equal": ">=", "Greater": ">", "Different": "!=" };
        var operation = dictionary[params.operation];
        return ("[" + params.value_1 + " " + operation + " " + params.value_2 + " ? " +
            this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");

    }
    check(params, nodeListTrue, nodeListFalse) {
        return ("[" + params.property + " ? " + this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");
    }
    collision(params, nodeListTrue, nodeListFalse) {
        return ("[Engine.collision(" + this.gameObject.name + ",'" + params.tags + "', '" + params.mode + "') ? " + this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");
    }
    check_timer(params, nodeListTrue, nodeListFalse) {
        return ("[Engine.checkTimer(" + this.gameObject.name + ", '" + params.name + "') ? " + this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");
    }
    input(params, nodeListTrue, nodeListFalse) {
        return ("[Engine.input('" + params.key + "', '" + params.mode + "') ? " + this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");
    }
    hover(params, nodeListTrue, nodeListFalse) {
        return ("[Engine.hover(" + this.gameObject.name + ") ? " + this.parseNodeList(nodeListTrue) + " : " + this.parseNodeList(nodeListFalse) + "]");
    }
    //#endregion
}