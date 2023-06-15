import { user } from '../auth.js'
import { weightHistoryChart } from '../charts.js'
import { Health } from '../health.js'
import { mainRef, round, userStateChanged } from '../index.js'

let isHistory = true
let isStat = false

export function weightPage(){
    isHistory = true
    isStat = false

    mainRef.innerHTML = '<div class="weight-page page"><div class="weight-info"><label class="recomended goal"><h2>Поточна</h2><h3><p id="weight-current">0</p><span>кг</span></h3><button class="edit" id="weight-edit-current"><img src="./img/ico/edit.png" alt="edit"></button></label><label class="recomended"><h2>Рекомендована</h2><h3><p id="weight-recomended">0</p><span>кг</span></h3></label><div class="info"><div class="col"><div class="item">Мінімальна: <div id="min-w"></div><p>кг</p></div><div class="item">Максимальна: <div id="max-w"></div><p>кг</p></div></div><div class="col"><div class="item">ІМТ: <div id="BMI"></div></div></div></div><label class="recomended goal"><h2>Бажана</h2><h3><p id="weight-goal">0</p><span>кг</span></h3><button class="edit" id="weight-edit-goal"><img src="./img/ico/edit.png" alt="edit"></button></label></div><div class="main"><div class="main-btns"><input id="history" type="radio" checked name="menu" /><label for="history">Історія</label><input id="stat" type="radio" name="menu" /><label for="stat"> Статистика</label></div></div>'

    updatePage()
    
    mainRef.querySelectorAll('input[name="menu"]').forEach(el => el.addEventListener('click', (e) => {
        const page = mainRef.querySelector('input[name="menu"]:checked').id
        
        if(page === 'history') {isHistory = true; isStat = false}
        else {isHistory = false; isStat = true}
        
        updatePage()
    }))
    
    const editWC = mainRef.querySelector('#weight-edit-current')
    const editWG = mainRef.querySelector('#weight-edit-goal')
    
    let isEditGoalOpen = false
    let isEditCurrentOpen = false
    
    editWG.addEventListener('click', (e) => {

        if (!isEditGoalOpen) openEditGoal()
        else removeEditGoal()

        function openEditGoal() {
            isEditGoalOpen = true

            const goalInput = createGoalInput()

            goalInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return

                const value = +goalInput.value || 0

                if(value !== 0){
                    user.weight.goal = value || 0
                    user.weight.target = value || 0
                }
                else{
                    user.weight.goal = value || 0
                    user.weight.target = user.weight.recomended
                }
                
                removeEditGoal()
                userStateChanged()
                updatePage()
           })

            const goal = mainRef.querySelector('#weight-goal')

            goal.insertAdjacentElement('beforebegin', goalInput)
            goal.remove()
        }

        function removeEditGoal() {
            isEditGoalOpen = false

            const weightGoalInput = document.querySelector('#weight-goal-input')
            weightGoalInput.insertAdjacentElement('beforebegin', createGoal())
            weightGoalInput.remove()
        }

        function createGoalInput() {
            const input = document.createElement('input')

            input.type = 'number'
            input.className = 'input-goal'
            input.id = 'weight-goal-input'

            return input
        }

        function createGoal() {
            const p = document.createElement('p')
            p.id = 'weight-goal'
            p.innerHTML = round(user?.water?.goal || 0)

            return p
        }
    })

    
    editWC.addEventListener('click', (e) => {

        if (!isEditCurrentOpen) openEditCurrent()
        else removeEditCurrent()

        function openEditCurrent() {
            isEditCurrentOpen = true

            const currentInput = createCurrentInput()

            currentInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return

                const value = +currentInput.value || 0

                if(value !== 0) user.weight.current = value || 0
                
                removeEditCurrent()
                userStateChanged()
                updatePage()
           })

            const current = mainRef.querySelector('#weight-current')

            current.insertAdjacentElement('beforebegin', currentInput)
            current.remove()
        }

        function removeEditCurrent() {
            isEditCurrentOpen = false

            const weightCurrentInput = document.querySelector('#weight-current-input')
            weightCurrentInput.insertAdjacentElement('beforebegin', createCurrent())
            weightCurrentInput.remove()
        }

        function createCurrentInput() {
            const input = document.createElement('input')

            input.type = 'number'
            input.className = 'input-goal'
            input.id = 'weight-current-input'

            return input
        }

        function createCurrent() {
            const p = document.createElement('p')
            p.id = 'weight-current'
            p.innerHTML = round(user?.weight?.current || 0)

            Health.countBMI(user)

            user.weight.min = Math.min(user.weight.min, user.weight.current)
            user.weight.max = Math.max(user.weight.max, user.weight.current)

            return p
        }
    })
}

