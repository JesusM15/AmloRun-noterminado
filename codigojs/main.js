kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
	clearColor: [0, 0, 0, 1],
})

const MOVE_SPEED = 130
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 440
const ENEMY_SPEED = 20
let LIFE = 2
let isAlive = true

let danger = false
let isBig = false
let isJumping = true
let isFlying = false

loadRoot('img/')
loadSprite("amloRight", "amlosprite.png")
loadSprite("amloLeft", "amlospriteiz.png")
loadSprite("amloJumpR", 'amlospritesalto.png')
loadSprite("superficie", 'superficie.png')
loadSprite("interior", 'interior.png')
loadSprite("diamante", 'diamante.png')
loadSprite("lucky", 'lucky.png')
loadSprite("chayan", 'chayanne.png')
loadSprite("rei", 'reichiquita.png')
loadSprite("anaya", 'anaya.png')



scene("game", ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj' )

    const map = [
        '',
        '',
        's          l  ;d    l',
        'is                              ',
        'ii   ldd                     ;d ',
        'ii                                         c   c   c c c  c   c',
        'ii                                   ssssssssssssssssssssssssss',
        'ii        c   c    c   c           ssiiiiiiiiiiiiiiiiiiiiiiiiii',
        'iissssssssssssssssssssssss  ssss  siiiiiiiiiiiiiiiiiiiiiiiiiiii',
        'iiiiiiiiiiiiiiiiiiiiiiiiii  iiii  iiiiiiiiiiiiiiiiiiiiiiiiiiiii',
        'iiiiiiiiiiiiiiiiiiiiiiiiii  iiii  iiiiiiiiiiiiiiiiiiiiiiiiiiiii',
    ]

    const levelCfg = {
        width: 48,
        height: 48,
        's': [sprite('superficie'), solid()],
        'i': [sprite('interior'), solid()],
        'c': [sprite('anaya'), solid(), 'canalla'],
        'l': [sprite('lucky'), solid(), 'lucky-block'],
        ';': [sprite('lucky'), solid(), 'lucky-chaya'],
        '.': [sprite('lucky'), solid(), 'lucky-coins'],
        'r': [sprite('rei'), solid(), 'rei', body()],
        'd': [sprite('diamante'), solid()],
        'p': [sprite('chayan'), solid(), 'chayanne', body()],
    }
    
    const gameLevel = addLevel(map, levelCfg)

    // add([sprite('bg'), layer("bg")])
    const scoreLabel = add([
        text(score),
        pos(1260, 20),
        layer('ui'),
        {
            value: score,
        },
        scale(2)
    ])


    add([text('Nivel ' + parseInt(level + 1)), pos(20,20), scale(3)])

    //vida
    const salud = (life)=>{
        LIFE = life-1;
        console.log(LIFE)
        if (LIFE > 0){
            return LIFE
        }else{
            go('lose', {score: scoreLabel.value})
        }
    }



    function big(){
        let timer = 0
        let isBig = false
        return{
            update(){
                if (isBig){
                    timer -=dt()
                    if (timer <= 0){
                        this.smallify()
                    }
                }
            },
            isBig(){
                return isBig
            },
            smallify(){
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time){
                this.scale = vec2(2)
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                timer = time
                isBig = true                
            }
        }
    }

    function fly(){
        let temporizador = 0
        let isFlying = false
        return{
            update(){
                if (isFlying){
                    temporizador -=dt()
                    if (temporizador <= 0){
                        this.notfly()
                    }
                }
            },
            isFlying(){
                return isFlying
            },
            notfly(){
                temporizador = 0
                isFlying = false
            },
            flying(time){
                temporizador = time
                isFlying = true                
            }
        }
    }

    const prota = add([
        sprite('amloRight'),
        pos(144,0),
        {
            //derecha por predeterminado
            dir: vec2(1,0)
        },
        body(),
        origin('bot'),
        big(),
        fly()
    ]) 



    prota.flying(10)


    action('rei', (m) =>{
        m.move(20,0)
    })

    action('chayanne', (ch)=>{
        ch.move(24,0)
    })

    const ENEMY_SPEED = 36

    
    action('canalla', (ca)=>{
        distancia = ca.pos.x-prota.pos.x
        if(distancia < 700){
            ca.move(-ENEMY_SPEED, 0)
        }else{
            ca.move(0,0)
        }
    })

    //cabeza del prota choca
    prota.on("headbump", (obj)=> {
        if (obj.is('lucky-block')){
            gameLevel.spawn('r', obj.gridPos.sub(0,2))
            destroy(obj)
        }
        if (obj.is('lucky-chaya')){
            gameLevel.spawn('p', obj.gridPos.sub(0,2))
            destroy(obj)
        }
        if (obj.is('lucky-coins')){
            gameLevel.spawn('v', obj.gridPos.sub(0,2))
            destroy(obj)
        }
    })

    prota.action(()=>{
        prota.resolve()
    })

    prota.collides('rei', (m)=>{
        destroy(m)
        prota.biggify(8)
    })

    prota.collides('chayanne', (cha)=>{
        destroy(cha)
        prota.flying(10)
    })

    prota.collides('canalla', (ca)=>{
        if(isJumping || prota.isBig()){
            destroy(ca)
        }else{
            salud(LIFE)
            ca.pos.x = ca.pos.x+40
            console.log(ca)
        }
    })

    prota.action(()=>{
        camPos(prota.pos)
        if(prota.pos.y >= FALL_DEATH){
            go('lose', {score: scoreLabel.value})
        }
    })

    /*prota.collides('coin', (c)=>{
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })*/

    keyDown('a', ()=>{
        prota.changeSprite("amloLeft")
        prota.move(-MOVE_SPEED, 0)
    })

    keyDown('d', ()=>{
        prota.changeSprite("amloRight")
        prota.move(MOVE_SPEED, 0)
    })

    prota.action(()=>{
        if(prota.grounded()){
            isJumping = false
        }
    })

    prota.action(()=>{
        if(prota.grounded()){
            isJumping = false
        }
    })

    keyPress('space', ()=>{
        if(prota.grounded()){
            isJumping = true
            prota.jump(CURRENT_JUMP_FORCE)
        }
    })

})

scene('lose', ({score})=>{
    add([text('GAME OVER', 32), origin('center'), pos(width()/2, height()/2-100)])
    add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game", {level:0, score:0})