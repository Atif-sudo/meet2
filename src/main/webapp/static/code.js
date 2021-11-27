function submitSignupForm(){
    var userName = $("#signup-email").val();
    var password = $('#signup-password').val();
    var fullName = $("#signup-username").val();

    if(userName === '' || password === '' || fullName === ''){
        $("#signup-error").text("One or more fields empty");
        $("#signup-error").show();
    }

}
function submitLoginForm() {
    var userName = $("#login-email").val();
    var password = $("#login-password").val();

    if (userName === '' || password === '') {
        $("#login-error").text("One or more fields empty");
        $("#login-error").show();
    }
}