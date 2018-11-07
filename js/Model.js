/**
 *方块枚举类
 *
 * @param id:方块类型
 * @param rotateSum：方块旋转的总类型数
 * @param model：方块形状
 * @class Model
 */
class Model{
    constructor(id){
        this.id = id;
        switch(id){
            case 'I':
                this.model = [
                    [id],
                    [id],
                    [id],
                    [id],
                ];
                this.rotateSum = 2;
                break;
            case 'J':
                this.model = [
                    [-1, id],
                    [-1, id],
                    [id, id],
                ];
                this.rotateSum = 4;
                break;
            case 'L':
                this.model = [
                    [id, -1],
                    [id, -1],
                    [id, id],
                ];
                this.rotateSum = 4;
                break;
            case 'O':
                this.model = [
                    [id, id],
                    [id, id],
                ];
                this.rotateSum = 1;
                break;
            case 'N':
                this.model = [
                    [-1, id],
                    [id, id],
                    [id, -1],
                ];
                this.rotateSum = 2;
                break;
            case 'S':
                this.model = [
                    [id, -1],
                    [id, id],
                    [-1, id],
                ];
                this.rotateSum = 2;
                break;
            case 'T':
                this.model = [
                    [id, id, id],
                    [-1, id, -1],
                ];
                this.rotateSum = 4;
                break;
        }
    }
    getId(){
        return this.id;
    }
    getModel(){
        return this.model;
    }
    

}

function getRotateSum(id){
    switch(id){
        case 'I':
            return 2;
        case 'J':
            return 4;
        case 'L':
            return 4;
        case 'O':
            return 1;
        case 'N':
            return 2;
        case 'S':
            return 2;
        case 'T':
            return 4;
    }
}

Model.L = new Model('L');
Model.I = new Model('I');
Model.J = new Model('J');
Model.O = new Model('O');
Model.N = new Model('N');
Model.S = new Model('S');
Model.T = new Model('T');

Object.freeze(Model);