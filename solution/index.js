const form = document.querySelector("form");

// disable native validation since we're creating our own with JS
form.setAttribute("novalidate", "");

form.addEventListener("submit", (event) => {
  // check the validity of all inputs: returns true if all valid
  // also fires the "invalid" event on all invalid inputs
  const allInputsValid = event.target.checkValidity();
  if (!allInputsValid) {
    // stop the form submitting if an input is invalid
    event.preventDefault();
  }
});

const messages = {
  email: {
    valueMissing: "Please enter an email.",
    typeMismatch: "Please enter a valid email.",
  },
  password: {
    valueMissing: "Please enter a password.",
    patternMismatch: "Please include at least one letter and one number.",
    tooShort: "Please enter at least 8 characters.",
  },
};

// listen for the invalid event on every input inside the form
const inputs = form.querySelectorAll("input");
inputs.forEach((i) => {
  i.setAttribute("aria-invalid", false);
  i.addEventListener("invalid", handleInvalidInput);
  i.addEventListener("input", clearValidity);
});

function handleInvalidInput(event) {
  const input = event.target;
  input.setAttribute("aria-invalid", true);
  // tells us everything wrong with the input
  // { valueMissing: true, typeMismatch: false } etc
  const validity = input.validity;
  // get the right set of error strings from the object above
  const inputMessages = messages[input.id];
  let message = "";
  if (validity.valueMissing) {
    message = inputMessages.valueMissing;
  } else if (validity.typeMismatch) {
    message = inputMessages.typeMismatch;
  } else if (validity.patternMismatch) {
    message = inputMessages.patternMismatch;
  } else if (validity.tooShort) {
    message = inputMessages.tooShort;
  }
  // error element should directly follow input
  const errorContainer = input.nextElementSibling;
  errorContainer.textContent = message;
}

function clearValidity(event) {
  const input = event.target;
  input.setAttribute("aria-invalid", "false");
  input.nextElementSibling.textContent = "";
}
