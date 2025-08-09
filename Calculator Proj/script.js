let dislplay = document.getElementById("display");

function appendValue(value) {
    dislplay.value += value;
}

function clearDisplay(){
    dislplay.value = '';
}

function deleteLast() {
    dislplay.value = dislplay.value.slice(0,-1);
}

function calculateResult() {
    try{
        dislplay.value = eval(dislplay.value);
    } 
    catch(e){
        dislplay.value = 'Error';
    }
}