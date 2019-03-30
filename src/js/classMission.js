export { Mission }

class Mission{
    constructor({id, title, gridSize, row, column, patternPairs}){
        this.id = id
        this.title = title
        this.gridSize = gridSize
        this.row = row
        this.column = column
        this.totalPairs = (row-2)*(column-2)/2
        this.patternPairs = patternPairs

        this.gridProperties = this.createGridProperties()
        this.createPatternIdsForVisibleGrids()
    }
    createGridProperties(){
        let arr = []
        let row = this.row
        let col = this.column
        for(let i=0;i<row;i++){
            for(let j=0;j<col;j++){
                let x = j
                let y = i
                let isBlock = !(y === 0 || y === row-1 || x === 0 || x=== col-1)
                arr.push({
                    x:x,
                    y:y,
                    id:x + ':' + y,
                    classList : ['grid','mission_'+this.id,isBlock?'visible':'invisible'],
                    innerHTML : '('+ x + ',' + y + ')' + '<br>',
                    isBlock : isBlock,
                    isVisible: isBlock
                })
            }
        }
        return arr
    }
    createPatternIdsForVisibleGrids(disorganized=true){
        let total = this.patternPairs*2
        let grids = []
        for(let i=0;i<this.gridProperties.length;i++){
            if(this.gridProperties[i].isBlock)
                grids.push(this.gridProperties[i])
        }
        let idx = 1
        let ids = []
        while(ids.length < grids.length){
            for(let i=0;i<total;i++)
                ids.push(idx)
            idx ++
        }
        if(ids.length > grids.length)
            ids = ids.slice(0,grids.length)
        if(disorganized)
            ids = this.disorganize(ids)
        for(let i=0;i<grids.length;i++){
            grids[i].patternId = ids[i]
            grids[i].innerHTML += ids[i]
        }
    }
    disorganize(arr){
        return arr.sort(function(){ return 0.5 - Math.random() })
    }
}