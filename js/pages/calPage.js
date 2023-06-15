import { user } from '../auth.js'
import { calHistoryChart } from '../charts.js'
import { FoodAPI } from '../foodAPI.js'
import { mainRef, round, userStateChanged } from '../index.js'

let isStatOpen = false
let isHistoryOpen = false

export function calPage() {
    mainRef.innerHTML = `<div class="cal-page page"><div class="food-info"><label class="recomended"><h2>Рекомендована кількість в день</h2><h3><p id="food-recomended">0</p><f>ккал</f></h3></label><label class="recomended goal"><h2>Бажана кількість</h2><h3><p id="food-goal">0</p><f>ккал</f></h3><button class="edit" id="food-edit-goal"><img src="./img/ico/edit.png" alt="edit"></button></label></div><div class="main-info"><div class="line"><div class="search"><input class="input" type="text" id="input-name" autofocus placeholder="Назва продукту"><div class="food-select"><div class="info" id="select-info">Назва <span>Ккал</span></div><div class="food-select-options"> </div> </div></div><div class="weight"><input class="input" type="number" id="input-weight" placeholder="Вага (г)"></div><button type="button" class="eat-btn" id="eat-btn">З'їсти</button></div><div class="line"><div class="unit"> <h3>Калорії (ккал):</h3><span class="span" id="span-cal">0</span> </div><div class="unit"> <h3>Білки (г):</h3><span class="span" id="span-prot">0</span> </div><div class="unit"> <h3>Жири (г):</h3><span class="span" id="span-fat">0</span> </div><div class="unit"> <h3>Вуглеводи (г):</h3><span class="span" id="span-carb">0</span> </div></div></div><div class="cal-btns"><button type="button" class="history-btn" id="cal-history-btn"><img id="chart-img" src="./img/ico/clock.png" alt=""></button><button type="button" class="history-btn" id="cal-stat-btn"><img id="chart-img" src="./img/ico/chart.png" alt=""></button></div></div></div>`

    const main = mainRef.querySelector('.cal-page')

    main.innerHTML += ' <div class="popup" id="stat-popup"> <div class="history-popup"><h2>Статистика</h2><div class="main"><div id="main-cal-chart" class="chart"></div><div class="main-footer"><div class="chart-options"> <label class = "chart-option"><input class="option-chart" type="radio" checked name="option" value="7"/><p>7 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="30"/><p>30 д.</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="365"/><p>1 рік</p></label><label class = "chart-option"><input class="option-chart" type="radio" name="option" value="0"/><p>Весь час</p></label></div><div class="chart-legend"> <div>Було вжито</div><div>Ціль</div></div></div></div></div><div>'
    main.innerHTML += ' <div class="popup" id="history-popup"> <div class="history-popup"><h2>Історія</h2><div class="main"><div class="history"></div></div></div><div>'


    calHistoryChart(user, 7)
    main.querySelector('.chart-options').addEventListener('click', (e) => {
        const value = document.querySelector('input[name="option"]:checked').value;

        calHistoryChart(user, +value)
    })

    const statBtn = main.querySelector('#cal-stat-btn')
    const historyBtn = main.querySelector('#cal-history-btn')

    statBtn.addEventListener('click', statHandler)
    historyBtn.addEventListener('click', historyHandler)

    const eatBtn = mainRef.querySelector('#eat-btn')

    const search = mainRef.querySelector('.search')

    const weight = mainRef.querySelector('#input-weight')

    const inputName = mainRef.querySelector('#input-name')
    let autoWEL = true
    let spanCal = mainRef.querySelector('#span-cal')
    let spanProt = mainRef.querySelector('#span-prot')
    let spanFat = mainRef.querySelector('#span-fat')
    let spanCarb = mainRef.querySelector('#span-carb')

    let isEditGoal = false
    let isSelectOpen = false
    mainRef.querySelector('#food-edit-goal').addEventListener('click', editGoalHandler)

    inputName.addEventListener('input', (e) => autoWEL = false)

    function editGoalHandler(e) {
        const foodEditGoal = mainRef.querySelector('#food-goal')

        if (isEditGoal) {
            foodEditGoal.insertAdjacentHTML('afterbegin', `<p id="food-goal">${round(user?.cal?.goal || 0)}</p>`)
            foodEditGoal.querySelector('#food-goal').addEventListener('click', editGoalHandler)
            mainRef.querySelector('#food-edit-goal-input').remove()
            isEditGoal = false
        } else {
            foodEditGoal.innerHTML = ''
            foodEditGoal.insertAdjacentHTML('afterbegin', '<input type="number" id="food-edit-goal-input">')

            const input = foodEditGoal.querySelector('#food-edit-goal-input')
            input.focus()

            input.addEventListener('keydown', (e) => {
                if (e.key == 'Enter') {
                    user.cal.goal = +e.target.value || 0

                    if (user.cal.goal !== 0) user.cal.target = user.cal.goal
                    else user.cal.target = user.cal.recomended

                    userStateChanged()

                    input.remove()
                    foodEditGoal.innerHTML = round(user.cal.goal || 0)
                    isEditGoal = false
                }
            })
            isEditGoal = true
        }
    }

    mainRef.querySelectorAll('span').forEach(span => span.addEventListener('click', spanHandler))

    function inputHandler(e) {
        const val = e.target.value || 0

        if (e.key == 'Enter') {
            e.target.blur()
        }
        else if (e.type == 'blur') {
            e.target.insertAdjacentHTML('afterend', `<span class="span" id="${"span-" + e.target.id.split('-')[1]}">${val}</span>`)
            e.target.remove()
            mainRef.querySelector(`#${"span-" + e.target.id.split('-')[1]}`).addEventListener('click', spanHandler)

            try {
                spanCal = mainRef.querySelector('#span-cal')
                spanProt = mainRef.querySelector('#span-prot')
                spanFat = mainRef.querySelector('#span-fat')
                spanCarb = mainRef.querySelector('#span-carb')
            } catch (e) { }
        }
    }

    function spanHandler(e) {
        const cSpan = e.currentTarget

        const input = document.createElement('input')
        input.type = 'number'
        input.className = 'input'
        input.id = 'input-' + e.currentTarget.id.split('-')[1]
        input.style.maxWidth = '5ch'

        cSpan.insertAdjacentElement('afterend', input)

        input.addEventListener('keydown', inputHandler)
        input.addEventListener('blur', inputHandler)
        input.focus()

        cSpan.remove()
    }

    eatBtn.addEventListener('click', (e) => {
        const name = inputName.value || ''

        const cal = +spanCal.innerHTML || 0
        const w = +weight.value || 0

        const prot = +spanProt.innerHTML || 0
        const fat = +spanFat.innerHTML || 0
        const carb = +spanCarb.innerHTML || 0

        if (!name || !cal || !prot || !fat || !carb || !w) return

        user.cal.current += cal
        user.cal.prot += prot
        user.cal.fat += fat
        user.cal.carb += carb

        const meal = {
            name: name,
            cal: cal / (w / 100),
            prot: prot / (w / 100),
            fat: fat / (w / 100),
            carb: carb / (w / 100),
            weight: w,
            time: new Date().getTime()
        }

        user.cal.meals.push(meal)
        user.allMeals.push(meal)

        inputName.value = ''
        weight.value = ''

        spanCal.innerHTML = '0'
        spanCarb.innerHTML = '0'
        spanFat.innerHTML = '0'
        spanProt.innerHTML = '0'

        userStateChanged()
    })

    const foodSelect = mainRef.querySelector('.food-select')
    const foodSelectOptions = mainRef.querySelector('.food-select-options')

    inputName.addEventListener('blur', (e) => {
        setTimeout(() => {
            isSelectOpen = false

            foodSelect.style.height = 0
            foodSelect.style.opacity = 0
        }, 200)
    })
    
    inputName.addEventListener('focus', (e) => {
        isSelectOpen = true

        foodSelect.style.height = "auto"
        foodSelect.style.opacity = 1

        printFoodSelectOptions(e.target.value)
    })

    inputName.addEventListener('input', (e) => {
        const query = e.target.value
        printFoodSelectOptions(query)
    })
    
    function printFoodSelectOptions(query) {
        const products = FoodAPI.getFood(query)
        foodSelectOptions.innerHTML = ''

        products.forEach(prod => {
            foodSelectOptions.innerHTML += `<div><p>${prod.name}</p><span>${round(+prod.cal || 0)}</span></div>`
        })

        foodSelectOptions.querySelectorAll('div').forEach(el => el.addEventListener('click', (e) => {
            const query = e.currentTarget.querySelector('p')?.innerHTML || null

            if (!query) return

            const meal = FoodAPI.getFood(query)[0]
            passData(meal)
            autoWEL = true

            weight.addEventListener('input', (e) => {
                const val = +e.target.value || 0
                if (autoWEL) passData(meal, val)
            })
        }))
    }

    function passData(meal, w = 100) {
        weight.value = w

        inputName.value = meal.name

        spanCal.innerHTML = round(meal.cal * (+weight.value / 100))
        spanProt.innerHTML = round(meal.prot * (+weight.value / 100))
        spanFat.innerHTML = round(meal.fat * (+weight.value / 100))
        spanCarb.innerHTML = round(meal.carb * (+weight.value / 100))

        isSelectOpen = false
        foodSelect.style.height = 0
        foodSelect.style.opacity = 0
    }

    updatePage()
}

