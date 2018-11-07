/**
 * 图表信息
 */
var graph = new Array();
var nextGraph = new Array();
var nextGraphCOLNUM = 4;
var nextGraphROWNUM = 4;
var COLNUM = 15;
var ROWNUM = 20;

/**
 * 移动信息
 */
var stepSize = 1;
var speed = 200;                        //初始移速
const aiSpeed = 20;
const userSpeed = 200;
var score = 0;
var needNext = false;                   //是否需要下一个对象

/**
 * 线程id信息
 */
var datafreshId;
var renderId;
var transid;

/**
 * 当前对象，以及前一对象信息
 */
var currentShape = null;
var currentObj = null;
var preObj = null;                          //存储前一帧对象位置
var nextShape = null;
var nextObj = null;

/**
 * 操作信息
 */
var operation = 'D';
var pause = false;

/**
 * AI信息
 */
var player = true;                              //true代表玩家自己，false代表ai
var AIData;
var AIResult;
var AIMove;


/**
 *初始化函数
 *
 */
function init(){
    generateObj();              //首先生成对象
    for(let i = 0; i < ROWNUM; i++){                       //生成表格
        let row = document.createElement("tr");
        graph[i] = [];
        for(let j = 0; j < COLNUM; j++){
            let cell = document.createElement("td");
            //cell.setAttribute("width","30px");
            row.appendChild(cell);
            graph[i][j]= -1;
        }
        document.getElementById("grid").appendChild(row);
    }
    for(let i = 0; i < nextGraphROWNUM; i++){
        let row = document.createElement("tr");
        nextGraph[i] = [];
        for(let j = 0; j < nextGraphCOLNUM; j++){
            let nextcell = document.createElement("td");
            row.appendChild(nextcell);
            nextGraph[i][j] = -1;
        }
        document.getElementById("next-tile").appendChild(row);
    }
    console.log(nextGraph);
    loadGraph(nextGraph, nextObj, "addCurrent");
    AIData.pattern = deepcopy(graph);
}

/**
 *生成对象
 *
 * @returns
 */
function generateObj(){
    if(nextObj == null){
        currentShape = generateShape();
    }else{
        currentShape = nextShape;
    }
    nextShape = generateShape();
    preObj = null;
    currentObj = {
        id: currentShape.getId(),
        edge: [0, 7],
        rotateNum: 0,
        area: currentShape.getModel(),
    };
    nextObj = {
        id: nextShape.getId(),
        edge: [3,0],
        area: nextShape.getModel(),
    }
    AIData = {
        pattern: deepcopy(graph),
        shape: currentShape.getModel(),
        id: currentShape.getId(),
    }
    if(nextGraph.length > 0){
        let tempObj = {
            id: currentShape.getId(),
            edge: [3, 0],
            area: currentShape.getModel(),
        }
        console.log(nextGraph);
        loadGraph(nextGraph, tempObj, "removePre");
        console.log(nextGraph);
        loadGraph(nextGraph, nextObj, "addCurrent");
    }
    // if(!player){
    //     communicateWithAI();
    // }
    needNext = false;
    //NormalMove('D');
    return;
}

/**
 *随机生成model
 *
 * @returns 生成的model
 */
function generateShape(){
    let id = parseInt(Math.random()*7,10);
    let shape;
    switch(id){
        case 0:
            shape = Model.L;
            break;
        case 1:
            shape = Model.I;
            break;
        case 2:
            shape = Model.J;
            break;
        case 3:
            shape = Model.O;
            break;
        case 4:
            shape = Model.N;
            break;
        case 5:
            shape = Model.S;
            break;
        case 6:
            shape = Model.T;
            break;
    }
    return shape;
}

/**
 *为已有的model改变颜色
 *
 * @param {*} area
 * @returns
 */
function changeColor(area){
    let colors = ['I','J','O','L','S','N','T'];
    for(let i = 0; i < area.length; i++){
        for(let j = 0; j < area[0].length; j++){
            if(area[i][j] != -1){
                let rand = parseInt(Math.random()*7,10);
                area[i][j] = colors[rand];
            }
        }
    }
    return area;
}

/**
 *下一个方块
 *
 */
function Next(){
    generateObj();
    Move();
}

/**
 *修改图标信息
 *
 */
function DataRefreshThread(){
    let res;
    if(preObj == null){
        preObj = {
            id: currentShape.getId(),
            edge: [0, 7],
            area: currentShape.getModel(),
        };
        loadGraph(graph, currentObj, "addCurrent");
        //debug();
    }else{
        //debug();
        if(!pause){
            res = Move();
        }
        //debug();
    }
    if(res != null){
        if(res == 'GG'){
            GameOver();
        }
    }else{
        datafreshId = setTimeout(DataRefreshThread, speed);
    }
}

/**
 *移动函数，消去前一个，添加后一个
 *
 * @returns
 */
function Move() {
    if(needNext){
        score += simplifyGraph(graph);
        let isOver = shouldOver();
        if(isOver){
            return 'GG';
        }else{
            return Next();
        }
    }
    
    if(currentObj == null){
        return;
    }
    //debug();
    loadGraph(graph, preObj, "removePre");
    let result;
    //console.log(player);
    if(player){
        if(operation == null){
            operation = 'D';
        }
        result = tryMove(operation, currentObj);
    }else{
        //console.log('the AIMove is ' + JSON.stringify(AIMove));
        if(AIMove != null && AIMove.length > 0){
            //console.log('now we are ai');
            let move = AIMove.shift();
            //console.log('the aimove operation is' + move);
            operation = move;
        }else{
            operation = 'D';
        }
        result = tryMove(operation, currentObj);
    }
    operation = 'D';

    if(result != null){
        currentObj = result;
        preObj = currentObj;
        //console.log("currentObj has been changed");
    }else{
        needNext = true;
    }
    //debug();
    loadGraph(graph, currentObj, "addCurrent");
}


