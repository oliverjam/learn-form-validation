# Learn form validation

In this workshop you'll learn how to validate user input in the browser and present error messages accessibly.

![Final solution](https://user-images.githubusercontent.com/9408641/90390317-09ebb000-e083-11ea-9bc5-06b465207690.png)

## Setup

1. Clone this repo
1. Open `workshop/index.html` in your browser
1. This is the form we'll be adding validation to

## Why validate in the browser?

Client-side validation is important for a good user experience—you can quickly give the user feedback when they need to change a value they've entered. For example if passwords must be a certain length you can tell them immediately, rather than waiting for the form to submit to the server and receive an invalid response.

You _should not_ rely entirely on client-side validation however. You can never trust anything that happens in the browser: users can use devtools to mess with attributes and elements to bypass validation. You **always** need to validate user input on the server as well, for security.

## Communicating requirements

Our form has two inputs: one for an email address and one for a password. These are the requirements we need to validate:

1. Both values are present
1. The email value is a valid email address
1. The password contains at least one number, and is at least 8 characters long

Before we actually implement validation we need to make sure the user is aware of the requirements. There's nothing more frustrating than trying to guess what you need to do to be able to submit a form.

### Required values

Users generally expect required fields to be [marked with an asterisk](https://www.nngroup.com/articles/required-fields/). We can add one inside the `<label>`. However this will cause screen readers to read out the label as "email star", which is not correct. We should wrap the asterisk in an element with `aria-hidden="true"` to ensure it isn't read out.

### Different types of value

If we don't list our password requirements users will have to guess what they are.

We can add a `<div>` with this information after the label, but this won't be associated with the input (which means screen readers will ignore it).

We need to use the [`aria-describedby`](https://developer.paciellogroup.com/blog/2018/09/describing-aria-describedby/) attribute on the input. This attribute takes the IDs of other elements that provide additional info. This will link our div to the input so screen readers read out the extra info as if it were part of the label.

#### Challenge

1. Add a visual required indicator to both inputs.
1. Add instructions containing our password requirements
1. Associate the instructions with the input using `aria-describedby`

<details>
<summary>Solution</summary>

```html
<label for="password">
  Password
  <span aria-hidden="true">*</span>
</label>
<div id="passwordRequirements">
  Passwords must contain at least one letter and one number, and contain at
  least 8 characters.
</div>
<input id="password" aria-describedby="passwordRequirements" />
```

</details>

If you inspect the password input in Chrome's devtools you should be able to see the accessible name (from the label) and description (from the div) in the "Accessibility tab".

![Accessibility tab example](https://user-images.githubusercontent.com/9408641/78671737-99b06f00-78d7-11ea-8afa-bf4c13fea6ae.png)

## HTML5 validation

Now we need to tell the user when they enter invalid values. Browsers support pretty complex validation on inputs:

```html
<input type="email" required />
```

When a form containing the above input is submitted the browser will validate both that the user entered a value (because of the `required`) _and_ that the value is an email (because of the `type="email"`).

We can even specify a regex the value must match using the `pattern` attribute. This input will be invalid if it contains whitespace characters:

```html
<input type="text" pattern="\S" />
```

Here's a [full list of validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Intrinsic_and_basic_constraints).

You can even style inputs based on their validity using CSS pseudo-classes like `:invalid`, `:valid` and `:required`.

### Challenge

Ensure each input meets our validation requirements above. If you submit the form with invalid values the browser should stop the submission and show a warning.

<details>
<summary>Hint if you don't like regexp</summary>

Here's a regular expression for validating that a string contains at least one number: `.*\d.*`

</details>

<details>
<summary>Solution</summary>

```html
<input id="email" type="email" required />
<!-- ... labels etc -->
<input
  id="password"
  type="password"
  aria-describedby="passwordRequirements"
  required
  pattern=".*\d.*"
  minlength="8"
/>
```

</details>

### Advantages

- Very simple to implement
- Works without JavaScript

### Disadvantages

- Cannot style the error messages
- [Not exposed to most screen readers](https://adrianroselli.com/2019/02/avoid-default-field-validation.html)
- Inputs are marked invalid before the user types anything
  - E.g. `input:invalid { border-color: red; }` will mark a `required` input red straight away

## Custom validation

The advantage of _starting_ with the HTML5 validation attributes is that if our JS fails to load or breaks the user at least gets basic validation.

First we need to disable the native validation by setting the `novalidate` attribute on the form element. This prevents the built-in errors from appearing.

Then we can listen for the form's `submit` event and check whether any inputs are invalid using `formElement.checkValidity()`.

This method returns true if _all_ inputs are valid, otherwise it returns false. If any of the inputs are invalid we want to call `event.preventDefault()` to stop the form from submitting.

### Challenge

1. Open `workshop/index.js`
1. Disable the native form validation
1. Listen for submit events and check whether all the inputs are valid
   - If they are not prevent the form from submitting

<details>
<summary>Solution</summary>

```js
const form = document.querySelector("form");
form.setAttribute("novalidate", "");

form.addEventListener("submit", (event) => {
  const allInputsValid = form.checkValidity();
  if (!allInputsValid) {
    event.preventDefault();
  }
});
```

</details>

## Handling invalid inputs

We need to communicate whether inputs are valid or invalid to assistive tech. The `aria-invalid` attribute does this. Each input should have `aria-invalid="false"` set at first, since the user hasn't typed anything yet. We'll update it to true when the input fails validation.

The `checkValidity()` method causes inputs that failed validation to fire an `invalid` event. We can add event listeners for this to our inputs, allowing us to run custom JS to show the right error message.

```js
inputElement.addEventListener("invalid", handleInvalidInput);
```

The final step is showing a validation message depending on what type of validation error occurred. We can access the default browser message via the `input.validationMessage` property. E.g. for a `required` input this might be `"Please fill out this field"`.

### Challenge

1. Get a reference to all the inputs
1. Mark each input as valid
1. For each input listen for the `invalid` event
1. Mark the input as _invalid_ and log its validation message

<details>
<summary>Hint</summary>

You can access the element that triggered an event using `event.target` inside the event handler function.

</details>

<details>
<summary>Solution</summary>

```js
const inputs = form.querySelectorAll("input");

inputs.forEach((input) => {
  input.setAttribute("aria-invalid", false);
  input.addEventListener("invalid", handleInvalidInput);
});

function handleInvalidInput(event) {
  const input = event.target;
  input.setAttribute("aria-invalid", true);
  console.log(input.validationMessage);
}
```

</details>

## Showing the validation message

We need to put the validation message on the page so the user knows what they did wrong. The message should be associated with the correct input: we want it to be read out by a screen reader when the user focuses the input.

We can achieve this using `aria-describedby` just like with our password requirements. It can take multiple IDs for multiple descriptions (the order of the IDs determines the order they will be read out).

```html
<input id="email" type="email" aria-describedby="emailError" required />
<div id="emailError">Please enter an email address</div>
```

Whenever this input is focused a screen reader will read out the label first, then the type of input, then any description. So in this case something like "Email, required invalid data, edit text. (pause) Please enter an email address".

### Challenge

1. Create a div to contain the message
1. Set attributes on the input and div so they are linked together
1. Put the validation message inside the div so the user can read it

<details>
<summary>Solution</summary>

```html
<!-- lots of stuff removed to simplify example -->

<input id="email" aria-describedby="emailError" />
<div id="emailError"></div>

<input id="password" aria-describedby="passwordRequirements passwordError" />
<div id="passwordError"></div>
```

```js
function handleInvalidInput(event) {
  // ...
  const errorId = input.id + "Error";
  const errorContainer = form.querySelector("#" + errorId);
  errorContainer.textContent = input.validationMessage;
}
```

</details>

## Re-validating

Right now it's a little confusing for the user as the input stays marked invalid even when they type something new. We should mark each input as valid and remove the error message when the user inputs something.

1. Add an event listener for `input` events
1. Mark the input valid and remove the error message

<details>
<summary>Solution</summary>

```js
inputs.forEach((input) => {
  // ...
  input.addEventListener("input", clearValidity);
});

function clearValidity(event) {
  const input = event.target;

  input.setAttribute("aria-invalid", false);

  const errorId = input.id + "Error";
  const errorContainer = form.querySelector("#" + errorId);
  errorContainer.textContent = "";
}
```

</details>

## Styling

We have a functional, accessible solution now, but it could be improved with some styling. It's common to style validation messages with a "danger" colour like red, and sometimes to mark invalid inputs with a different coloured border. You could also use warning icons to make errors even more obvious.

### Challenge

1. Style the error messages
1. Style invalid inputs
1. Add any other styles you like to make it look good

<details>
<summary>Hint</summary>

You can target elements in CSS by their attributes:

```css
div[some-attribute="true"] {
  color: red;
}
```

</details>

<details>
<summary>Solution</summary>

```css
/* lots of styles omitted for clarity */

input[aria-invalid="true"] {
  border-color: hsl(340, 70%, 50%);
}

.error {
  margin-top: 0.5rem;
  color: hsl(340, 70%, 50%);
}
```

</details>

![initial solution](https://user-images.githubusercontent.com/9408641/90390223-e4f73d00-e082-11ea-8b29-19a208cbda95.png)

## Stretch: custom messages

The default browser messages could be better. They don't contain specific, actionable feedback. E.g. if a `pattern` doesn't match the user sees "Please match the requested format". It would be more useful to show "Please enter at least one number".

We need to know what _type_ of error occurred to show the right custom message. The `input.validity` property contains this information.

This interface has properties for every kind of error. For example an empty required input will show:

```js
{
  valueMissing: true,
  typeMismatch: false,
  patternMismatch: false,
  // ... etc
}
```

Here's a list of [all the validity properties](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).

We can write an `if`/`else` statement to check whether each property we're interested in is true. If it is we can show a custom error on the page:

```js
let message = "";
if (validity.valueMissing) {
  message = "Please enter an email address";
} else if (validity.typeMismatch) {
  // ...
}
```

### Challenge

1. Edit your `invalid` handler to check the `validity` interface
1. Show custom error messages based on the input's ID and what validation failed.

![Final solution](https://user-images.githubusercontent.com/9408641/90390317-09ebb000-e083-11ea-9bc5-06b465207690.png)

## Resources

- [Constraint Validation | MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) (built-in HTML validation)
- [Native form validation—part 1](https://medium.com/samsung-internet-dev/native-form-validation-part-1-bf8e35099f1d) (the limitations of HTML/CSS-only validation)
- [Required attribute requirements](https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/) (explains the JS/ARIA stuff we need for accessible validation)
- [Describing aria-describedby](https://developer.paciellogroup.com/blog/2018/09/describing-aria-describedby/) (summarises how `aria-describedby` works)