function statHandler(e) {
    isHistoryOpen = false

    if (!isStatOpen) {
        mainRef.querySelector('#history-popup').style.visibility = "hidden"
        mainRef.querySelector('#stat-popup').style.visibility = "visible"
    }
    else {
        mainRef.querySelector('#stat-popup').style.visibility = "hidden"
    }

    isStatOpen = !isStatOpen
}

function historyHandler(e) {
    isStatOpen = false

    if (!isHistoryOpen) {
        mainRef.querySelector('#stat-popup').style.visibility = "hidden"
        mainRef.querySelector('#history-popup').style.visibility = "visible"
    }
    else {
        mainRef.querySelector('#history-popup').style.visibility = "hidden"
    }

    isHistoryOpen = !isHistoryOpen
    updatePage()
}

function updatePage() {
    const foodRecomended = mainRef.querySelector('#food-recomended')
    const foodGoal = mainRef.querySelector('#food-goal')

    foodRecomended.innerHTML = round(user?.cal?.recomended || 0)
    foodGoal.innerHTML = round(user?.cal?.goal || 0)

    if (!isHistoryOpen) return

    const h = user?.history || {}
    const harr = []
    const history = mainRef.querySelector('.history')

    history.innerHTML = ''

    for (const tkey in h) {
        const cal = h[tkey].cal?.meals || []

        if (cal.length) harr.push(...cal)
    }

    harr.push(...user.cal.meals)

    harr.sort((a, b) => a?.time - b?.time)

    harr.forEach(c => addHistoryItem(c))

    history.querySelectorAll(".delete-btn").forEach(b => {
        b.addEventListener('click', async e => {
            e.preventDefault()

            const item = e.currentTarget.parentElement.parentElement

            const time = item.dataset.time

            let i = -1

            user.cal.meals.forEach((el, j) => { if (+el.time === +time) { i = j; return } })

            if (i >= 0) {
                const meal = user.cal.meals[i]

                user.cal.current -= meal.cal * (meal.weight / 100)
                user.cal.prot -= meal.prot * (meal.weight / 100)
                user.cal.fat -= meal.fat * (meal.weight / 100)
                user.cal.carb -= meal.carb * (meal.weight / 100)

                if (user.cal.current < 0) user.cal.current = 0
                if (user.cal.prot < 0) user.cal.prot = 0
                if (user.cal.fat < 0) user.cal.fat = 0
                if (user.cal.carb < 0) user.cal.carb = 0

                user.cal.meals.splice(i, 1)

                await userStateChanged()
                updatePage()
                return
            }
            else if (i === -1) {
                let t = 0;

                for (const tkey in user.history) {
                    const meals = user.history[tkey].cal?.meals || []

                    meals.forEach((el, j) => { if (+el.time === +time) { i = j; t = tkey; return } })
                }

                if (i >= 0) {
                    const meal = user.history[t].cal.meals[i]
                    user.history[t].cal.current -= meal.cal * (meal.weight / 100)

                    user.history[t].cal.current -= meal.cal * (meal.weight / 100)
                    user.history[t].cal.prot -= meal.prot * (meal.weight / 100)
                    user.history[t].cal.fat -= meal.fat * (meal.weight / 100)
                    user.history[t].cal.carb -= meal.carb * (meal.weight / 100)

                    if (user.history[t].cal.current < 0) user.cal.current = 0
                    if (user.history[t].cal.prot < 0) user.cal.prot = 0
                    if (user.history[t].cal.fat < 0) user.cal.fat = 0
                    if (user.history[t].cal.carb < 0) user.cal.carb = 0

                    user.history[t].cal.meals.splice(i, 1)

                    await userStateChanged()
                    updatePage()
                    return
                }
            }
        })
    })
}

function addHistoryItem(item) {
    let date = new Date(item.time)

    const history = mainRef.querySelector('.history')
    const w = item.weight / 100
    history.insertAdjacentHTML('afterbegin', `<div class="item" data-time="${item.time}" title="Білки: ${round(item.fat * w)}г\nЖири: ${round(item.fat * w)}г\nВуглеводи: ${round(item.carb * w)}г"><div class="col"><div class="time">${date.toLocaleDateString("uk-UA", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div><div class="history-info"><div class="info-item name"><span>${item?.name || "-"}</span></div></div></div><div class="col"><div class="weight"><span>${round(+item?.weight || 0)}</span><p>г</p></div><div class="weight"><span>${round((+item?.cal * +item?.weight / 100) || 0)}</span><p>ккал</p></div><button type="button" class="delete-btn"><img src="./img/ico/binb.png" alt="del"></button></div>`)
}