export { pathSeeker }

let pathSeeker = [null,null]
    pathSeeker.pathPoints = null


pathSeeker.getPathPointsFrom = function(dataOption){

    [pathSeeker[0],pathSeeker[1]] = [
        dataOption.sourceGrid,
        dataOption.targetGrid
    ]
    if(!this.pathPoints)
        this.pathPoints = null
    this.tryFeasiblePaths()
    return this.pathPoints

}
pathSeeker.tryFeasiblePaths = function(){
        this.isStraightFeasible()
        || this.isAngleFeasible()
        || this.isRectFeasible()
}
pathSeeker.isStraightFeasible = function(){
    let [a,b] = this
    if((a.x === b.x || a.y === b.y) && this.try(this)){
        this.pathPoints = [a,b]
        return true
    }
    return false
}
pathSeeker.isAngleFeasible = function(){
    let [a,b] = this
    let [id$1,id$2] = [a.x+':'+b.y,b.x+':'+a.y]
    let [grid$1,grid$2] = [getGrid(id$1),getGrid(id$2)]
    if(grid$1 && !grid$1.isBlock && this.try([a,grid$1]) && this.try([grid$1,b])){
        this.pathPoints = [a,grid$1,b]
        return true
    }
    if(grid$2 && !grid$2.isBlock && this.try([a,grid$2]) && this.try([grid$2,b])){
        this.pathPoints = [a,grid$2,b]
        return true
    }
    return false
}
pathSeeker.isRectFeasible  = function (){
    let [a,b] = this
    let arrTempGrids = []
    let x,y
    // 找出所有与 a 点直线相通的点---------------------
    [x,y]  = [a.x-1,a.y]
    while(getGrid(x+':'+y)){
        let grid = getGrid(x+':'+y)
        if(!grid.isBlock){
            this[1] = grid
            if(this.isStraightFeasible())
                arrTempGrids.push(grid)
        }
        x--
    }
    [x,y]  = [a.x+1,a.y]
    while(getGrid(x+':'+y)){
        let grid = getGrid(x+':'+y)
        if(!grid.isBlock){
            this[1] = grid
            if(this.isStraightFeasible())
                arrTempGrids.push(grid)
        }
        x++
    }
    [x,y] = [a.x,a.y-1]
    while(getGrid(x+':'+y)){
        let grid = getGrid(x+':'+y)
        if(!grid.isBlock){
            this[1] = grid
            if(this.isStraightFeasible())
                arrTempGrids.push(grid)
        }
        y--
    }
    [x,y] = [a.x,a.y+1]
    while(getGrid(x+':'+y)){
        let grid = getGrid(x+':'+y)
        if(!grid.isBlock){
            this[1] = grid
            if(this.isStraightFeasible())
                arrTempGrids.push(grid)
        }
        y++
    }
    // ---------------------------------------------
    this[1] = b
    this.pathPoints = null
    for(let i=0;i<arrTempGrids.length;i++){
        this[0] = arrTempGrids[i]
        if(this.isAngleFeasible()){
            this.pathPoints.unshift(a)
            this[0] = a
            return true
        }
    }
    return false
}

pathSeeker.try = function(arr){
    let [a,b] = arr
    let feasible = true
    let direction = a.y === b.y ? 'horizontal':'vertical'
    switch(direction){
        case 'horizontal':
            if(a.x > b.x) [a,b] = [b,a]
            for(let x=a.x+1;x<b.x;x++){
                if(getGrid(x+':'+a.y).isBlock){
                    feasible = false
                    break
                }
            }
            break
        case 'vertical':
            if(a.y > b.y) [a,b] = [b,a]
            for(let y=a.y+1;y<b.y;y++){
                if(getGrid(a.x+':'+y).isBlock){
                    feasible = false
                    break
                }
            }
            break
    }
    return feasible
}


function getGrid(id){
    return document.getElementById(id)
}