
class TreeNode{

    constructor(value){
        this.childs = [];
        this.value = value;
        this.lastChild = null;
    }

    getValue(){
        return this.value;
    }

    addChild(node){
        this.childs.push(node)
        this.lastChild = node;
    }

    getLastChildValue(){
        if (this.lastChild == null){
            return this.value;
        }
        return this.lastChild.value;
    }

    numberOfChilds(){
        return this.childs.length
    }

    toJSON(){
        return{
            name:     this.value,
            children: this.childs
        }
    }

}