/**
 *根据AI后台传来的数据生成AI移动所需的数据
 *
 * @param {*} AIResult
 * @returns
 */
function generateAIMove(AIResult){
    //console.log('the AIResult is ' + JSON.stringify(AIResult));
    let AIMove = [];
    let res = JSON.parse(AIResult);
    for(let i = currentObj.rotateNum; i != res.rotateNum; i = (i+1)%getRotateSum(currentObj.id)){
        AIMove.push('U');
    }
    let destCol = res.coord[1];
    let step = 1;
    let op = 'R';
    if((destCol - currentObj.edge[1]) < 0){
        step = -1;
        op = 'L';
    }
    for(let i = currentObj.edge[1]; i != destCol; i+=step){
        AIMove.push(op);
    }
    //console.log('the AIMove is ' + JSON.stringify(AIMove));
    return AIMove;
}

/**
 *判断是否结束的函数
 *
 * @returns
 */
function shouldOver() {
    for(let i = 0; i < COLNUM; i++){
        if(graph[0][i] != -1){
            return true;
        }
    }
    return false;
}


/**
 *主要监听器
 *
 * @returns
 */
function listener(){
    if(currentObj == null){
        return;
    }
    let e = event;
    switch(e.keyCode){
        case 88:
            if(player){
                document.removeEventListener('keydown', personListener);
                speed = aiSpeed;
            }
            else{
                document.addEventListener('keydown', personListener); 
                speed = userSpeed;               
            }
            player = !player;
            break;
        case 32:
            pause = !pause;
            break;
        case 13:
            Start();
            break;
        case 27:
            GameOver();
            break;
    }
}

function Start(){
    transid = setInterval(communicateWithAIThread, 10);                 //每10ms尝试交换一次
    datafreshId = setTimeout(DataRefreshThread, speed);                 //启动刷新图表线程
}

/**
 *与后台AI交换数据
 *
 */
function communicateWithAIThread(){
    if(ws.readyState == WebSocket.OPEN){
        if(AIData != null){
            sendDataToAI(AIData);
            AIData = null;
        }
    }
    let res = getMove();
    if(res != null){
        if(AIResult == null){
            AIResult = res;
            AIMove = generateAIMove(AIResult);
            AIResult = null;
        }else if(AIResult != res){
            AIResult = res;
            AIMove = generateAIMove(AIResult);
            AIResult = null;
        }
    }
}

/**
 *玩家自己玩游戏时所需的上下左右移动监听器
 *
 * @returns
 */
function personListener(){
    if(currentObj == null){
        return;
    }
    let e = event;
    switch(e.keyCode){
        case 37:           //左移函数
            operation = 'L';
            break;

        case 38:
            operation = 'U';
            break;

        case 39:
            operation = 'R';
            break;

        case 40:
            operation = 'D';
            Move();
            break;
    }
    
}



/**
 *判断主体是否可以移动到下一位置
 *
 * @param {移动方向} offset
 * @param {移动主体} temp
 * @returns
 */
function tryMove(offset, temp){
    if(temp == null){
        return null;
    }
    var obj = {};
    let res;
    switch(offset){
        case 'L':
            obj = {
                id: temp.id,
                edge: [temp.edge[0], temp.edge[1]-1],
                area: temp.area,
                rotateNum: temp.rotateNum,
            }
            res = CanNext(obj);
            if(res){
                return obj;
            }else{
                return temp;
            }

        case 'R':
            obj = {
                id: temp.id,
                edge: [temp.edge[0], temp.edge[1]+1],
                area: temp.area,
                rotateNum: temp.rotateNum,
            }
            res = CanNext(obj);
            if(res){
                return obj;
            }else{
                return temp;
            }

        case 'U':
            let width = temp.area.length;
            let height = temp.area[0].length;
            //console.log(temp.area);
            let newarea = [];
            for(let i = 0; i < height; i++){
                newarea[i] = [];
                for(let j = 0; j < width; j++){
                    newarea[i][j] = temp.area[j][height - i -1];               //逆时针旋转
                }
            }
            //console.log(newarea);
            obj = {
                id: temp.id,
                edge: temp.edge,
                area: newarea,
                rotateNum: (temp.rotateNum + 1)%getRotateSum(temp.id),
            }
            res = CanNext(obj);
            if(res){
                //console.log(obj);
                return obj;
            }else{
                console.log("rotate failed");
                return temp;
            }

        case 'D':
            obj = {
                id: temp.id,
                edge: [temp.edge[0]+stepSize, temp.edge[1]],
                area: temp.area,
                rotateNum: temp.rotateNum,
            }
            res = CanNext(obj);
            //console.log("try result is "+res);
            if(res){
                return obj;
            }else{
                return null;
            }
    }
}

/**
 *判断试探主体位置是否会冲突
 *
 * @param {试探主体} tryObj
 * @returns
 */
function CanNext(tryObj){
    let globalcol = tryObj.edge[1];
    let width = tryObj.area[0].length;
    if(tryObj.edge[1] < -1 || (globalcol + width) > COLNUM){                //判断两侧是否越界
        return false;
    }
    let globalBottom = tryObj.edge[0];
    if(globalBottom > 19){                                          //判断底端是否越界
        return false;
    }
    if(globalBottom == 19){
        needNext = true;
    }

    return loadGraph(graph, tryObj, "try");
}

/**
 *结束游戏函数
 *
 */
function GameOver(){
    clearTimeout(datafreshId);
    clearInterval(transid);
    document.removeEventListener('keydown', personListener);
    document.removeEventListener('keydown', listener);
}