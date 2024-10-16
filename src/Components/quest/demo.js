export const demo = [
  {
    name: "number",
    type: "text",
    title: "What is your age?",
    inputType: "number",
    min: 0,
    max: 100,
    defaultValue: 0,
    isRequired: true,
  },
  {
    type: "radiogroup",
    name: "car",
    title: "What is your gender?",
    isRequired: true,
    showNoneItem: false,
    showOtherItem: false,
    colCount: 1,
    choices: ["Female", "Male", "Other"],
    separateSpecialChoices: false,
    showClearButton: false,
  },
];
