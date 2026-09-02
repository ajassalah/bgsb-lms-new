"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type QuizQuestion = {
  question?: string | null;
  question_type?: "single_radio" | "single_dropdown" | null;
  options?: string[] | null;
  correct_option?: string | null;
};

export function QuizQuestionDisplay({
  quizId,
  title,
  questions,
  persistenceKey,
}: {
  quizId: string;
  title: string;
  questions?: QuizQuestion[] | null;
  persistenceKey?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [answerStateReady, setAnswerStateReady] = useState(!persistenceKey);
  const item = questions?.[0];
  const question = item?.question || title;
  const options = Array.isArray(item?.options)
    ? item.options.filter(Boolean)
    : [];
  useEffect(() => {
    if (!persistenceKey) {
      setAnswerStateReady(true);
      return;
    }
    const stored = window.localStorage.getItem(
      `bgsb-quiz-correct-${persistenceKey}-${quizId}`,
    );
    if (stored !== null) {
      const answer = Number(stored);
      if (String(answer) === String(item?.correct_option)) {
        setSelected(answer);
        setSolved(true);
      }
    }
    setAnswerStateReady(true);
  }, [item?.correct_option, persistenceKey, quizId]);
  const checkAnswer = (selected: number) => {
    if (solved) return;
    setSelected(selected);
    if (String(selected) === String(item?.correct_option)) {
      setSolved(true);
      if (persistenceKey)
        window.localStorage.setItem(
          `bgsb-quiz-correct-${persistenceKey}-${quizId}`,
          String(selected),
        );
      toast.success("Congratulations! Your answer is correct.");
    } else toast.error("That answer is not correct. Please retry.");
  };
  const visibleOptions = solved
    ? options
        .map((option, index) => ({ option, index }))
        .filter(({ index }) => String(index) === String(item?.correct_option))
    : options.map((option, index) => ({ option, index }));

  if (!options.length) return null;

  if (!answerStateReady)
    return (
      <div className="mt-4 w-full max-w-2xl animate-pulse border-t border-violet-200 pt-3 dark:border-violet-800">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-11 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );

  return (
    <div className="mt-4 w-full max-w-2xl border-t border-violet-200 pt-3 dark:border-violet-800">
      <p className="mb-3 text-sm font-semibold text-navy dark:text-slate-100">
        {question}
      </p>
      {item?.question_type === "single_dropdown" ? (
        <select
          className="field appearance-none border-violet-200 bg-white text-slate-800 shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={selected === null ? "" : String(selected)}
          disabled={solved}
          aria-label={question}
          onChange={(event) => {
            if (event.target.value !== "")
              checkAnswer(Number(event.target.value));
          }}
        >
          <option value="">Select an answer</option>
          {visibleOptions.map(({ option, index }) => (
            <option key={index} value={index}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-2">
          {visibleOptions.map(({ option, index }) => (
            <label
              key={index}
              className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm dark:bg-slate-950 ${solved ? "cursor-default border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300" : "cursor-pointer border-violet-100 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}
            >
              <input
                type="radio"
                name={`quiz-${quizId}`}
                value={index}
                checked={selected === index}
                disabled={solved}
                onChange={() => checkAnswer(index)}
                className="size-4 shrink-0 accent-violet-600"
              />
              {option}
              {solved && <CheckCircle2 className="ml-auto size-4" />}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
