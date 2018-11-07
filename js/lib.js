/**
 *从图表上操作对象，或移除，或添加，或比较
 *
 * @param {操作的图表} graph
 * @param {操作的主体对象} Obj
 * @param {操作类型} dest
 * @returns
 */
function loadGraph(graph, Obj, dest){
    if(Obj == null){
        return false;
    }
    let width = Obj.area[0].length;
    let globalBottom = Obj.edge[0];
    if(globalBottom > 19){                                          //判断底端是否越界
        return false;
    }
    let globalTop = globalBottom - Obj.area.length + 1;
    let localTop = 0;
    if(globalTop < 0){
        localTop = -globalTop;
        globalTop = 0;
    }
    let height;
    if((globalBottom - globalTop+1) > Obj.area.length){
        height = Obj.area.length;
    }else {
        height = globalBottom - globalTop + 1;
    }
    for(let i = 0; i < height; i++){
        let localrows = Obj.area[localTop+i];
        let globalrows = graph[globalTop+i];
        //console.log('adding' + i +'row');
        for(let j = 0; j < width; j++){
            if(localrows[j] == -1){
                //console.log('it is -1');
                continue;
            }else{
                switch(dest){
                    case "removePre":
                        if(localrows[j] == globalrows[j+Obj.edge[1]]){
                            //console.log(globalrows[7]);
                            //console.log("shanchule" + globalrows[j+Obj.edge[1]]+ "cihang haiyou" + globalrows);
                            globalrows[j+Obj.edge[1]] = -1;
                            //console.log(globalrows[7]);
                            //return true;
                            //document.getElementById("grid").rows[i].cells[j].style.backgroundColor = chooseColor(-1);
                            //console.log("xianzai shi " + globalrows);
                        }else{
                            //console.log("error,删除时 ["+(globalTop+i)+","+((j+Obj.edge[1])+"] 对比失败"+ globalrows[j+Obj.edge[1]])+"   "+localrows[j]);
                            return false;
                        }
                        break;
                    case "addCurrent":
                        //console.log('adding ' + j +'col');
                        if(globalrows[j+Obj.edge[1]] == -1){
                            globalrows[j+Obj.edge[1]] = localrows[j];
                            //console.log('true');
                            //console.log("加入成功");
                        }else{
                            //console.log("error,加入时 ["+(globalTop+i)+","+((j+Obj.edge[1])+"] 加入失败"));
                            //console.log(globalrows[j+Obj.edge[1]]);
                            //console.log('false');
                            return false;
                        }
                        break;
                    case "try":
                        if(globalrows[j+Obj.edge[1]] != -1){
                            return false;
                        }
                        break;   
                }
            }
        }
    }
    return true;
}

/**
 *简化图表，尝试消行
 *
 * @param {所要操作的图表} graph
 * @returns 消去的行数
 */
function simplifyGraph(graph){
    //console.log("addsocre has start");
    let row = 19;
    let removeRows = 0;
    for(let i = graph.length-1; i >= 0; row--){
        if(row >= 0){
            let removeFlag = true;
            for(let j = 0; j < graph[row].length; j++){
                if(graph[row][j] == -1){
                    removeFlag = false;
                }
            }
            if(removeFlag){
                continue;
            }else{
                if(row != i){
                    graph[i] = graph[row];
                }
                i--;
            }
        }else{
            removeRows++;
            graph[i] = Array.apply(null,Array(15)).map(function(v, i){        //返回15个0的数组
                return -1;
            });
            i--;
        }
    }
    return removeRows;
    //console.log("has added score");
}

/**
 *深拷贝整个数组
 *
 * @param {数组对象} obj
 * @returns 拷贝生成的对象
 */
function deepcopy(obj) {
    let out = [],i = 0,len = obj.length;
    for (; i < len; i++) {
        if (obj[i] instanceof Array){
            out[i] = deepcopy(obj[i]);
        }
        else out[i] = obj[i];
    }
    return out;
}

/**
 *AI程序
 *
 * @param {前台传输来的JSON数据} message
 * @returns 计算的结果，即AI的选择
 */
