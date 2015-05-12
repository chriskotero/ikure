$(function() {	//handles logout
        $("#logout").on("click",function() {
            window.localStorage.clear();
            window.location = "index.html";
        });
});