import Vue from 'vue/dist/vue.js'
import { granimBackground } from "./granimForBackground";
import { missionInfos } from './arrMissionInfos'
import { Deskboard } from "./classDeskboard";
import { pathSeeker } from "./arrPathSeeker";
import { Layer } from "./classLayer";
import { poems } from "./arrPoems";
import { Audio } from "./objAudio";

let Raser = new Vue({
    data:{
        missionNum:1,
        newMission:false,
        missionMaxNum:7,
        failed:false,
        //跟菜单有关项
        showGridContainer:false,
        gridBox:true,
        showUI:false,
        fadeMenu:false,
        frozen:false,
        quiting:false,
        //跟消除有关
        sourceGrid:null,
        targetGrid:null,
        isMatching:null,
        pathPoints:null,

        sound:true,
        music:false,

        //跟计时器有关
        timeStopped:false,

        headUpAvailable:true,
        pausing:false,
        bombIsOn:false,
        bombTarget:null,
        congratulation:false,
        celebration:false,

        fulltime:null,
        mark:null,
        bonusSecondsPerRase:3,
        calcDone:false,
        pulse:true,
        seconds:0,

        rasedPairs:0,

        scorePerAdd:35,
        score:'000000',
        scoreForResult:0,
        temp:null,
    },
    computed:{
        mission(){
            let info = missionInfos[this.missionNum - 1]
            return {
                id:info.id,title:info.title,
                gridSize:info.gridSize,
                gridProperties:info.gridProperties,
                row:info.row,
                column:info.column,
                totalPairs: info.totalPairs,
            }
        },
        timer(){
            let times = 50 + parseInt(this.missionNum*this.missionNum*2)
                if(this.missionNum>6){
                    times += (this.missionNum-6)*60
                }
            // let times = 2
            let delay = 100/times
            return {
                fulltime:times,
                delay:delay
            }
        },
        timeAddedForPausing(){
            return 5 + parseInt(this.missionNum*this.missionNum*0.3)
        }
    },
    watch:{
        seconds(newVal,oldVal){
            if(newVal !== oldVal){
                let width = (100-this.seconds*this.timer.delay) + '%'
                this.$refs.timeBar_right.style.width = width
                this.$refs.timeBar_left.style.width = width
            }
        },
        targetGrid(newGrid,oldGrid){
            if(oldGrid){
                oldGrid.removeClass('selected')
                this.sourceGrid = oldGrid
            }
            newGrid && newGrid.addClass('selected')
            if(newGrid && oldGrid)
                this.isMatching = newGrid.patternId === oldGrid.patternId
        },
        isMatching(newValue){
            if(newValue){
                this.isMatching = null
                this.pathPoints = pathSeeker.getPathPointsFrom(this)
                if(this.pathPoints){
                    let layer = new Layer()
                        layer.drawAndRase(this)
                    this.sourceGrid = this.targetGrid = this.pathPoints = null
                    this.seconds -= this.bonusSecondsPerRase
                    this.score = prefixInteger(parseInt(this.score) + this.scorePerAdd)
                }
            }
        },

        rasedPairs(newValue){
            //进入下一关
            if(newValue === this.mission.totalPairs){
                this.remainingTime = this.timer.fulltime - this.seconds

                if(this.missionNum < this.missionMaxNum){
                    this.showCongratulation()
                }
                else{
                    this.showCelebration()
                }

            }
        },

    },
    methods:{
        selectTarget(event){
            if(!this.bombIsOn){
                if(event.target.isBlock && this.targetGrid !== event.target)
                    this.targetGrid = event.target
            }else{
                //炸弹功能实现
                if(event.target.isBlock){
                    let bombTarget = event.target
                    let patternId = bombTarget.patternId
                    let grids = document.getElementsByClassName('visible')
                    for(let i=0;i<grids.length;i++){
                        if(grids[i].isBlock && bombTarget !== grids[i] && grids[i].patternId === patternId){
                            bombTarget.isBlock = grids[i].isBlock = false
                            if(this.sound){
                                Audio.rase.currentTime = 0
                                Audio.rase.play()
                                Audio.ticking.pause()
                            }
                            bombTarget.addClass('rased')
                            grids[i].addClass('rased')
                            this.bombIsOn = false
                            this.rasedPairs ++
                            this.seconds += this.timeAddedForPausing*1.2
                            break
                        }
                    }

                }
            }

        },
        switchBomb(){
            if(this.headUpAvailable){
                let time = this.timer.fulltime - this.seconds
                if( time > this.timeAddedForPausing*2 + 1){
                    this.bombIsOn = !this.bombIsOn
                    if(this.sound){
                        if(this.bombIsOn)
                            Audio.ticking.play()
                        else
                            Audio.ticking.pause()
                    }
                }
            }
        },
        toggleMusic(){
            this.music = !this.music
            if(this.music){
                Audio.bgm.volume = 0
                Audio.bgm.play()
                let musicOn = setInterval(function(){
                    if(Audio.bgm.volume >= 0.3)
                        clearInterval(musicOn)
                    else
                        Audio.bgm.volume += 0.05
                },100)
            }else{
                let musicOff = setInterval(function(){
                    if(Audio.bgm.volume <= 0.1){
                        Audio.bgm.pause()
                        clearInterval(musicOff)
                    }
                    else
                        Audio.bgm.volume -= 0.1
                },100)
            }
        },
        toggleSound(){this.sound = !this.sound},
        restartMission(){
            if(this.headUpAvailable){
                if(this.sound){
                    Audio.restart.currentTime = 0
                    Audio.restart.play()
                }

                this.gridBox = true
                this.seconds = 0
                this.rasedPairs = 0
                Deskboard.resetBy(this.mission)

                if(!this.frozen){
                    this.timeStopped = true
                    this.frozen = true
                    Raser.startTimerIn(1500)

                    setTimeout(function(){
                        Raser.frozen = false
                    },2000)

                }
                if(!this.frozen){
                    let minus = Raser.scorePerAdd/2
                    let score = parseInt(this.score)
                    let calc = setInterval(function(){
                        if(score === Raser.scoreForResult){
                            clearInterval(calc)
                            Raser.frozen = false
                            return false
                        }
                        score -= minus
                        Raser.score = prefixInteger(parseInt(score))
                    },50)
                }

            }
        },
        startMission(){
            if(this.sound)
                Audio.restart.play()
            Deskboard.initBy(this.mission)
            this.timeStopped = true
            this.seconds = 0
            this.rasedPairs = 0
            Raser.startTimerIn(1000)
        },
        showCongratulation(){
            if(this.sound){
                Audio.rase.currentTime = 0
                Audio.rase.play()
            }
            this.mark = Math.ceil((this.timer.fulltime - this.seconds)/this.timer.fulltime*100)
            this.scoreForResult = parseInt(this.score)
            this.timeStopped = true

            this.gridBox = false
            this.headUpAvailable = false
            this.congratulation = true

            setTimeout(function(){
                let calc = setInterval(function(){
                    Raser.scoreForResult += Raser.mark
                    Raser.score = prefixInteger(Raser.scoreForResult)
                    Raser.seconds ++
                    if(Raser.seconds === Raser.timer.fulltime){
                        clearTimeout(calc)
                        setTimeout(function(){
                            if(Raser.sound)
                                Audio.score.play()
                            Raser.calcDone = true
                        },800)
                    }
                },50)
            },800)
        },
        goNextMission(){
            if(this.missionNum===8)
                this.missionNum = 1
            else
                this.missionNum ++
            this.gridBox = true
            this.headUpAvailable = true
            this.congratulation = false
            this.calcDone = false

            this.startMission()
        },
        showCelebration(){
            if(this.sound){
                Audio.rase.currentTime = 0
                Audio.rase.play()
            }

            this.mark = Math.ceil((this.timer.fulltime - this.seconds)/this.timer.fulltime*100)
            this.scoreForResult = parseInt(this.score)
            this.timeStopped = true

            this.gridBox = false
            this.headUpAvailable = false

            //隐藏UI的代码,只能用JS写了，没时间优化
            {
                let y = 0
                let translateY = setInterval(function () {
                    y -= 5
                    Raser.$refs.UI.style.top= y +'px'
                    if(y <= -90){
                        clearInterval(translateY )
                    }
                },20)
            }

            setTimeout(function(){
                Raser.celebration = true
            },1000)
            setTimeout(function(){
                Raser.$refs['celebration_poem'].innerHTML = disorganize(poems)[0]
            },2000)
            setTimeout(function(){
                let calc = setInterval(function(){
                    Raser.scoreForResult += Raser.mark
                    Raser.score = prefixInteger(Raser.scoreForResult)
                    Raser.seconds ++
                    if(Raser.seconds === Raser.timer.fulltime){
                        clearTimeout(calc)
                        setTimeout(function(){
                            if(Raser.sound)
                                Audio.score.play()
                            Raser.calcDone = true
                        },800)
                    }
                },50)
            },6000)
        },
        closeCelebration(){
            this.$refs.celebration.style.transform='scale(0)'
            setTimeout(function(){
                Raser.celebration = false
                Raser.$refs.UI.style.top='0'
                Raser.goNextMission()
            },1100)

        },
        switchPulse(){
            this.pulse = !this.pulse
        },
        showFailMessage(){
            if(this.quiting){
                this.quiting = false
                this.gridBox = true
                this.headUpAvailable = true
            }
            if(this.sound)
                Audio.fail.play()
            this.temp = '$' + parseInt(this.score)
            this.headUpAvailable = false
            this.failed = true
            this.gridBox = false

        },
        tryAgain(){
            this.headUpAvailable = true
            this.failed = false
            this.temp = null
            this.restartMission()

            let minus = Raser.scorePerAdd/2
            let score = parseInt(this.score)
            let calc = setInterval(function(){
                if(score === Raser.scoreForResult){
                    clearInterval(calc)
                    Raser.frozen = false
                    return false
                }
                score -= minus
                Raser.score = prefixInteger(parseInt(score))
            },50)

        },
        quitAsk(){
            if(this.sound)
                Audio.open.play()
            if(this.headUpAvailable){
                this.gridBox = false
                this.quiting = true
                this.headUpAvailable = false

                let grids = document.getElementsByClassName('rased')
                for(let i=0;i<grids.length;i++){
                    grids[i].classList.add('hidden')
                }
            }
        },
        yesQuit(){
            if(this.sound)
                Audio.open.play()
            this.quiting = false
            this.fnShowMenu()
            this.gridBox = true
            this.seconds = 0
            this.headUpAvailable = true

            this.score='000000'
            this.scoreForResult = 0
            this.missionNum = 1
        },
        noQuit(){
            if(this.sound)
                Audio.drop.play()
            this.quiting = false
            this.gridBox = true
            this.headUpAvailable = true
        },
        pause(){
            if(this.sound)
                Audio.open.play()
            let time = this.timer.fulltime - this.seconds
            if( this.headUpAvailable && time > this.timeAddedForPausing + 2){
                this.headUpAvailable = false
                this.timeStopped = true
                this.seconds += this.timeAddedForPausing

                let grids = document.getElementsByClassName('rased')
                for(let i=0;i<grids.length;i++){
                    grids[i].classList.add('hidden')
                }

                this.gridBox = false
                this.pausing = true
            }

        },
        unPause(){
            this.headUpAvailable = true
            this.pausing = false
            this.gridBox = true
            this.startTimerIn(500)
            if(this.sound)
                Audio.drop.play()
        },
        fnShowMenu(){
            this.timeStopped = true
            this.showGridContainer = false
            this.fadeMenu = !this.fadeMenu
            this.showUI = false
            this.$refs.menu.style.display = 'block'
        },
        fnHideMenu(){
            if(!this.frozen){
                this.$refs.root.style.pointerEvents = 'none'
                this.frozen = true
                this.fadeMenu = !this.fadeMenu
                setTimeout(function(){
                    Raser.showUI = true
                    Raser.$refs.menu.style.display = 'none'
                    Raser.frozen = false
                },800)
                setTimeout(function(){
                    Raser.showGridContainer = true
                    Raser.startMission()
                },1700)
                setTimeout(function(){
                    Raser.$refs.root.style.pointerEvents = 'auto'
                },2000)
            }

        },
        stopTimer(){
            this.timeStopped = true
        },
        startTimerIn(duration){
            setTimeout(function(){
                console.log('开始计时')
                Raser.timeStopped = false
                let interval = setInterval(function(){
                    if(Raser.seconds >= Raser.timer.fulltime || Raser.timeStopped){
                        clearTimeout(interval)
                        if(Raser.seconds >= Raser.timer.fulltime){
                            Raser.showFailMessage()
                        }
                    console.log('结束计时')
                    }
                    else{
                        Raser.seconds ++
                    }},1000)
            },duration)
        }
    },

}).$mount('#Raser')




function disorganize(arr){
    return arr.sort(function(){ return 0.5 - Math.random() })
}
function prefixInteger(num,length=6) {
    return (Array(length).join('0') + num).slice(-length);
}



