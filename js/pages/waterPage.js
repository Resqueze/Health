import { mainRef, userStateChanged, round} from '../index.js'
import { waterHistoryChart } from '../charts.js'
import { user } from '../auth.js'

let main = null

let isEditOpen = false
let isEditGoalOpen = false
let isHistoryOpen = false

let bubles = false

export function waterPage() {
    mainRef.innerHTML = '<div class="water-page page"><div class="page-wrapper"><div class="water-info"><label class="recomended"><h2>Рекомендована кількість в день</h2><p><span id="water-recomended">0</span> л</p></label><label class="recomended goal"><h2>Бажана кількість</h2><p class="water-goal-wrapper"><span id="water-goal">0</span> л</p><button class="edit" id="water-edit-goal"><img src="./img/ico/edit.png" alt="edit"></button></label></div><div class="water-options-wrapper"><div class="water-options"><button class="option" value="180" type="button"><img src="./img/ico/cup.png" alt="cup"><p class="subtitle">180 мл</p></button><button class="option" value="250" type="button"><img src="./img/ico/glass.png" alt="glass"><p class="subtitle">250 мл</p></button><button class="option" value="500" type="button"><img src="./img/ico/mug.png" alt="mug" style="transform: rotateY(180deg);"><p class="subtitle">500 мл</p></button><button class="option" value="750" type="button"><img src="./img/ico/jug.png" alt="jug"><p class="subtitle">750 мл</p></button><span class="line"></span><button class="option edit" id="edit" type="button"><img src="./img/ico/edit.png" alt="edit"></button></div></div><div class="main-info"><div class="content"><p class="water-left">Залишилось випити <span id="water-left">0</span> л</p><p >Сьогодні випито <span id="water-done">0</span> л</p></div></div><button type="button" class="history-btn" id="water-history-btn"><img id="chart-img" src="./img/ico/chart.png" alt=""></button></div><div class="water" id="water"><div class="progress" id="main-water-progress"></div><div class="wave" id="wave"></div><div class="bubbles"></div></div></div>';

    main = document.querySelector('.water-page')

    main.innerHTML += ' <div class="popup" id="water-history-popup"> <div class="history-popup"><h2>Статистика</h2><div class="main"><div id="main-water-chart" class="chart"></div><div class="main-footer"><div class="chart-options"> <label class = "chart-option"><input class="option-chart" type="radio" checked name="option" value="7"/><p>7 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="30"/><p>30 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="365"/><p>1 рік</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="0"/><p>Весь час</p></label></div><div class="chart-legend"> <div>Було випито</div><div>Ціль</div></div></div></div></div><div>'

    const percent = (round(user?.water?.current || 0) / round(user?.water?.target || 0)) * 100

    if(percent >= 100) showBubles()
    else if(bubles) removeBubles()

    main.querySelector('.chart-options').addEventListener('click', (e) => {
        const value = document.querySelector('input[name="option"]:checked').value;

        waterHistoryChart(user, +value)
    })

    const options = main.querySelectorAll('.option')
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault()
            const value = +e.currentTarget?.value || 0

            user.water.current += value / 1000
            updatePage()
            userStateChanged()
        })
    })

    main.querySelector('#water-history-btn').addEventListener('click', (e) => {
        showHistory()
    })

    const editButton = main.querySelector('#edit')

    editButton.addEventListener('click', (e) => {
        e.preventDefault()

        isEditOpen = !isEditOpen

        if (isEditOpen) showEdit()
        else removeEdit()
    })

    const editGoalButton = main.querySelector('#water-edit-goal')

    editGoalButton.addEventListener('click', (e) => {
        e.preventDefault()

        const waterGoalWrapper = main.querySelector('.water-goal-wrapper')

        isEditGoalOpen = !isEditGoalOpen

        if (isEditGoalOpen) openEditGoal()
        else removeEditGoal()


        function openEditGoal() {
            isEditGoalOpen = true

            const waterGoal = main.querySelector('#water-goal')
            const waterGoalInput = createGoalInput()

            waterGoalInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return

                e.preventDefault()

                const value = +waterGoalInput.value || 0

                if(value !== 0){
                    user.water.goal = value || 0
                    user.water.target = value || 0
                }
                else{
                    user.water.goal = value || 0
                    user.water.target = user.water.recomended
                }
                
                removeEditGoal()
                userStateChanged()
                updatePage()
           })

            waterGoalWrapper.removeChild(waterGoal)
            waterGoalWrapper.insertAdjacentElement('afterbegin', waterGoalInput)
        }

        function removeEditGoal() {
            isEditGoalOpen = false

            const waterGoalInput = document.querySelector('#water-goal-input')
            waterGoalWrapper.removeChild(waterGoalInput)
            waterGoalWrapper.insertAdjacentElement('afterbegin', createGoal())
        }

        function createGoalInput() {
            const input = document.createElement('input')

            input.type = 'number'
            input.placeholder = "Об'єм"
            input.className = 'input-goal'
            input.id = 'water-goal-input'

            return input
        }

        function createGoal() {
            const span = document.createElement('span')
            span.id = 'water-goal'
            span.innerHTML = round(user?.water?.goal || 0)

            return span
        }
    })

    updatePage()
}