function updatePage(){
    const minW = mainRef.querySelector('#min-w')
    const maxW = mainRef.querySelector('#max-w')
    const BMI = mainRef.querySelector('#BMI')
    
    const recomendedW = mainRef.querySelector('#weight-recomended')
    const currentW = mainRef.querySelector('#weight-current')
    const goalW = mainRef.querySelector('#weight-goal')
    
    currentW.innerHTML = round(user?.weight?.current || 0)
    recomendedW.innerHTML = round(user?.weight?.recomended || 0)
    goalW.innerHTML = round(user?.weight?.goal || 0)
    
    minW.innerHTML = round(user?.weight?.min || 0)
    maxW.innerHTML = round(user?.weight?.max || 0)
    BMI.innerHTML = round(user?.weight?.BMI || 0)
    
    if(isHistory){
        try{ mainRef.querySelector('.history').remove();  } catch(e){ }
        try{ mainRef.querySelector('.stat').remove() } catch(e){ }
        
        const h = []
        const history = user?.history || {}
        
        const date = new Date()
        date.setHours(0,0,0,0)
        
        history[date.getTime()] = { weight: user.weight }
        
        for(const key in  history){
            const el = history[key]
            
            if(+key > date.getTime()) continue
            
            h.push({ val: el?.weight, time: +key })
        }
        
        h.sort((a, b) => a.time - b.time)    
        
        let cw = 0
        const newH = []
        for(const el of h ){
            const w = +el.val?.current || 0
            
            if(cw === w) continue
            
            newH.push({ val: el.val, time: el.time })
            
            cw = w
        }
        
        mainRef.querySelector('.main').insertAdjacentHTML('beforeend', '<div class="history"></div>')
        
        newH.forEach(el => historyItem(el))
    } 
    else if( isStat ){
        try{ mainRef.querySelector('.stat').remove() } catch(e){ }
        try{ mainRef.querySelector('.history').remove();  } catch(e){ }
    
        mainRef.querySelector('.main').insertAdjacentHTML('beforeend', '<div class="stat"> <div id="main-weight-chart" class="chart"></div> <div class="footer"><div class="chart-options"> <label class = "chart-option"><input class="option-chart" type="radio" checked name="option" value="7"/><p>7 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="30"/><p>30 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="365"/><p>1 рік</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="0"/><p>Весь час</p></label></div><div class="chart-legend"> <div>Вага</div><div>Ціль</div></div></div></div>')
            
        weightHistoryChart(user, 7)
        mainRef.querySelector('.chart-options').addEventListener('click', (e) => {
            const value = document.querySelector('input[name="option"]:checked').value;
            
            weightHistoryChart(user, +value)
        })
    }
    
    paintBMI()
}

let prev = null

function historyItem(w){
    const history = mainRef.querySelector('.history')

    const date = new Date(w.time)

    const arrowG = prev == null || (Math.abs(w.val.current - w.val.target) < Math.abs(prev.current -  w.val.target))
    const arrowUP = prev == null || (w.val.current > prev.current) ? true : false

    history.insertAdjacentHTML('afterbegin', `<div class="item"><div class="col"><div class="time">${date.toLocaleDateString("uk-UA", {year: 'numeric', month: 'long', day: 'numeric'})}</div><div class="history-info"><div class="info-item bmi"><p>ІМТ</p><span id="BMI">${round(w.val?.BMI || 0)}</span></div><div class="info-item fat"><p>Різниця (кг)</p><span>${round(w.val.current - prev?.current || 0)}</span></div></div></div><div class="weight"><div class="arrow ${arrowUP && "up"} ${arrowG ? "g" : "r"}"></div><span>${round(w.val?.current || 0)}</span><p>кг</p></div></div>`)
    
    prev = {
        current: w.val.current,
        target: w.val.target
    }
}

function paintBMI(){
    const BMI = document.querySelectorAll('#BMI')

    BMI.forEach(el => {
        const bmi = +el.innerHTML || 0
    
        if(bmi === 0) el.style.color = 'white'
        else if(bmi < 18.5 || bmi > 30) el.style.color = 'red'
        else if(bmi >= 18.5 && bmi <= 25) el.style.color = 'green'
        else if(bmi > 25 && bmi <= 30) el.style.color = 'orange'
    })
}