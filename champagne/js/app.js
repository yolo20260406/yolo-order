document
    .getElementById("image")
    .addEventListener("change", previewImage);

document
    .getElementById("sendBtn")
    .addEventListener("click", send);

function send(){

    const text =
        document.getElementById("txt")
            .value;

    document
        .getElementById("result")
        .innerHTML=
        "入力内容："+text;

}

function previewImage(){

    const file=
        document
            .getElementById("image")
            .files[0];

    if(!file){
        return;
    }

    const reader=
        new FileReader();

    reader.onload=function(e){
        const img= document.getElementById("preview");
        img.src= e.target.result;
        img.style.display="block";

    }

    reader.readAsDataURL(file);
}