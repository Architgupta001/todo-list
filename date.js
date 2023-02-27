module.exports = function() {
    let options = {
        weekday: 'long' 
    }
    let today = new Date();
    let currentDay = today.toLocaleDateString("hi-IN", options)
    return currentDay
}