function AI(message){
    let suitation = message;
    //console.log(suitation);
    logger.debug(suitation);
    let result;
    let rotateNum = 0;
    let id = suitation.id;
    //console.log(suitation);
    switch(id){
        case 'I':
            //console.log('this is i id');
            rotateNum = 2;
            result = generateValue(suitation, rotateNum);
            break;
        case 'J':
            //console.log('this is j id');
            rotateNum = 4;
            result = generateValue(suitation, rotateNum);
            break;
        case 'L':
            //console.log('this is L id');
            rotateNum = 4;
            result = generateValue(suitation, rotateNum);
            break;
        case 'O':
            //console.log('this is o id');
            rotateNum = 1;
            result = generateValue(suitation, rotateNum);
            break;
        case 'S':
            //console.log('this is s id');
            rotateNum = 2;
            result = generateValue(suitation, rotateNum);
            break;
        case 'N':
            //console.log('this is n id');
            rotateNum = 2;
            result = generateValue(suitation, rotateNum);
            break;
        case 'T':
            //console.log('this is t id');
            rotateNum = 4;
            result = generateValue(suitation, rotateNum);
            break;     
    }
    //console.log(result);
    let max = result[0];
    for(item of result){
        //console.log(item);
        if(item.evalution > max.evalution){
            max = item;
        }
        if(item.evalution == max.evalution){
            if(item.coord[1] < max.coord[1]){
                max = item;
            }
        }
    }
    return max;
}

/**
 *遍历各种旋转，各种初始位置的函数
 *
 * @param {当前主体的id，位置等信息} suitation
 * @param {方块的方向} rotateNum
 * @returns 每种情况的结果的汇总
 */
function generateValue(suitation, rotateNum){
    let result = [];
    let tmppattern = suitation.pattern;
    let tmpmodel = suitation.shape;
    for(let i = 0; i < rotateNum; i++){
        for(let j = 0; j <= tmppattern[0].length - tmpmodel[0].length; j++){
            let res = Try(deepcopy(tmppattern), deepcopy(tmpmodel), [0, j]);       //TODO 可以用Map，不必都要重新生成新pattern
            result.push({
                rotateNum: i,
                evalution: res,
                coord: [0, j],
            })
        }
        tmpmodel = rotate(tmpmodel);
    }
    //console.log(result);
    return result;
}

/**
 *逆旋转函数
 *
 * @param {原数组} Obj
 * @returns 逆时针旋转后的数组
 */
function rotate(Obj){
    let newObj = [];
    let width = Obj.length;
    let height = Obj[0].length;
    for(let i = 0; i < height; i++){
        newObj[i] = [];
        for(let j = 0; j < width; j++){
            newObj[i][j] = Obj[j][height - i -1];               //逆时针旋转
        }
    }
    return newObj;
}

/**
 *图表操作主体函数
 *
 * @param {当前图表} tempFigure
 * @param {当前主体的形状} tempShape
 * @param {当前主体的位置} tempCoord
 * @returns 操作完成后图表的局势评估函数值
 */
function Try(tempFigure, tempShape, tempCoord){
    let tempObj = {
        edge: tempCoord,
        area: tempShape,
    }
    while(true){
        res = loadGraph(tempFigure, tempObj, "try");
        if(res){
            tempObj.edge[0]++;
        }else{
            break;
        }
    }
    tempObj.edge[0]--;
    loadGraph(tempFigure, tempObj, "addCurrent");
    //console.log(tempFigure);
    //console.log(tempObj);
    return evaluteFigure(tempFigure, tempObj);
}

/**
 *图表局势评估函数
 *
 * @param {当前图表} Figure
 * @param {当前主体} tempObj
 * @returns 评估函数值
 */
function evaluteFigure(Figure, tempObj) {
    let eliminatedRows = simplifyGraph(Figure);
    return -4.500158825082766*getLandingHeight(Figure, tempObj) +
            3.4181268101392694*eliminatedRows + 
            -3.2178882868487753*getRowsTransitions(Figure) + 
            -9.348695305445199*getColsTransitions(Figure) + 
            -7.899265427351652*getHolesSum(Figure) + 
            -3.3855972247263626*getWellsSum(Figure);
}

/**
 *计算行高
 *
 * @param {图表} Figure
 * @param {主体} tempObj
 * @returns
 */
