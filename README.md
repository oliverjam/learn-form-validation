# Learn form validation

In this workshop you'll learn how to validate user input in the browser and present error messages accessibly.

## Setup

1. Clone this repo
1. Open `workshop/index.html` in your browser
1. This is the form we'll be adding validation to

## Why validate in the browser?

Client-side validation is important for a good user experience—you can quickly give the user feedback when they need to change a value they've entered. For example if passwords must be a certain length you can tell them immediately, rather than waiting for the form to submit to the server and receive an invalid response.

You _should not_ rely entirely on client-side validation however. You can never trust anything that happens in the browse: users can use devtools to mess with attributes and elements to bypass validation. You **always** need to validate user input on the server as well, for security.

## Requirements

Our form has two inputs: one for an email address and one for a password. These are the requirements we need to validate:

1. Both values are present
1. The email value is a valid email address
1. The password contains at least one number and letter, and is at least 8 characters long

Before we actually implement validation we need to make sure the user is aware of the requirements. There's nothing more frustrating than trying to guess what you need to do to be able to submit a form.

### Required values

Users generally expect required fields to be [marked with an asterix](https://www.nngroup.com/articles/required-fields/). We can add one inside the `<label>`. However this will cause screen readers to read out the label as "email star", which is not correct. We should wrap the asterix in an element with `aria-hidden="true"` to ensure it isn't read out.

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

Browsers support pretty complex validation on inputs:

```html
<label for="email">Password</label> <input type="email" id="email" required />
```

When a form containing the above input is submitted the browser will validate both that the user entered a value (because of the `required`) _and_ that the value is an email (because of the `type="email"). Here's a [full list of validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Intrinsic_and_basic_constraints).

You can even style inputs based on their validity using pseudo-classes like `:invalid`, `:valid` and `:required`.

### Advantages

- Very simple to implement
- Works without JavaScript

### Disadvantages

- Cannot change the styles
- Inputs are marked invalid before the user touches them
- [Not exposed to most screen readers](https://adrianroselli.com/2019/02/avoid-default-field-validation.html)

## Custom validation

We can hijack the browser's validation with JavaScript to show our own messages. It's important to associate the message with the right input—it might be obvious visually which message is for each input, but a screen reader user needs a programmatic connection.

We can use the `aria-describedby` attribute to provide descriptive information about an element:

```js
<label for="email">Password</label>
<input type="email" id="email" aria-describedby="emailError" aria-invalid="true" required>
<div id="emailError">Please enter an email</div>
```

Whenever this input is focused a screen reader will read out the label first, then the type of input, then any description. So in this case something like "Email, required invalid data edit text. (pause) Please enter an email".
