/**
 * Created by tong on 4/8/16.
 */



(function () {
    var magic_char = ' =͟͟͞͞ʕ•̫͡•ʔ';
    var magic_string = new Array(501).join(magic_char);

    $('.magic').each(function (idx) {
        $(this).text(magic_string);
    })


}());