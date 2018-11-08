/**
 *渲染函数，根据当前全局图表在对应表格上增减数据
 *
 */
function renderThread(){                                      //根据二维数组值来渲染界面,flag代表是否移动结束
    let table = document.getElementById("grid");
    for(let i = 0; i < ROWNUM; i++){
        for(let j = 0; j < COLNUM; j++){
            let value = graph[i][j];
            let color = chooseColor(value);
            table.rows[i].cells[j].style.backgroundColor = color;
        }
    }
    let nexttable = document.getElementById("next-tile");
    for(let i = 0; i < nextGraphROWNUM; i++){
        for(let j = 0; j < nextGraphCOLNUM; j++){
            let value = nextGraph[i][j];
            let color = chooseColor(value);
            nexttable.rows[i].cells[j].style.backgroundColor = color;
        }
    }
    document.getElementById("score").innerHTML = score;
}

function chooseColor(value){
    switch(value){
        case -1:
            //背景色
            return "";
        case 'I':
            return "PaleTurquoise";
        case 'J':
            return "Plum";
        case 'S':
            return "DarkSeaGreen";
        case 'N':
            return "LightCoral";
        case 'O':
            return "Khaki";
        case 'L':
            return "SandyBrown";
        case 'T':
            return "Grey";
    }
}