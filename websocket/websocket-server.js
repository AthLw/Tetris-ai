var lib = require('../js/lib.js');
//const log4js = require('log4js');
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer( { port: 8081 } );
var datanum = 0;

// log4js.configure({
//     appenders: {
//       file: {
//         type: 'file',
//         filename: 'tetris.log',
//         layout: {
//           type: 'pattern',
//           pattern: '%r %p - %n%m%n',
//         }
//       }
//     },
//     categories: {
//       default: {
//         appenders: ['file'],
//         level: 'debug'
//       }
//     }
//   })
  
//   const logger = log4js.getLogger()

//收到信息，计算后返回

server.on("connection", function(ws){
    console.log('connection success!');
    ws.on("message", function(message){
        datanum++;
        console.log('the server has received the ' + datanum + ' data');
        let res = AI(JSON.parse(message));
        ws.send(JSON.stringify(res));
        console.log("the ai's solution is " + JSON.stringify(res));
    })
})

/**
 *AI程序
 *
 * @param {前台传输来的JSON数据} message
 * @returns 计算的结果，即AI的选择
 */
function AI(message){
    let suitation = message;
    //console.log(suitation);
    //logger.debug(suitation);
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
            let res = Try(lib.deepcopy(tmppattern), lib.deepcopy(tmpmodel), [0, j]);       //TODO 可以用Map，不必都要重新生成新pattern
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
    //logger.debug('this is beforeobj：' + JSON.stringify(tempObj));
    while(true){
        res = lib.loadGraph(tempFigure, tempObj, "try");
        if(res){
            tempObj.edge[0]++;
        }else{
            break;
        }
    }
    tempObj.edge[0]--;
    //logger.debug('this is tempobj: ' + JSON.stringify(tempObj));
    lib.loadGraph(tempFigure, tempObj, "addCurrent");
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
    let eliminatedRows = lib.simplifyGraph(Figure);
    let landingheight = getLandingHeight(Figure, tempObj);
    let rowstransition = getRowsTransitions(Figure);
    let colstransition = getColsTransitions(Figure);
    let holesum = getHolesSum(Figure);
    let wellsum = getWellsSum(Figure);
    //logger.debug('this is landingheight ' + landingheight);
    //logger.debug('this is rowstransition ' + rowstransition);
    //logger.debug('this is colstransition ' + colstransition);
    //logger.debug('this is holesum' + holesum);
    //logger.debug('this is wellsum ' + wellsum);
    let eva = (-6.500158825082766*landingheight) +
            (3.4181268101392694*eliminatedRows) + 
            (-5.2178882868487753*rowstransition) + 
            (-9.348695305445199*colstransition) + 
            (-7.899265427351652*holesum) + 
            (-13.3855972247263626*wellsum);
    //logger.debug('this is evalutaion: ' + eva);
    return eva;
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
        for(let j = Figure.length - 2; j >= 0; --j){
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
            firstNorZero.push(20);
        }
    }
    for(let i = 0; i < Figure[0].length; i++){
        let holesnum = 0;
        let limit = firstNorZero[i];
        if(limit == 20){
            continue;
        }
        for(let j = Figure.length - 1; j > limit; --j){
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
    for(let j = Figure.length -1; j >= 0; --j){
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
