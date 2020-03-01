module.exports = function (time) {
    var formatDate = new Date(time);
    var myYear = formatDate.getFullYear();
    var myMonth = formatDate.getMonth() + 1;
    var myDate = formatDate.getDate();
    var myHours = formatDate.getHours();
    var myMinutes = formatDate.getMinutes()
    var mySeconds = formatDate.getSeconds();

    function add0(num) {
        return 0 <= num && num <= 9 ? ('0' + num) : String(num);
    }
    return formatDate = String(myYear) + '-' + add0(myMonth) + '-' + add0(myDate) + ' ' + add0(myHours) + ':' + add0(myMinutes) + ':' + add0(mySeconds);
}