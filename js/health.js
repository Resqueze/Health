
export class Health {
    static setRecomendedWeight(user) {
        user.weight.recomended = 23 * ((user.height/100) * (user.height/100))
        user.weight.target = user.weight.goal !== 0 ? user.weight.goal : user.weight.recomended

        return user.weight.recomended
    }
    
    static setRecomendedWater(user){
        user.water.recomended = user.weight.current * 0.03
        user.water.target = user.water.goal !== 0 ? user.water.goal : user.water.recomended

        return user.water.recomended
    }
    
    static setRecomendedCal(user){
        user.cal.recomended = user.sex === 'male' ? 
            user.weight.current * 10 + 6.25 * user.height - 5 * user.age + 5:
            user.weight.current * 10 + 6.25 * user.height - 5 * user.age - 161

        user.cal.target = user.cal.goal !== 0 ? user.cal.goal : user.cal.recomended
        
        return user.cal.recomended
    }

    static countBMI(user){
        user.weight.BMI = user.weight.current / ((user.height/100) * (user.height/100))
        
        return user.weight.BMI
    }
}