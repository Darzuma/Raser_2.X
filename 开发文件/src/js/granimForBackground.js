export { granimBackground }
let granimBackground = new Granim({
    element: '#bg-road',
    direction: 'top-bottom',
    isPausedWhenNotInView: true,
    image : {
        source: 'bg-road.59bfd283.jpg',
        // source:'bg-road.7f50d1b9.jpg',
        blendingMode: 'multiply'
    },
    states : {
        "default-state": {
            gradients: [
                ['#4b4b4b', '#a0adbd'],
                ['#90a8b4', '#69a6a6'],
                ['#cce4f1', '#636c7c'],
                ['#ffffff', '#666666']
            ],
            transitionSpeed: 9000
        }
    }
});