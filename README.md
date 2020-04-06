# Learn form validation

In this workshop you'll learn how to validate user input in the browser and present error messages accessibly.

![final solution](https://user-images.githubusercontent.com/9408641/78499870-44475700-774b-11ea-8f3a-c2e8aae65090.gif)

## Setup

1. Clone this repo
1. Open `workshop/index.html` in your browser
1. This is the form we'll be adding validation to

## Why validate in the browser?

Client-side validation is important for a good user experience—you can quickly give the user feedback when they need to change a value they've entered. For example if passwords must be a certain length you can tell them immediately, rather than waiting for the form to submit to the server and receive an invalid response.

You _should not_ rely entirely on client-side validation however. You can never trust anything that happens in the browser: users can use devtools to mess with attributes and elements to bypass validation. You **always** need to validate user input on the server as well, for security.

## Requirements

Our form has two inputs: one for an email address and one for a password. These are the requirements we need to validate:

1. Both values are present
1. The email value is a valid email address
1. The password contains at least one number and letter, and is at least 8 characters long

Before we actually implement validation we need to make sure the user is aware of the requirements. There's nothing more frustrating than trying to guess what you need to do to be able to submit a form.

### Required values

Users generally expect required fields to be [marked with an asterisk](https://www.nngroup.com/articles/required-fields/). We can add one inside the `<label>`. However this will cause screen readers to read out the label as "email star", which is not correct. We should wrap the asterisk in an element with `aria-hidden="true"` to ensure it isn't read out.

#### Challenge

Add a required indicator to both inputs.

<details>
<summary>Solution</summary>

```html
<label for="email">
  Email
  <span aria-hidden="true">*</span>
</label>
<input id="email" />

<label for="password">
  Password
  <span aria-hidden="true">*</span>
</label>
<input id="password" />
```

</details>

### Different types of value

The "Email" label should be enough to communicate what should be entered in the first input, but the user currently has no idea what our password requirements are. It's important to provide this information.

We can just put a `<div>` after the label, but this won't be associated with the input (which means screen readers will ignore it). The `aria-describedby` attribute is used to provide descriptive information about an element: you provide it with one or more IDs of elements that _describe_ this one.

#### Challenge

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

<!-- insert devtools screenshot -->

## HTML5 validation

Now we need to tell the user when they enter invalid values. Browsers support pretty complex validation on inputs:

```html
<input type="email" id="email" required />
```

When a form containing the above input is submitted the browser will validate both that the user entered a value (because of the `required`) _and_ that the value is an email (because of the `type="email").

We can even specify a regex the value must match using the `pattern` attribute. This input will only be valid if it contains at least one digit.:

```html
<input type="password" id="password" required pattern=".*\d.*" />
```

Here's a [full list of validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Intrinsic_and_basic_constraints).

You can even style inputs based on their validity using CSS pseudo-classes like `:invalid`, `:valid` and `:required`.

### Challenge

Ensure each input meets our validation requirements above. If you submit the form with invalid values the browser should stop the submission and show a warning.

### Advantages

- Very simple to implement
- Works without JavaScript

### Disadvantages

- Cannot style the error messages
- [Not exposed to most screen readers](https://adrianroselli.com/2019/02/avoid-default-field-validation.html)
- Inputs are marked invalid before the user touches them
  - E.g. `input:invalid { border: 1px solid red; }` will make a `required` input red straight away

## Custom validation

The advantage of _starting_ with the HTML5 validation attributes is that if our JS fails to load or breaks the user at least gets basic validation. We should make sure to add all our custom attributes using JS, so they're only present if we have function custom validation.

First we need to disabled the native validation by setting the `novalidate` on the form element. This prevents the built-in errors from appearing.

```js
const form = document.querySelector("form");
form.setAttribute("novalidate", "");
```

Then we can listen for the form's `submit` event and check whether any inputs are invalid using `formElement.checkValidity()`.

```js
const allInputsValid = form.checkValidity();
```

This method returns true if _all_ inputs are valid, otherwise it returns false. If any of the inputs are invalid we want to call `event.preventDefault()` to stop the form from submitting.

The `checkValidity()` method also causes inputs that failed validation to fire an `invalid` event. We can add event listeners for this to our inputs, allowing us to run custom JS to show the right error message.

```js
const inputs = form.querySelectorAll("input");
inputs.forEach((input) => {
  input.addEventListener("invalid", handleInvalidInput);
});
```

We should also mark each input as valid for now—it's confusing for users to be told their inputs are invalid before they've tried entering anything. You can set `aria-invalid="false"` on each input to do this.

The final step is showing a custom message on the page depending on what type of validation error occured. We can access the "validity state" of an input via the `input.validity` property:

```js
function handleInvalidInput(event) {
  console.log(event.target.validity);
}
```

This interface has properties for every kind of error, with the value of each set to true if that error occurred. For example an empty required input will show: `{ valueMissing: true, typeMismatch: false, ... }`. Here's a list of [all the validity properties](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).

We can write an `if`/`else` statement to check whether each property we're interested in is true. If it is we can show a custom error on the page:

```js
let message = "";
if (validity.valueMissing) {
  message = "Please enter an email address";
} else if (validity.typeMismatch) {
  // ...
}
```

We should also communicate the invalid state of the input here by setting `aria-invalid="true"`.

We need to ensure our error message is associated with the correct input: we want it to be read out by a screen reader when the user focuses the input. We can achieve this using `aria-describedby` just like with our password requirements. It can take multiple IDs for multiple descriptions (the order of the IDs determines the order they will be read out).

```html
<input id="email" type="email" aria-describedby="emailError" required />
<div id="emailError">Please enter an email address</div>
```

Whenever this input is focused a screen reader will read out the label first, then the type of input, then any description. So in this case something like "Email, required invalid data edit text. (pause) Please enter an email address".

### Challenge

Let's implement custom validation.

1. Disable the native form validation
1. Listen for submit events and check whether all the inputs are valid
   - If they are not stop the form from submitting
1. Listen for invalid events on each input and update the page with a custom error
   - Make sure the error element is linked to the right input
   - Make sure the input is marked valid at first, then invalid when it fails validation

### Re-validating

Right now it's a little confusing for the user as the input stays marked invalid even when they type something new. We should mark each input as valid and remove the error message when the user inputs something.

1. Add an event listener for `input` events
1. Mark the input valid and remove the error message

## Styling

We have a functional, accessible solution now, but it could be improved with some styling. It's common to style validation messages with a "danger" colour like red, and sometimes to mark invalid inputs with a different coloured border. You could also use warning icons to make errors even more obvious.

### Challenge

1. Style the error messages
1. Style invalid inputs
1. Add any other styles you like to make it look good

![final solution](https://user-images.githubusercontent.com/9408641/78499870-44475700-774b-11ea-8f3a-c2e8aae65090.gif)

## Stretch: focus management

It's sometimes nice to focus the first invalid input in the form, so the user can immediately fix the problem. Add some code to your form's submit handler to find the first invalid input, then focus it.

## Resources

- [Constraint Validation | MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) (built-in HTML validation)
- [Native form validation—part 1](https://medium.com/samsung-internet-dev/native-form-validation-part-1-bf8e35099f1d) (the limitations of HTML/CSS-only validation)
- [Required attribute requirements](https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/) (explains the JS/ARIA stuff we need for accessible validation)
- [Describing aria-describedby](https://developer.paciellogroup.com/blog/2018/09/describing-aria-describedby/) (summarises how `aria-describedby` works)
