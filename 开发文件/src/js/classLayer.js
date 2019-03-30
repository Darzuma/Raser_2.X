export { Layer }
import { Audio } from "./objAudio";

class Layer{
    constructor(){
        this.canvas = document.createElement('canvas')
        this.canvas.setAttribute('width','800')
        this.canvas.setAttribute('height','600')
        Raser.appendChild(this.canvas)

        this.context = this.canvas.getContext('2d')
        this.context.strokeStyle = '#00eaff'
        this.context.lineCap = 'round'
        this.context.lineJoin = 'round'
        this.context.lineWidth = '3'
    }

    drawLine(context,[x1,y1],[x2,y2],duration){
        let interval = 20
        let steps = (duration/interval)
        let stepX = (x2 - x1)/steps
        let stepY = (y2 - y1)/steps
        let [x,y] = [x1,y1]
        let draw = setInterval(function(){
            context.beginPath()
            context.moveTo(x,y)
            context.lineTo(x+stepX,y+stepY)
            context.stroke()
            x += stepX
            y += stepY
            steps --
            if(steps === 0){
                clearInterval(draw)
            }
        },interval)
    }

    getCoords(pathPoints){
        let coords = []
        for(let i=0;i<pathPoints.length;i++)
            coords.push(pathPoints[i].coord)
        return coords
    }

    drawAndRase(data){
        let layer   = this.canvas
        let brush   = this
        let context = this.context

        let pathPoints = this.getCoords(data.pathPoints)
        let sourceGrid = data.sourceGrid
        let targetGrid = data.targetGrid

        sourceGrid.isBlock = targetGrid.isBlock = false

        let duration = 100
        for(let i=0;i<pathPoints.length-1;i++){
            setTimeout(function(){
                brush.drawLine(context,pathPoints[i],pathPoints[i+1],duration)
            },duration*i)

            if(i === pathPoints.length - 2){
                setTimeout(function(){
                    if(data.sound){
                        Audio.rase.currentTime = 0
                        Audio.rase.play()
                    }
                    sourceGrid.addClass('rased')
                    targetGrid.addClass('rased')
                    Raser.removeChild(layer)
                    data.rasedPairs ++
                },duration*(i+1)+80)
            }

        }

    }
}

function disorganize(arr){
    return arr.sort(function(){ return 0.5 - Math.random() })
}


