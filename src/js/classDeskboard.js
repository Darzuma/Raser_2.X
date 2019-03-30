export { Deskboard }

class Deskboard{
    static initBy(mission){
        setTimeout(function () {
            setGridBoxWidthBy(mission)
            setGridContainerPositionBy(mission)

            setGridPropertiesBy(mission)
            setGridMethods()
            setShadowBoxSizeAndPosition(mission)

            Deskboard.addPatternsBy(mission)
            Animator.playDropBy(mission)
        },100)
    }
    static resetBy(mission){
        this.resetGridsProperties()
        this.addPatternsBy(mission)
        Animator.playDropBy(mission)
    }

    static resetGridsProperties(){ //直接在DOM上修改grid元素属性
        let visibleGrids = document.getElementsByClassName('visible')

        let ids = []
        for(let i=0;i<visibleGrids.length;i++){
            ids.push(visibleGrids[i].patternId)
        }
        ids = disorganize(ids)

        for(let i=0;i<visibleGrids.length;i++){
            if(!visibleGrids[i].isBlock){
                visibleGrids[i].isBlock = true
            }
            visibleGrids[i].classList.remove('rased','drop','hidden')
            visibleGrids[i].patternId = ids.pop()
        }
    }
    static addPatternsBy(mission) {//直接在DOM上加图片
        let adjust = 2
        let grids = document.getElementsByClassName('visible')
        let size  = mission.gridSize - adjust
        for(let i=0;i<grids.length;i++){
            let grid = grids[i]
            let patternId = grid.patternId
            grid.style.backgroundPosition = '0px -' + patternId*size + 'px'
        }
    }
}

function setShadowBoxSizeAndPosition(mission){
    let originGrid = document.getElementById('1:1')
    let cornerGrid = document.getElementById((mission.column - 2) + ':' + (mission.row - 2))
    let padding = 4
    let width = cornerGrid.offsetLeft - originGrid.offsetLeft + originGrid.offsetWidth + padding*2
    let height = cornerGrid.offsetTop - originGrid.offsetTop + originGrid.offsetHeight + padding*2
    let shadowBox = document.getElementById('shadowBox')
    shadowBox.style.width = width + 'px'
    shadowBox.style.height = height + 'px'
    shadowBox.style.left = originGrid.offsetLeft - 4 + 'px'
    shadowBox.style.top  = originGrid.offsetTop  - 4  + 'px'
}

function setGridBoxWidthBy(mission){
    let gridSize = mission.gridSize
    let column = mission.column
    let box = document.getElementById('gridBox')
    box.style.width = gridSize*column + 'px'
}

function setGridContainerPositionBy(mission){
    let box = document.getElementById('gridBox')
    let container = document.getElementById('gridContainer')
    container.style.left = (container.offsetWidth-box.offsetWidth)/2 + 'px'

    let gridSize = mission.gridSize
    let top
    switch(mission.id){
        case 1:
        case 2:
        case 4:
            top = '-' + (gridSize - gridSize/5) + 'px'
            break;
        case 3:
            top = '-' + (gridSize - gridSize/3) + 'px'
            break;
        case 5:
        case 6:
        case 7:
        case 8:
            top = '-' + gridSize + 'px'
            break;
    }
    container.style.top = top
}

function setGridPropertiesBy(mission){
    let container = document.getElementById('gridContainer')
    let gridSize = mission.gridSize
    let grids = document.getElementsByClassName('grid')
    let gridProperties = mission.gridProperties
    for(let i=0;i<grids.length;i++){
        grids[i].x = gridProperties[i].x
        grids[i].y = gridProperties[i].y
        grids[i].coord = [
            container.offsetLeft + grids[i].offsetLeft + gridSize/2,
            container.offsetTop + grids[i].offsetTop + gridSize/2
        ]
        grids[i].isBlock = gridProperties[i].isBlock
        grids[i].patternId = gridProperties[i].patternId
    }
}

function setGridMethods(){
    let visibleGrids = document.getElementsByClassName('visible')
    for(let i=0;i<visibleGrids.length;i++){
        visibleGrids[i].addClass = function(classname){
            this.classList.add(classname)
        }
        visibleGrids[i].removeClass = function(classname){
            this.classList.remove(classname)
        }
    }
}


let Animator = {
    playDropBy(mission){
        let missionNum = mission.id > 6 ? 6 : mission.id
        let grids = disorganize(Array.from(document.getElementsByClassName('visible')))
        let len = grids.length
        let idx = 0

        let interval = 40 - missionNum*5
        let drop = setInterval(function(){
            grids[idx].classList.add('drop')
            idx ++
            if(idx === len){
                clearInterval(drop)
            }
        },interval)
    }
}

function disorganize(arr){
    return arr.sort(function(){ return 0.5 - Math.random() })
}