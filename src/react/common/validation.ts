// Validation for the fields of the forms
/* eslint-disable no-useless-escape */
export default values => {
  const errors = {};
  const min = 2;
  const max = 30;
  const textFields = ["firstname", "lastname", "city", "groupName"];
  const nonTextFields = [
    "number",
    "email",
    "limit",
    "cc",
    "hnumber",
    "street",
    "year",
    "month",
    "domain",
    "extension"
  ];
  const requiredCheck = [
    "unitid",
    "boughtplanid",
    "name",
    "numlicences",
    "price",
    "payfrequency",
    "payperiod",
    "cancelperiod",
    "cancelfrequency",
    "appid",
    "startdate",
    "appid",
    "country",
    "street"
  ];

  const numberCheck = ["payperiod", "cancelperiod"];

  const passwordFields = ["password", "passwordConfirm"];

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address!";
  }

  if (!/^([\d]{4}[\-]){3}[\d]{4}$/.test(values.number)) {
    errors.number = "Must be 16 digits long!";
  }

  if (!/^[A-Z]{2}$/.test(values.cc)) {
    errors.cc = "Must be a 2 digit country code!";
  }

  if (!/^[\d]{1,}\.[\d]{2}/.test(values.price)) {
    errors.price = "Price must be in this format: 12.99";
  }

  if (!values.developer) {
    errors["developer"] = "Required!";
  }

  if (!values.supportunit) {
    errors.supportunit = "Required!";
  }

  if (values.developer == values.supportunit && values.developer & values.supportunit) {
    const err = "Developer and Supportunit can't be the same one!";
    errors["developer"] = err;
    errors.supportunit = err;
  }

  if (!/^[A-Z]{2}/.test(values.country)) {
    errors.country = "Please enter a two-letter ISO-Code";
  }

  passwordFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Please enter a password!";
    } else if (values.password !== values.passwordConfirm) {
      errors[field] = "Passwords don't match!";
    }
  });

  if (values.options) {
    values.options.forEach(option => {
      if ((option.key && !option.value) || (!option.key && option.value)) {
        errors.options = { _error: "Please enter both fields!" };
      }
    });
  }

  textFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required!";
    } else if (values[field].length < min || values[field].length > max) {
      errors[field] = `Must be between ${min} and ${max} characters!`;
    } else if (/.*[0-9<>_%&()$%].*/.test(values[field])) {
      errors[field] = "No special characters allowed!";
    }
  });

  nonTextFields.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required!";
    } else if (/.*[_<>%&()$%].*/.test(values[field])) {
      errors[field] = "No special characters allowed!";
    }
  });

  requiredCheck.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required!";
    }
  });

  numberCheck.forEach(field => {
    if (values[field] && /[^\d]/g.test(values[field])) {
      errors[field] = "Only numbers allowed!";
    }
  });

  return errors;
};

export const domainValidation = {
  check: testValue => !/^[a-zA-Z0-9-]{1,}$/g.test(testValue),
  error: "Only characters and numbers and hyphens allowed!"
};
