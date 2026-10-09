console.log("Hello");

const names = document.getElementById("nameinput");
const email = document.getElementById("emailinput");
const submit = document.getElementById("submit");
const form = document.getElementById("contactform");
const output = document.getElementById("Formoutput")
submit.addEventListener("click", (event) => {
    event.preventDefault();
    const el = document.createElement("p")
    el.innerText=names.value
    output.appendChild(el)
    console.log("Submit button clicked!");
    console.log("Name:", names.value);
    console.log("Email:", email.value);
    form.reset()
});