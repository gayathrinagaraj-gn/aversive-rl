export const PHQ = [
  {
    type: "matrix",
    name: "PHQ9",
    isAllRowRequired: true,
    title:
      "For each question, select the answer that best describes how often have you been bothered by any of the following problems over the last 2 weeks.",
    columns: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" },
    ],
    rows: [
      { value: "PHQ_1", text: "Little interest or pleasure in doing things." },
      { value: "PHQ_2", text: "Feeling down, depressed, or hopeless." },
      {
        value: "PHQ_3",
        text: "Trouble falling or staying asleep, or sleeping too much.",
      },
      {
        value: "PHQ_4",
        text: "Feeling tired or having little energy.",
      },
      {
        value: "PHQ_5",
        text: "Poor appetite or overeating.",
      },
      {
        value: "PHQ_6",
        text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down.",
      },
      {
        value: "PHQ_7",
        text: "Trouble concentrating on things, such as reading the newspaper or watching television.",
      },
      {
        value: "PHQ_8",
        text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual.",
      },
      {
        value: "PHQ_9",
        text: "Thoughts that you would be better off dead, or of hurting yourself in some way.",
      },
    ],
  },
];