function updatePage() {
    const waterProgress = main.querySelector('#main-water-progress')
    const wave = main.querySelector('#wave')

    const percent = (round(user?.water?.current || 0) / round(user?.water?.target || 0)) * 100

    waterProgress.style.height = `${percent}%`
    wave.style.transform = `translateY(-${((percent - 5) / 100) * main.clientHeight}px)`


    const waterRecomended = main.querySelector('#water-recomended')
    const waterGoal = main.querySelector('#water-goal')

    waterRecomended.innerHTML = round(user?.water?.recomended || 0)
    waterGoal.innerHTML = round(user?.water?.goal || 0)


    const waterDone = main.querySelector('#water-done')
    waterDone.innerHTML = round(user?.water?.current || 0)


    const waterLeft = main.querySelector('#water-left')
    const waterLeftCount = round((user?.water?.target - user?.water?.current) || 0)

    if (waterLeftCount > 0) waterLeft.innerHTML = +waterLeftCount
    else waterLeft.innerHTML = 0

    if (percent < 100) removeBubles()
    else if (!bubles) showBubles()
}

function showHistory(){
    if(isHistoryOpen){
        main.querySelector('.popup').style.opacity = 0
        setTimeout(() => {
            main.querySelector('.popup').style.visibility = 'hidden'
        }, 200);
        
        isHistoryOpen = false
        return
    }
    
    main.querySelector('.popup').style.visibility = 'visible'
    setTimeout(() => {
        main.querySelector('.popup').style.opacity = 1
    }, 50);
    isHistoryOpen = true

    waterHistoryChart(user, 7)
}

function showBubles() {
    bubles = true
    main.querySelector('.bubbles').innerHTML += '<div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div><div class="bubble"></div>'
}

function removeBubles() {
    bubles = false
    main.querySelector('.bubbles').innerHTML = ''
}

function showEdit() {
    const options = document.querySelector('.water-options-wrapper')
    const popup = document.createElement('div')
    popup.className = 'edit-popup'
    isEditOpen = true

    popup.innerHTML = '<input class="edit-input" id="edit-water" type="number" placeholder="Об\'єм (мл)"><div class="edit-options"><button class="edit-option" type="button" id="water-p"><img src="./img/ico/plus.png" alt="plus"></button><button class="edit-option" type="button" id="water-m"><img src="./img/ico/minus.png" alt="minus"></button></div>';
    options.appendChild(popup)

    const input = popup.querySelector('#edit-water')

    popup.querySelector('#water-p').addEventListener('click', (e) => {
        user.water.current += (+input.value) / 1000 || 0
        removeEdit()
        updatePage()
        userStateChanged()
    })

    popup.querySelector('#water-m').addEventListener('click', (e) => {
        if (user.water.current - (+input.value - 1) / 1000 > 0) {
            user.water.current -= (+input.value) / 1000 || 0
            removeEdit()
            updatePage()
            userStateChanged()
        }
    })
}

function removeEdit() {
    const options = document.querySelector('.water-options-wrapper')
    const popup = options.querySelector('.edit-popup')

    popup.classList.add('remove')

    setTimeout(() => {
        options.removeChild(popup)
    }, 500)

    isEditOpen = false
}