function getLandingHeight(Figure, tempObj){
    return Figure.length - 1 - tempObj.edge[0] + tempObj.area.length/2;
}
/**
 *计算行交换
 *
 * @param {图表} Figure
 * @returns
 */
function getRowsTransitions(Figure){
    let rowsTransitionSum = 0;
    for(let i = Figure.length - 1; i >= 0; i--){
        let preEle = Figure[i][0];
        let rowstrans = 0;
        for(let j = 1; j < Figure[0].length; j++){
            if(Figure[i][j] != preEle){
                rowstrans++;
                preEle = Figure[i][j];
            }
        }
        if(rowstrans == 0 && preEle == -1){
            break;
        }
        rowsTransitionSum = rowsTransitionSum + rowstrans;
    }
    return rowsTransitionSum;
}
/**
 *计算列交换
 *
 * @param {图表} Figure
 * @returns
 */
function getColsTransitions(Figure){
    let colsTransitionSum = 0;
    for(let i = 0; i < Figure[0].length; i++){
        let preEle = Figure[Figure.length - 1][i];
        let coltrans = 0;
        for(let j = Figure.length - 2; j >= 0; j--){
            if(Figure[j][i] != preEle){
                coltrans++;
                preEle = Figure[j][i];
            }
        }
        colsTransitionSum = colsTransitionSum + coltrans;
    }
    return colsTransitionSum;
}
/**
 *计算洞的总数
 *
 * @param {图表} Figure
 * @returns
 */
function getHolesSum(Figure){
    let holesSum = 0;
    let firstNorZero = [];
    for(let i = 0; i < Figure[0].length; i++){
        let flag = false;
        for(let j = 0; j < Figure.length; j++){
            if(Figure[j][i] != -1){
                firstNorZero.push(j);
                flag = true;
                break;
            }
        }
        if(!flag){
            firstNorZero.push(-1);
        }
    }
    for(let i = 0; i < Figure[0].length; i++){
        let holesnum = 0;
        let limit = firstNorZero[Figure[0].length - 1 - i];
        if(limit == -1){
            continue;
        }
        for(let j = Figure.length - 1; j > limit; j--){
            if(Figure[j][i] == -1){
                holesnum++;
            }
        }
        holesSum = holesSum + holesnum;
    }
    return holesSum;
    
}

/**
 *计算所有井的深度
 *
 * @param {图表} Figure
 * @returns
 */
function getWellsSum(Figure){
    let wellsSum = 0;

    let firstwells = 0;
    for(let j = Figure.length-1; j >= 0; j--){
        if(Figure[j][0] == -1){
            if(Figure[j][1] != -1){
                firstwells++;
            }else{
                if(firstwells > 1){
                    wellsSum = wellsSum + firstwells;
                }
                firstwells = 0;
            }
        }else{
            if(firstwells > 1){
                wellsSum = wellsSum + firstwells;
            }
            firstwells = 0;
        }
    }

    let lastwells = 0;
    for(let j = Figure.length -1; j >= 0; j--){
        if(Figure[j][Figure[0].length - 1] == -1){
            if(Figure[j][Figure[0].length -2] != -1){
                lastwells++;
            }else{
                if(lastwells > 1){
                    wellsSum = wellsSum + lastwells;
                }
                lastwells = 0;
            }
        }else{
            if(lastwells > 1){
                wellsSum = wellsSum + lastwells;
            }
            lastwells = 0;
        }
    }

    for(let i = 1; i < Figure[0].length - 1; i++){
        let wells = 0;
        for(let j= Figure.length - 1; j >=0; j--){
            if(Figure[j][i] == -1){
                if(Figure[j][i-1] != -1 && Figure[j][i+1] != -1){
                    wells++;
                }else{
                    if(wells > 1){
                        wellsSum = wellsSum + wells;
                    }
                    wells = 0;
                }
            }else{
                if(wells > 1){
                    wellsSum = wellsSum + wells;
                }
                wells = 0;
            }
        }
    }
    //console.log('the well sum is ' + wellsSum);
    return wellsSum;
}

module.exports = {
    loadGraph: loadGraph,
    simplifyGraph: simplifyGraph,
    deepcopy: deepcopy,
}